# Changelog

## Non rilasciato

- Larghezza dei dialog: `kit-dialog-sm` (340px), `kit-dialog-lg` (700px, uguale a `kit-dialog-wide`), `kit-dialog-xl` (960px) e `kit-dialog-full`; il token `--kit-dialog-w` (predefinito 440px) imposta una larghezza su misura, su un dialog o su tutti. Il dialog non supera mai la finestra.
- **Cambiamento non retrocompatibile:** la dimensione del testo ha solo 3 scelte e quella predefinita è più piccola. `md` (normale, predefinita) vale ora l'87,5% di prima, `lg` il 100% e `xl` il 112,5%; `sm` è stato tolto (un valore `sm` già salvato torna al normale). Il moltiplicatore predefinito `--kit-zoom` è `.875`. Chi preferiva il testo di prima sceglie «Grande» o imposta `--kit-zoom: 1`.

## 0.4.0 — 10 novembre 2026

- Font Inter incluso (`dist/fonts/inter-var.woff2`, 65 KB, licenza OFL) con zero barrato: lo zero non si confonde più con la "o". `font-variant-numeric: slashed-zero` è attivo su tutto il testo e sul codice. Il font di sistema resta come riserva.
- Testo più leggibile: interlinea 1,5 e dimensione minima di circa 13px. Le dimensioni sono in `rem` e la base `--kit-fs` cresce con lo schermo (15px fino a 1279px, poi 16, 17, 19 e 22px da 2560px).
- Dimensione del testo scelta dall'utente: `data-kit-fs="sm|md|lg|xl"` su `<html>`, `data-kit-fs-set` e `data-kit-fs-step` nei bottoni, `Kit.fontSize.get()/set()/step()`, evento `kit:fs`; la scelta viene ricordata.
- Altezza dei controlli (`--kit-ctl`), intestazione (`--kit-hh`), larghezza del contenuto (`--kit-container-w`) e icone passano da `px` a `rem`, così crescono con il testo.
- Pannello delle impostazioni (`kit-settings`): un menu a comparsa con tema, dimensione del testo e larghezza, che resta aperto dopo ogni scelta; `data-kit-reset` e `Kit.reset()` ripristinano i valori di partenza (evento `kit:reset`). Sostituisce i menu "Tema" e "Testo" nelle pagine della documentazione e nella dashboard di esempio.
- Tipografia: stile per `h1`–`h6` (e `kit-h1`–`kit-h6`), `kit-display-1`–`4`, `kit-lead`, `mark`, `small`, `abbr`, `kit-quote`, `kit-list-unstyled` e `kit-list-inline`, `kit-prose` per i testi lunghi. Nuove utility: `kit-fs-1`–`6`, `kit-fs-sm/lg`, `kit-fw-*`, `kit-fst-*`, `kit-lh-*`, `kit-ls-*`, `kit-uppercase/lowercase/capitalize`, `kit-mono`, `kit-underline`, `kit-line-through`, `kit-no-underline`, `kit-wrap`, `kit-break`, `kit-measure`, `kit-left`, `kit-ink`. Token nuovi: `--kit-lh`, `--kit-measure`, `--kit-h1`…`--kit-h6`. Nuova pagina "Tipografia" nella documentazione.
- **Cambiamento non retrocompatibile:** i titoli `<h1>`–`<h6>` senza classi hanno ora lo stile del kit (dimensioni dai token `--kit-h1`…`--kit-h6`, margine superiore 0, inferiore `.5em`, peso 650) invece di quello del browser. Per tornare al vecchio aspetto in un punto basta sovrascrivere `font-size` e `margin` sull'elemento. Anche `<small>` passa a `.875em`.
- Barre di scorrimento sottili e nei colori del tema, portate da Fatture Elettroniche Explorer: token `--kit-sb`, applicate a tutti gli elementi; `kit-no-scrollbar` nasconde la barra di un elemento che scorre.
- Contrasto nel tema chiaro (verificato su tutte le pagine, minimo 4,5:1): `--kit-mute` passa da `#6a7587` a `#5f6a7c` (sui fondi tinti e sulla pagina il vecchio valore era sotto soglia), e i colori di stato diventano un po' più scuri: `--kit-success` `#147236`, `--kit-warning` `#8f5200`, `--kit-danger` `#b0301f` (nei badge il testo era a 3,2–4,1:1). Il tema scuro non cambia. Chi ha sovrascritto questi token non è toccato.
- Corretto: lo zero non era barrato nei blocchi di codice (`kit-code`) e nei toast, perché la scorciatoia `font:` azzera `font-variant-numeric`.
- Corretto: i tooltip (`data-kit-tip`) restavano nella pagina come elementi trasparenti e, vicino al bordo, facevano comparire lo scroll orizzontale sui telefoni; a riposo ora sono `display: none` (con la transizione di `display`, `allow-discrete`: in Firefox 120–128 compaiono senza dissolvenza).
- Navbar: `kit-navbar` sull'intestazione, con `kit-brand`, `kit-nav` e `kit-nav-link` per le voci (corrente con `aria-current`, anche disattivate o con icona e badge), voci a tendina (`kit-dropdown` dentro il `<li>`), `kit-navbar-menu` e `kit-navbar-toggler` (`data-kit-nav="#id"`) per il menu a scomparsa, `kit-navbar-actions` per ciò che resta sempre visibile, `kit-navbar-expand-sm|md|lg|xl` per il punto da cui il menu è in linea, `kit-nav-col` per l'elenco verticale. Esc, click fuori e scelta di un link chiudono il menu; nel menu aperto le tendine si aprono in linea. La navbar si allinea al contenuto con `kit-container`, `kit-container-boxed` o `kit-container-fluid` dentro l'intestazione (esempi dal vivo e tabella nella pagina). Nuova pagina "Navbar" nella documentazione.
- Corretto: i toast impilati saltavano. Il toast che si chiudeva restava nel layout per 250ms e poi spariva di colpo, e quando ne arrivava uno i vicini scattavano. Ora il toast in uscita si dissolve fuori dal flusso e gli altri scorrono al nuovo posto (220ms; con `prefers-reduced-motion` senza animazione). Anche il toast più vecchio, quando se ne superano 6, esce con la dissolvenza. Un toast da solo, uscendo, non scende più di colpo: resta dov'era mentre si dissolve. Su schermi bassi la pila dei toast non esce più dalla finestra: se non ci stanno tutti, esce il più vecchio.
- Toast: il limite di toast contemporanei passa da 4 a 6, e in fondo a ogni toast con durata compare una barra che si accorcia fino alla chiusura (`kit-toast-bar`; `progress: false` la toglie). Quando il mouse o il focus fermano il tempo, la barra torna piena e riparte da capo insieme al conto.
- Conferme: `Kit.confirm(domanda, { text, confirm, cancel, danger, type })` apre un dialog di conferma (`role="alertdialog"`) e restituisce una promessa `true`/`false`; con `danger` il bottone è rosso (`kit-btn-danger-solid`) e il focus parte su "Annulla"; con `type` bisogna digitare un testo per abilitare la conferma. `data-kit-confirm` (+ `-text`, `-ok`, `-cancel`, `-danger`, `-type`) fa lo stesso su bottoni, link e form senza JavaScript, prima dei tuoi gestori di click. `Kit.undo(testo, { onUndo, onCommit })` esegue l'azione subito e offre "Annulla" in un toast; `onCommit` parte se non si annulla. `Kit.toast` accetta `onClose`. Nuova sezione "Chiedere conferma" in "Dialog e menu".
- Animazione dei dialog: comparsa e scomparsa con dissolvenza, leggero scivolamento e sfondo che si scurisce (0,18 s, disattivata con `prefers-reduced-motion`; serve Chrome 117, Safari 17.4 o Firefox 129, altrove nessuna animazione).
- `a.kit-brand` non ha più sottolineatura né colore del link.
- Il × del chip è più leggibile (sfondo più leggero e, al passaggio del mouse, testo con il colore `--kit-accent-ink`).
- Documentazione: il grafico della dashboard scorre in orizzontale sotto i 600px invece di rimpicciolire le etichette (ora 12px), e il codice in linea va a capo.
- Nuova icona `text`; nelle pagine della documentazione c'è il menu "Testo".

## 0.3.0 — 9 novembre 2026

- Menu a comparsa (`kit-pop`) utilizzabile da solo: voci `kit-opt` come `<button>`, `<a>` o `<div>`, `kit-opt-danger`, `kit-pop-sep`, `kit-pop-up` (si apre verso l'alto), `kit-pop-static` (sempre visibile) e `kit-btn-split` (bottone diviso).
- Le voci disattivate (`aria-disabled="true"`) si saltano con le frecce; Invio attiva la voce come un click vero (gestori e link compresi).
- Il selettore del tema usa `aria-checked` e la spunta sulla voce attiva (prima `aria-pressed`, non adatto a `menuitemradio`).
- Toast estesi: `Kit.toast(testo, { type, title, duration, position, action, closable })`, più toast impilati (max 4), icona dallo sprite, bottone d'azione ("Annulla"), chiusura con ×, timer in pausa su mouse e focus, `Kit.toast.clear()` e `close()`. Il toast neutro resta invertito rispetto al tema; quelli per tipo riempiono tutto lo sfondo con il colore dello stato; sono più alti (min 60px). Il secondo argomento numerico (durata) funziona ancora; la durata di base passa da 2,5 a 4 secondi.
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
