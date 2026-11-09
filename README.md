# Dashboard Kit

Framework CSS (+ JS opzionale) per dashboard, estratto da *Fatture Elettroniche Explorer*.
Un file CSS, nessuna dipendenza, nessuna build. Tema chiaro e scuro con `light-dark()`.

```html
<link rel="stylesheet" href="dist/kit.css">
<script src="dist/kit.js"></script> <!-- opzionale: tema, select, popover, tab, dialog, toast -->
```

Vedi tutti i componenti in `docs/index.html` (aprilo nel browser).

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
