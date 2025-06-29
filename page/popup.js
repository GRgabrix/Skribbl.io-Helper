document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0]?.url || '';
    const isSkribbl = url.startsWith('https://skribbl.io');

    const langContainer = document.getElementById('language-container');
    const nonSkribbl = document.getElementById('non-skribbl');

    if (isSkribbl) {
      langContainer.style.display = 'block';
      nonSkribbl.style.display = 'none';

      const select = document.getElementById('language');

      chrome.storage.sync.get(['language'], ({ language }) => {
        const defaultLanguage = 'it';
        select.value = language || defaultLanguage;
        if (!language) {
          chrome.storage.sync.set({ language: defaultLanguage });
        }
      });

      select.addEventListener('change', () => {
        chrome.storage.sync.set({ language: select.value });
      });

    } else {
      langContainer.style.display = 'none';
      nonSkribbl.style.display = 'block';
    }
  });
});
