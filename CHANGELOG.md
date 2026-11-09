# Changelog

## 0.2.0

### Novità
- Griglia a 12 colonne con flexbox (`kit-row`, `kit-col-*`, offset, order, gutter) e utility flex/spazi/display, con gli stessi nomi di Bootstrap.
- Larghezza del contenuto: `kit-container`, `kit-container-boxed`, `kit-container-fluid`, interruttore `data-layout` e `Kit.layout`.
- Avvisi `kit-alert` (varianti, titolo, icona, chiusura con `data-kit-dismiss`).
- Icone: sprite SVG di 40 icone, `dist/kit-icons.js` e `dist/kit-icons.svg`.
- Documentazione divisa in pagine per argomento, con codice copiabile sotto ogni esempio.
- Snippet per VS Code (`vscode/dashboard-kit.code-snippets`).
- Token `--kit-rad-sm` (raggio dei controlli) accanto a `--kit-rad` (raggio delle superfici).
- Con un dialog modale aperto la pagina sotto non scorre.

### Cambiamenti non retrocompatibili
- La barra di elementi affiancati si chiama ora `kit-bar`: `kit-row` è la riga della griglia.
- `kit-dialog` usa la struttura delle card: `kit-card-head` / `kit-card-body` / `kit-card-foot`. Il titolo `<h2>` come figlio diretto non è più previsto.
- Header, contenuto principale, tabelle e blocchi hanno margini laterali uguali a `--kit-sp`.
- Campi, segmented e select passano da 10px a `--kit-rad-sm` (8px); blocchi di codice e toast a `--kit-rad` (12px).

## 0.1.0
Prima versione: token, bottoni, form, tabelle, schede, navigazione, dialog, toast e JavaScript opzionale.
