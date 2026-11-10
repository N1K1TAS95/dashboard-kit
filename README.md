# Dashboard Kit

Framework CSS (+ JS opzionale) per dashboard, estratto da *Fatture Elettroniche Explorer*.
Un file CSS, nessuna dipendenza, nessuna build. Tema chiaro e scuro con `light-dark()`.

## Uso

Da CDN (jsDelivr), fissando sempre una versione:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.6.0/dist/kit.css"
      integrity="sha384-UM+h/pI3cVqXLQDqTV/zEgri3iR0pBxNEOP7yi88U9WUk0zMQU1NjcbG9XslmUfU"
      crossorigin="anonymous">
<!-- opzionale: tema, select, popover, tab, dialog, toast -->
<script src="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.6.0/dist/kit.js"
        integrity="sha384-r07DKcO/cdBQGJXM/OVO7vFzZIUprFnCLXiejxKv00JN7b7y+43N1PcMRZAcWS2x"
        crossorigin="anonymous"></script>
<!-- opzionale: le icone (sprite SVG inserito nella pagina) -->
<script src="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.6.0/dist/kit-icons.js"
        integrity="sha384-PCYmDMAsjPbQ1IBjABjLf51f2PwcqnPNlvwglhokh27UvWcJlz3wV1806KXPWgfH"
        crossorigin="anonymous"></script>
```

L'attributo `integrity` (SRI) fa rifiutare al browser un file diverso da quello atteso. Vale solo per la versione indicata:
a ogni nuova versione l'hash cambia. Per ricalcolarlo: `./sri.sh`.

Oppure in locale, copiando i file di `dist/`:

```html
<link rel="stylesheet" href="dist/kit.css">
<script src="dist/kit.js"></script>
<script src="dist/kit-icons.js"></script>
```

Se il sito ha una Content-Security-Policy, ricordati di autorizzare `https://cdn.jsdelivr.net`
in `style-src` e `script-src`.

**Documentazione:** https://n1k1tas95.github.io/dashboard-kit/ (in locale: `docs/index.html`), con una pagina per argomento:
introduzione, JavaScript, layout, griglia, utility, bottoni, form, navigazione, navbar, schede, tabelle, contenuti, feedback (avvisi, badge),
dialog e menu, icone, temi e token, snippet VS Code. Ogni esempio ha il suo codice da copiare.

## Larghezza del contenuto
`kit-container` è centrato (largo al massimo `--kit-container-w`, di base 1200px); `kit-container-fluid` è sempre a tutta
larghezza e `kit-container-boxed` è sempre centrato. L'interruttore globale `<html data-layout="boxed|fluid">` decide per tutti
i `kit-container`; con `kit.js` l'utente lo cambia da un bottone (`data-kit-layout-toggle`, `Kit.layout.set("fluid")`) e la scelta
viene ricordata. Un `kit-container` dentro `kit-header` allinea l'intestazione al contenuto.

## Griglia
Griglia a 12 colonne con flexbox, con gli stessi nomi di Bootstrap (prefisso `kit-`):

```html
<div class="kit-row">
  <div class="kit-col-12 kit-col-md-6 kit-col-xl-3">…</div>
  <div class="kit-col-12 kit-col-md-6 kit-col-xl-3">…</div>
</div>
```

- Breakpoint (mobile first): `sm` 576, `md` 768, `lg` 992, `xl` 1200.
- Colonne: `kit-col`, `kit-col-auto`, `kit-col-N`, `kit-col-{bp}-N`; `kit-row-cols-N`; `kit-offset-N`; `kit-order-*`.
- Gutter: `kit-g-0…5`, `kit-gx-*`, `kit-gy-*`. Di base seguono `--kit-sp`.
- Tipografia: titoli, `kit-display-*`, `kit-lead`, `kit-quote`, `kit-prose` e utility `kit-fs-*`, `kit-fw-*`, `kit-lh-*`, `kit-uppercase`.
- Utility flex e spazi: `kit-d-*`, `kit-flex-*`, `kit-justify-content-*`, `kit-align-items-*`, `kit-gap-*`, `kit-m*-N`, `kit-p*-N`, `kit-w-100`, `kit-h-100`.
- `kit-bar` è la barra di elementi affiancati (toolbar), diversa da `kit-row` della griglia.
- Un esempio completo è in `docs/dashboard.html`.

Il blocco della griglia in `dist/kit.css` è **generato**: per cambiare breakpoint, scala degli spazi o numero di colonne
modifica le costanti in `tools/gen-grid.py` e lancia `python3 tools/gen-grid.py`.

## Lavorare sul progetto
- `dist/kit.css`, `dist/kit.js`: il framework, scritto a mano (tranne il blocco della griglia, vedi sopra).
- `docs/src/*.html`: il **contenuto** delle pagine di documentazione. Le pagine in `docs/*.html` sono **generate**:
  dopo una modifica lancia `python3 tools/gen-docs.py` (aggiunge menu, indici, link avanti/indietro, tabelle dei token e degli
  snippet, e gli hash SRI della versione indicata in `VERSION`).
- Per aggiungere una pagina: crea `docs/src/nome.html` con le righe `<!--title: …-->` e `<!--desc: …-->` e inseriscila in `NAV`
  dentro `tools/gen-docs.py`.
- Gli esempi sono `<div class="doc-demo">…</div>`: il codice sotto si genera da solo dal loro contenuto.

## Cosa c'è
Layout (header, container, grid, split), navbar (voci, menu a tendina, menu a scomparsa), card, schede KPI, bottoni, form, segmented, pill, chip, badge,
tab, statistiche, tabella, stati vuoti, chiave/valore, progress, select, combobox con suggerimenti, campo file e zona di rilascio, avanzamento, grafici (barre, linee, ciambella, sparkline), popover/menu,
drawer, pannello affiancato, dialog (anche di conferma), toast con annulla, utility.

## Personalizzare
Tutto passa dai token `--kit-*` (colori, `--kit-sp`, `--kit-rad`, `--kit-rad-sm`, `--kit-row`, `--kit-ctl`…):
sovrascrivili in `:root`. Tema forzato con `<html data-theme="light|dark">`.

## Compatibilità
`light-dark()` richiede Chrome/Edge 123+, Safari 17.5+, Firefox 120+.

## Sicurezza
Il JS non usa `innerHTML`, `eval` né script inline: funziona con `script-src 'self'`.
