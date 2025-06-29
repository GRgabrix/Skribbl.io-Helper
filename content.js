(() => {
  let originalToolbarHTML = null;
  let originalToolbarStyle = null;
  let currentRole = 'waiting';
  let parolaAutoInviata = false;

  let lettere = [];
  let parolePerLunghezza = [];

  function getRole() {
    const desc = document.querySelector('#game-word .description');
    if (desc) {
      const text = desc.textContent.trim();
      if (text === 'DRAW THIS') return 'drawer';
      if (text === 'GUESS THIS') return 'guesser';
      return 'waiting';
    }
  }

  function saveOriginalToolbarState(toolbar) {
    if (!originalToolbarHTML) {
      originalToolbarHTML = toolbar.innerHTML;
      originalToolbarStyle = toolbar.getAttribute('style');
    }
  }

  function restoreOriginalToolbar(toolbar) {
    if (originalToolbarHTML !== null) {
      toolbar.innerHTML = originalToolbarHTML;
    }
    if (originalToolbarStyle !== null) {
      toolbar.setAttribute('style', originalToolbarStyle);
    } else {
      toolbar.removeAttribute('style');
    }
    parolaAutoInviata = false;
  }

  function loadWordList() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['language'], ({ language }) => {
        const path = `wordlists/wordlist-${language}/wordlist-${language}.txt`;
        const url = chrome.runtime.getURL(path);

        fetch(url)
          .then(res => {
            if (!res.ok) throw new Error(`Impossibile caricare ${path}`);
            return res.text();
          })
          .then(text => {
            lettere = [];
            parolePerLunghezza = [];
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

            for (const line of lines) {
              const parts = line.split(',');
              if (parts.length > 1) {
                const len = parseInt(parts[0], 10);
                if (!isNaN(len)) {
                  lettere.push(len);
                  const parole = parts.slice(1).map(p => p.trim()).filter(p => p.length > 0);
                  parole.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
                  parolePerLunghezza.push(parole);
                }
              }
            }
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  function suggerisciParole() {
    const hintContainer = document.querySelector("#game-word .hints .container");
    if (!hintContainer) return [];

    const hintElements = hintContainer.querySelectorAll(".hint");
    const hints = Array.from(hintElements).map(h => h.textContent.trim());

    const totalLength = hints.filter(c => c !== '').length;

    let pattern = [];
    let lettereConosciute = [];
    let currentWord = [];
    hints.forEach((c, i) => {
      if (c !== '') {
        currentWord.push(c);
      } else {
        if (currentWord.length > 0) {
          pattern.push(currentWord.length);
          lettereConosciute.push([...currentWord]);
          currentWord = [];
        }
      }
    });
    if (currentWord.length > 0) {
      pattern.push(currentWord.length);
      lettereConosciute.push([...currentWord]);
    }

    const index = lettere.indexOf(totalLength);
    if (index === -1) return [];

    const parole = parolePerLunghezza[index];

    return parole.filter(frase => {
      const paroleFrase = frase.split(" ");
      if (paroleFrase.length !== pattern.length) return false;

      for (let i = 0; i < pattern.length; i++) {
        const parola = paroleFrase[i];
        if (parola.length !== pattern[i]) return false;

        for (let j = 0; j < parola.length; j++) {
          const charConosciuto = lettereConosciute[i][j];
          if (charConosciuto !== '_' && charConosciuto.toLowerCase() !== parola[j].toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });
  }

  function setupGuesserToolbar() {
    const toolbar = document.getElementById('game-toolbar');
    if (!toolbar) return;

    saveOriginalToolbarState(toolbar);

    toolbar.style = `
      background-color: white;
      color: black;
      padding: 10px;
      font-size: 18px;
      font-weight: bold;
      text-align: left;
      border-radius: 3px;
      height: auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      user-select: none;
      overflow-x: hidden;
      margin-bottom: 8px;
    `;
    toolbar.textContent = '';

    const hintContainer = document.querySelector("#game-word .hints .container");
    const hintElements = hintContainer ? hintContainer.querySelectorAll(".hint") : [];
    const allHintsRevealed = Array.from(hintElements).every(h => {
      const t = h.textContent.trim();
      return t !== '_' && t !== '';
    });

    if (allHintsRevealed) {
      const indexZero = lettere.indexOf(0);
      const msg = document.createElement('div');
      msg.textContent = parolePerLunghezza[indexZero][1];
      toolbar.appendChild(msg);
      return;
    }

    const suggerite = suggerisciParole();

    if (suggerite.length === 0) {
      const indexZero = lettere.indexOf(0);
      const msg = document.createElement('div');
      msg.textContent = parolePerLunghezza[indexZero][0];
      toolbar.appendChild(msg);
    } else {
      if (suggerite.length === 1 && !parolaAutoInviata) {
        parolaAutoInviata = true;
        const word = suggerite[0];
        const chatForm = document.querySelector('#game-chat form.chat-form');
        if (chatForm) {
          const input = chatForm.querySelector('input[type="text"]');
          if (input) {
            input.value = word;
            chatForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }
      } else {
        suggerite.forEach(word => {
          const btn = document.createElement('button');
          btn.textContent = word;
          btn.style = `
            height: 40px;
            padding: 0 12px;
            font-size: 16px;
            cursor: pointer;
            border: 1px solid black;
            border-radius: 3px;
            background-color: white;
            color: black;
            white-space: nowrap;
            margin: 4px 6px 4px 0;
          `;
          btn.addEventListener('click', () => {
            const chatForm = document.querySelector('#game-chat form.chat-form');
            if (chatForm) {
              const input = chatForm.querySelector('input[type="text"]');
              if (input) {
                input.value = word;
                chatForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }
            }
          });
          toolbar.appendChild(btn);
        });
      }
    }
  }

  function onGameWordChanged() {
    const role = getRole();
    if (role !== currentRole) {
      currentRole = role;
      const toolbar = document.getElementById('game-toolbar');
      const gameWrapper = document.getElementById('game-wrapper');
      if (role === 'guesser') {
        parolaAutoInviata = false;
        if (gameWrapper) {
          gameWrapper.classList.remove('toolbar-hidden');
        }
        setupGuesserToolbar();
      } else if (role === 'waiting' && toolbar) {
        restoreOriginalToolbar(toolbar);
      } else if (role === 'drawer' && toolbar) {
        restoreOriginalToolbar(toolbar);
      }
    } else if (role === 'guesser') {
      setupGuesserToolbar();
    }
  }

  function observeGameWordChanges() {
    const targetNode = document.getElementById('game-word');
    if (!targetNode) return;

    const observer = new MutationObserver(() => {
      onGameWordChanged();
    });

    observer.observe(targetNode, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  loadWordList()
    .then(() => {
      onGameWordChanged();
      observeGameWordChanges();
    })
    .catch(err => {
      onGameWordChanged();
      observeGameWordChanges();
    });
})();
