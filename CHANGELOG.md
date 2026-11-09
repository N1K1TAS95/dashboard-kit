# Changelog

## Non ancora rilasciato (0.2.1)

- Menu a comparsa (`kit-pop`) utilizzabile da solo: voci `kit-opt` come `<button>`, `<a>` o `<div>`, `kit-opt-danger`, `kit-pop-sep`, `kit-pop-up` (si apre verso l'alto), `kit-pop-static` (sempre visibile) e `kit-btn-split` (bottone diviso).
- Le voci disattivate (`aria-disabled="true"`) si saltano con le frecce; Invio attiva la voce come un click vero (gestori e link compresi).
- Il selettore del tema usa `aria-checked` e la spunta sulla voce attiva (prima `aria-pressed`, non adatto a `menuitemradio`).
- Tooltip solo CSS con `data-kit-tip` e `data-kit-tip-pos` (top, bottom, left, right); compare con il mouse e con il focus, Esc lo nasconde.
- Documentazione: esempio del selettore del tema in "Temi e token", nuovi esempi di menu in "Dialog e menu".

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
