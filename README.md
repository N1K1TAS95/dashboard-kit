# Dashboard Kit

[Italiano](README.it.md) · [Changelog](CHANGELOG.md) · [Security](SECURITY.md)

A CSS framework (+ optional JavaScript) for dashboards, extracted from *Fatture Elettroniche Explorer*.
One CSS file, no dependencies, no build step. Light and dark themes with `light-dark()`.
Built-in texts in English and Italian, with a dictionary you can extend to any language (see [Languages](#languages)).

## Usage

From a CDN (jsDelivr), always pinning a version:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.10.0/dist/kit.css"
      integrity="sha384-znCaG7h9kJLl62DAiNyMb9OH8yUsmerFcqlRH1huU4THVZIEyiT8s07zyKW3j/bK"
      crossorigin="anonymous">
<!-- optional: theme, select, popover, tabs, dialog, toast -->
<script src="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.10.0/dist/kit.js"
        integrity="sha384-fbNechVbNbbPmseKnAJ62Qb2vL1czSfMXDSfKv712orjPLaZzs9Ju6XQRPJ2IGMn"
        crossorigin="anonymous"></script>
<!-- optional: the icons (an SVG sprite inserted into the page) -->
<script src="https://cdn.jsdelivr.net/gh/N1K1TAS95/dashboard-kit@v0.10.0/dist/kit-icons.js"
        integrity="sha384-PCYmDMAsjPbQ1IBjABjLf51f2PwcqnPNlvwglhokh27UvWcJlz3wV1806KXPWgfH"
        crossorigin="anonymous"></script>
```

The `integrity` attribute (SRI) makes the browser reject a file different from the expected one. It only holds for the
version in the URL: the hash changes with every release. To recompute it: `./sri.sh`.

Or locally, by copying the files in `dist/`:

```html
<link rel="stylesheet" href="dist/kit.css">
<script src="dist/kit.js"></script>
<script src="dist/kit-icons.js"></script>
```

If your site has a Content-Security-Policy, remember to allow `https://cdn.jsdelivr.net`
in `style-src` and `script-src`.

**Documentation:** https://n1k1tas95.github.io/dashboard-kit/ (locally: `docs/en/index.html`), one page per topic:
introduction, JavaScript, layout, grid, utilities, buttons, forms, navigation, navbar, sidebar, tabs, tables, content, feedback (alerts, badges),
dialogs and menus, icons, themes and tokens, VS Code snippets. Every example has its copyable code.
*The documentation is available in English and Italian (menu: "Italiano" / "English"); the English translation is in progress and pages not yet translated open in Italian. Class names, attributes and code are the same in both.*

## Languages

The texts `kit.js` writes by itself (button labels, ARIA labels, "No results", pagination, the calendar) come from a
dictionary per language. English (the default) and Italian are built in. The language is the one in `<html lang="…">`;
without it, English is used.

```html
<html lang="it">   <!-- Italian texts, dd/mm/yyyy dates, weeks starting on Monday -->
```

```js
Kit.i18n.lang("it");                                   // set it by hand
Kit.i18n.add("de", { cancel: "Abbrechen", noResults: "Keine Ergebnisse" });   // add a language (only what differs; the rest falls back to English)
Kit.i18n.add("en-GB", { date: { order: "dmy", first: 1 } });                 // a regional variant
```

The language also drives the date order, the first day of the week, and the decimal separator used to sort
numeric table columns. Attributes and options (`data-kit-empty`, `Kit.confirm(…, { cancel })`) always win over the dictionary.
Translations of other languages are welcome as pull requests: the full model is the `I18N.en` object at the top of `dist/kit.js`.

## Content width
`kit-container` is centered (at most `--kit-container-w` wide, 1200px by default); `kit-container-fluid` is always full
width and `kit-container-boxed` is always centered. The global switch `<html data-layout="boxed|fluid">` decides for all
`kit-container`s; with `kit.js` the user changes it from a button (`data-kit-layout-toggle`, `Kit.layout.set("fluid")`) and the
choice is remembered. A `kit-container` inside `kit-header` aligns the header with the content.

## Grid
A 12-column flexbox grid, with the same names as Bootstrap (prefix `kit-`):

```html
<div class="kit-row">
  <div class="kit-col-12 kit-col-md-6 kit-col-xl-3">…</div>
  <div class="kit-col-12 kit-col-md-6 kit-col-xl-3">…</div>
</div>
```

- Breakpoints (mobile first): `sm` 576, `md` 768, `lg` 992, `xl` 1200.
- Columns: `kit-col`, `kit-col-auto`, `kit-col-N`, `kit-col-{bp}-N`; `kit-row-cols-N`; `kit-offset-N`; `kit-order-*`.
- Gutters: `kit-g-0…5`, `kit-gx-*`, `kit-gy-*`. By default they follow `--kit-sp`.
- Typography: headings, `kit-display-*`, `kit-lead`, `kit-quote`, `kit-prose` and the utilities `kit-fs-*`, `kit-fw-*`, `kit-lh-*`, `kit-uppercase`.
- Flex and spacing utilities: `kit-d-*`, `kit-flex-*`, `kit-justify-content-*`, `kit-align-items-*`, `kit-gap-*`, `kit-m*-N`, `kit-p*-N`, `kit-w-100`, `kit-h-100`.
- `kit-bar` is the row of side-by-side elements (a toolbar), different from the grid's `kit-row`.
- A complete example is in `docs/dashboard.html`.

The grid block in `dist/kit.css` is **generated**: to change breakpoints, the spacing scale or the number of columns,
edit the constants in `tools/gen-grid.py` and run `python3 tools/gen-grid.py`.

## Working on the project
- `dist/kit.css`, `dist/kit.js`: the framework, written by hand (except the grid block, see above).
- `docs/src/<lang>/*.html` (`en`, `it`): the **content** of the documentation pages, one folder per language. The pages in `docs/<lang>/*.html`
  are **generated**: after a change run `python3 tools/gen-docs.py` (it adds the menu, indexes, previous/next links, the token and
  snippet tables, the search index and the SRI hashes of the version set in `VERSION`). A page that exists only in `docs/src/it/`
  is shown in the English menu with an "IT" badge and links to the Italian version, so translating is incremental: add the file
  to `docs/src/en/` and it takes over.
- To add a page: create `docs/src/it/name.html` (and `docs/src/en/name.html`) with the lines `<!--title: …-->` and `<!--desc: …-->`,
  and add it to `NAV_IT` and `NAV_EN` in `tools/gen-docs.py`.
- Examples are `<div class="doc-demo">…</div>`: the code below is generated from their content.

## What's included
Layout (header, container, grid, split), navbar (items, dropdown menus, collapsible menu), cards, KPI cards, buttons, forms, segmented controls, pills, chips, badges,
tabs, statistics, tables (sorting, filtering, pagination, sticky header and columns), empty states, key/value lists, progress and meter, select, combobox with suggestions,
date and time pickers, file field and drop zone, full-screen progress, charts (bars, lines, donut, sparkline), popovers/menus,
drawer, side panel, dialogs (including confirmation), toasts with undo, accordion, breadcrumb, sidebar, utilities.

## Customizing
Everything goes through the `--kit-*` tokens (colors, `--kit-sp`, `--kit-rad`, `--kit-rad-sm`, `--kit-row`, `--kit-ctl`…):
override them in `:root`. Force a theme with `<html data-theme="light|dark">`.

## Compatibility
`light-dark()` requires Chrome/Edge 123+, Safari 17.5+, Firefox 120+.

## Security
The JS does not use `innerHTML`, `eval` or inline scripts: it works with `script-src 'self'`.
To report a vulnerability see [SECURITY.md](SECURITY.md).
