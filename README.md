# ![logo](/icons/icon48.png) Skribbl.io Helper

Questo progetto fornisce uno script per facilitare il gioco su [skribbl.io](https://skribbl.io/) suggerendo automaticamente parole in base agli spazi vuoti visibili e alle lettere già note, migliorando notevolmente la velocità con cui si può indovinare la parola.

---

## Caratteristiche principali

- **Rilevamento automatico degli spazi e lettere**: legge il numero di lettere e le posizioni note direttamente dall'interfaccia del gioco.
- **Suggerimenti intelligenti**: filtra e propone parole compatibili in tempo reale da una lista predefinita.
- **Interfaccia compatta integrata**: mostra i suggerimenti direttamente nella pagina di gioco senza disturbare l’esperienza visiva.
- **Aggiornamento dinamico**: aggiorna i suggerimenti ogni volta che viene inserita una nuova lettera corretta o rivelata una posizione.

---

## Uso

1. **Installazione**

   - Vai nella sezione [Releases](https://github.com/GRgabrix/Skribbl.io-Helper/releases)
   - Scarica l’ultima versione disponibile (`.zip`)
   - Estrai l’archivio in una cartella
   - Apri `chrome://extensions/` e attiva la "Modalità sviluppatore"
   - Clicca su “Carica estensione non pacchettizzata” e seleziona la cartella estratta

2. **Avvio**

   - Vai su [skribbl.io](https://skribbl.io/)
   - Lo script sarà attivo automaticamente e mostrerà i suggerimenti nella parte inferiore dello schermo durante il turno di disegno degli altri nella lingua selezionata dal menù dell'estensione

---

## Struttura principale del codice

- **Rilevatore di parole (`wordPattern`)**  
  Analizza la barra delle lettere (es. `_ _ a _ _`) e costruisce una regex per filtrare parole compatibili.

- **Parole predefinite (`words.js`)**  
  Contiene il dizionario completo utilizzato per cercare e ordinare i suggerimenti.

- **Sistema di aggiornamento**  
  Si attiva su eventi di modifica dell’interfaccia e aggiorna i risultati in tempo reale.

- **Interfaccia utente (`ui.js`)**  
  Aggiunge un piccolo box nella pagina che mostra i suggerimenti ordinati, reagendo ai cambiamenti nel gioco.

---

## Dipendenze

- Nessuna libreria esterna richiesta.  
- Tutto funziona tramite JavaScript e interazioni con il DOM della pagina.

---

## Possibili miglioramenti da apportare

- Evidenziare le lettere mancanti nei suggerimenti
- Supporto a lingue diverse dall’italiano

---

## Licenza

Il codice è open-source e può essere modificato e distribuito liberamente in forma gratuita.

---

Se hai domande o vuoi contribuire, scrivi pure!
