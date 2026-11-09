# Dashboard Kit

Framework CSS (+ JS opzionale) per dashboard, estratto da *Fatture Elettroniche Explorer*.
Un file CSS, nessuna dipendenza, nessuna build. Tema chiaro e scuro con `light-dark()`.

## Uso

Da CDN (jsDelivr), fissando sempre una versione:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.1.0/dist/kit.css"
      integrity="sha384-0PxdPdnbHL4DneHj11AiF7rWsiYOHTsr0WrGv5jOkjK+ugFFWMhh/GPx7fatxLW4"
      crossorigin="anonymous">
<!-- opzionale: tema, select, popover, tab, dialog, toast -->
<script src="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.1.0/dist/kit.js"
        integrity="sha384-4Rrpq/cbUWuEzbDlrLT1lYOgZDnM7gfD6Qbq8qlOz2GIaGbl6zjvKsW4FQ/KtGSj"
        crossorigin="anonymous"></script>
```

L'attributo `integrity` (SRI) fa rifiutare al browser un file diverso da quello atteso. Vale solo per la versione indicata:
a ogni nuova versione l'hash cambia. Per ricalcolarlo: `./sri.sh`.

Oppure in locale, copiando i file di `dist/`:

```html
<link rel="stylesheet" href="dist/kit.css">
<script src="dist/kit.js"></script>
```

Se il sito ha una Content-Security-Policy, ricordati di autorizzare `https://cdn.jsdelivr.net`
in `style-src` e `script-src`.

**Demo e componenti:** https://n1k1tas95.github.io/dashboard-kit/ (in locale: `docs/index.html`).

## Cosa c'è
Layout (header, container, grid, split), card, bottoni, form, segmented, pill, chip, badge,
tab, statistiche, tabella, stati vuoti, chiave/valore, progress, select, popover/menu,
dialog, toast, utility.

## Personalizzare
Tutto passa dai token `--kit-*` (colori, `--kit-sp`, `--kit-rad`, `--kit-row`, `--kit-ctl`…):
sovrascrivili in `:root`. Tema forzato con `<html data-theme="light|dark">`.

## Compatibilità
`light-dark()` richiede Chrome/Edge 123+, Safari 17.5+, Firefox 120+.

## Sicurezza
Il JS non usa `innerHTML`, `eval` né script inline: funziona con `script-src 'self'`.
