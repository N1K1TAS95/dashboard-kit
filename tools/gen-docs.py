#!/usr/bin/env python3
"""Genera le pagine della documentazione in docs/<lingua>/*.html da docs/src/<lingua>/*.html (en, it).

Ogni file in docs/src/ è solo il CONTENUTO di una pagina, con due righe iniziali:
    <!--title: Titolo-->
    <!--desc: Frase di presentazione-->
Lo script aggiunge intestazione, menu laterale (da NAV), indice delle sezioni (dai <h2 id>) e
link avanti/indietro. Le tabelle dei token e degli snippet si compilano da sole:
    <!--tokens-->  e  <!--snippets-->

Uso:  python3 tools/gen-docs.py      (non modificare a mano docs/*.html: si rigenerano)
"""
import base64
import hashlib
import html
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import icons  # noqa: E402  (tools/icons.py: icone e sprite)

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = "0.10.0"   # versione che le istruzioni di installazione indicano (tag v<VERSIONE>)
SRC = ROOT / "docs" / "src"
OUT = ROOT / "docs"
LANGS = ["en", "it"]          # la prima è quella di base (la pagina docs/index.html rimanda lì se il browser non è in italiano)
LANG_NAME = {"en": "English", "it": "Italiano"}

# Testi dell'interfaccia della documentazione (intestazione, menu, tabelle generate), per lingua.
UI = {
    "en": {
        "search": "Search…", "search_label": "Search the documentation", "settings": "Settings", "theme": "Theme", "auto": "Auto", "light": "Light", "dark": "Dark",
        "fs": "Text size", "fs_md": "Normal", "fs_lg": "Large", "fs_xl": "Extra large", "width": "Content width", "boxed": "Centered", "fluid": "Full page",
        "width_note": "Visible on screens wider than the content.", "reset": "Reset", "nav_label": "Documentation", "menu": "Documentation menu",
        "prev": "← Previous", "next": "Next →", "pager": "Previous and next page", "page": "Page", "example": "example", "it_only": "IT",
        "tok_token": "Token", "tok_value": "Value", "tok_what": "What it controls", "tok_light": "Light", "tok_dark": "Dark", "tok_use": "Use",
        "snip_prefix": "Prefix", "snip_comp": "Component", "lang_label": "Language", "no_translation": "This page is only available in Italian.",
        "ex_dashboard": "Complete example: a dashboard built with the kit.",
        "ex_sidebar": "Complete example: a left sidebar with header, sub-items, account and utilities.",
    },
    "it": {
        "search": "Cerca…", "search_label": "Cerca nella documentazione", "settings": "Impostazioni", "theme": "Tema", "auto": "Auto", "light": "Chiaro", "dark": "Scuro",
        "fs": "Dimensione del testo", "fs_md": "Normale", "fs_lg": "Grande", "fs_xl": "Molto grande", "width": "Larghezza del contenuto", "boxed": "Centrata", "fluid": "Tutta la pagina",
        "width_note": "Si nota sugli schermi più larghi del contenuto.", "reset": "Ripristina", "nav_label": "Documentazione", "menu": "Menu della documentazione",
        "prev": "← Precedente", "next": "Successiva →", "pager": "Pagina precedente e successiva", "page": "Pagina", "example": "esempio", "it_only": "IT",
        "tok_token": "Token", "tok_value": "Valore", "tok_what": "Cosa controlla", "tok_light": "Chiaro", "tok_dark": "Scuro", "tok_use": "Uso",
        "snip_prefix": "Prefisso", "snip_comp": "Componente", "lang_label": "Lingua", "no_translation": "",
        "ex_dashboard": "Esempio completo: una dashboard costruita con il kit.",
        "ex_sidebar": "Esempio completo: sidebar a sinistra con intestazione, sottovoci, account e utility.",
    },
}

# (gruppo, [(file senza .html, titolo nel menu), ...]) per lingua. Un terzo valore = pagina d'esempio (sta in docs/, non è tradotta).
NAV_IT = [
    ("Per iniziare", [("index", "Introduzione"), ("javascript", "JavaScript")]),
    ("Fondamenta", [("layout", "Layout"), ("grid", "Griglia"), ("utilities", "Utility"), ("typography", "Tipografia"), ("icons", "Icone"), ("buttons", "Bottoni")]),
    ("Form", [("forms", "Campi base"), ("form-layout", "Layout e validazione"), ("form-controls", "Select e file"), ("dates", "Date e orari")]),
    ("Navigazione", [("navbar", "Navbar"), ("sidebar", "Sidebar"), ("navigation", "Tab e breadcrumb")]),
    ("Dati", [("tables", "Tabelle"), ("charts", "Grafici"), ("cards", "Schede e dettagli")]),
    ("Feedback e overlay", [("feedback", "Avvisi e avanzamento"), ("overlays", "Dialog e menu"), ("accordion", "Accordion")]),
    ("Personalizzare", [("theming", "Temi e token"), ("snippets", "Snippet VS Code")]),
    ("Esempi", [("dashboard", "Dashboard", "esempio"), ("dashboard-sidebar", "Dashboard con sidebar", "esempio")]),
]
NAV_EN = [
    ("Getting started", [("index", "Introduction"), ("javascript", "JavaScript")]),
    ("Foundations", [("layout", "Layout"), ("grid", "Grid"), ("utilities", "Utilities"), ("typography", "Typography"), ("icons", "Icons"), ("buttons", "Buttons")]),
    ("Forms", [("forms", "Basic fields"), ("form-layout", "Layout and validation"), ("form-controls", "Select and file"), ("dates", "Dates and times")]),
    ("Navigation", [("navbar", "Navbar"), ("sidebar", "Sidebar"), ("navigation", "Tabs and breadcrumb")]),
    ("Data", [("tables", "Tables"), ("charts", "Charts"), ("cards", "Cards and details")]),
    ("Feedback and overlays", [("feedback", "Alerts and progress"), ("overlays", "Dialogs and menus"), ("accordion", "Accordion")]),
    ("Customizing", [("theming", "Themes and tokens"), ("snippets", "VS Code snippets")]),
    ("Examples", [("dashboard", "Dashboard", "example"), ("dashboard-sidebar", "Dashboard with sidebar", "example")]),
]
NAV = {"en": NAV_EN, "it": NAV_IT}
PAGES = [p for _, items in NAV_IT for p in items if len(p) == 2]      # le pagine con sorgente (stessi nomi in tutte le lingue)
PAGE_IDS = [p[0] for p in PAGES]

SPRITE = icons.inline_sprite()

def header(lang, page):
    u = UI[lang]
    other = "it" if lang == "en" else "en"
    # la stessa pagina nell'altra lingua, se esiste; altrimenti l'inizio della documentazione in quella lingua
    target = f"../{other}/{page}.html" if (SRC / other / f"{page}.html").exists() else f"../{other}/index.html"
    return f"""<header class="kit-header">
  <div class="kit-container-boxed">
    <h1 class="kit-brand"><a href="index.html">Dashboard Kit <span>docs</span></a></h1>
    <span class="kit-spacer"></span>
    <div class="kit-combo doc-search" role="search">
      <svg class="kit-icon"><use href="#i-search"/></svg>
      <input class="kit-input" type="text" placeholder="{u['search']}" aria-label="{u['search_label']}" spellcheck="false">
      <kbd aria-hidden="true">/</kbd>
    </div>
    <a class="kit-btn kit-btn-ghost" href="{target}" hreflang="{other}" lang="{other}" title="{u['lang_label']}">{LANG_NAME[other]}</a>
    <a class="kit-btn kit-btn-ghost kit-d-none kit-d-md-inline-flex" href="https://github.com/N1K1TAS95/dashboard-kit">GitHub</a>
    <div class="kit-dropdown">
      <button class="kit-btn kit-btn-icon" data-kit-toggle="#settings" aria-haspopup="true" aria-expanded="false" aria-label="{u['settings']}" title="{u['settings']}"><svg class="kit-icon"><use href="#i-sliders"/></svg></button>
      <div class="kit-pop kit-pop-right kit-settings" id="settings" role="group" aria-label="{u['settings']}" hidden>
        <div class="kit-settings-row">
          <span class="kit-settings-label">{u['theme']}</span>
          <div class="kit-seg" role="group" aria-label="{u['theme']}">
            <button data-kit-theme-set="auto"><svg class="kit-icon"><use href="#i-auto"/></svg>{u['auto']}</button>
            <button data-kit-theme-set="light"><svg class="kit-icon"><use href="#i-sun"/></svg>{u['light']}</button>
            <button data-kit-theme-set="dark"><svg class="kit-icon"><use href="#i-moon"/></svg>{u['dark']}</button>
          </div>
        </div>
        <div class="kit-settings-row">
          <span class="kit-settings-label">{u['fs']}</span>
          <div class="kit-seg" role="group" aria-label="{u['fs']}">
            <button data-kit-fs-set="md" aria-label="{u['fs_md']}" title="{u['fs_md']}">A</button>
            <button data-kit-fs-set="lg" aria-label="{u['fs_lg']}" title="{u['fs_lg']}">A</button>
            <button data-kit-fs-set="xl" aria-label="{u['fs_xl']}" title="{u['fs_xl']}">A</button>
          </div>
        </div>
        <div class="kit-settings-row">
          <span class="kit-settings-label">{u['width']}</span>
          <div class="kit-seg" role="group" aria-label="{u['width']}">
            <button data-kit-layout-set="boxed">{u['boxed']}</button>
            <button data-kit-layout-set="fluid">{u['fluid']}</button>
          </div>
          <small>{u['width_note']}</small>
        </div>
        <div class="kit-settings-foot"><button class="kit-btn kit-btn-ghost" data-kit-reset>{u['reset']}</button></div>
      </div>
    </div>
  </div>
</header>"""


PAGE = """<!doctype html>
<html lang="%%LANG%%">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>%%TITLE%% — Dashboard Kit</title>
<meta name="description" content="%%DESC_ATTR%%">
<script src="../../dist/kit.js"></script>
<link rel="stylesheet" href="../../dist/kit.css">
<link rel="stylesheet" href="../docs.css">
</head>
<body>
<!-- Pagina generata da tools/gen-docs.py a partire da docs/src/%%LANG%%/%%FILE%%.html: non modificarla a mano. -->
%%SPRITE%%
%%HEADER%%
<main class="kit-main">
<div class="kit-container-boxed">
<div class="kit-row kit-gy-0">
  <aside class="kit-col-12 kit-col-lg-3">
%%NAV%%
  </aside>
  <article class="kit-col-12 kit-col-lg-9 doc-content">
    <h1 class="doc-title">%%TITLE%%</h1>
    <p class="doc-lead">%%DESC%%</p>
%%BODY%%
%%PAGER%%
  </article>
</div>
</div>
</main>
<script src="search-index.js"></script>
<script src="../docs.js"></script>
</body>
</html>
"""


def sri(path):
    digest = hashlib.sha384((ROOT / "dist" / path).read_bytes()).digest()
    return "sha384-" + base64.b64encode(digest).decode()


def markdown_lite(body):
    """```lang ... ``` diventa un blocco <pre> con il testo escapato; `x` diventa <code>x</code>.
    Il resto del file è HTML grezzo e non viene toccato."""
    blocks = []

    def stash(m):
        # la lingua dopo i tre apici (html, js, css) serve a kit.js per colorare il codice; senza, la indovina
        blocks.append('<pre class="kit-code" data-kit-code="' + (m.group(1) or "") + '"><code>' + html.escape(m.group(2), quote=False) + "</code></pre>")
        return f"@@BLOCK{len(blocks) - 1}@@"

    body = re.sub(r"```(\w*)\n(.*?)\n```", stash, body, flags=re.S)
    body = re.sub(r"`([^`\n]+)`", lambda m: "<code>" + html.escape(m.group(1), quote=False) + "</code>", body)
    return re.sub(r"@@BLOCK(\d+)@@", lambda m: blocks[int(m.group(1))], body)


def meta(text, key):
    m = re.search(r"<!--%s:\s*(.*?)\s*-->" % key, text, re.S)
    return m.group(1) if m else ""


def toc_for(body):
    return re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body, re.S)


def page_href(lang, page, translated):
    """Indirizzo di una pagina dal menu: nella stessa lingua se tradotta, altrimenti la versione italiana; gli esempi stanno in docs/."""
    if page in EXAMPLES:
        return f"../{page}.html"
    return f"{page}.html" if translated else f"../it/{page}.html"


EXAMPLES = {"dashboard", "dashboard-sidebar"}


def build_nav(lang, current, toc, have):
    u = UI[lang]
    out = [f'    <nav class="doc-nav" aria-label="{u["nav_label"]}">',
           '      <details class="doc-nav-d" open>',
           f'        <summary class="kit-btn">{u["menu"]}</summary>',
           '        <div class="doc-nav-body">']
    for group, items in NAV[lang]:
        out.append(f'          <div class="doc-nav-group">{html.escape(group)}</div>')
        for it in items:
            page, title = it[0], it[1]
            cur = page == current
            cls = ' class="is-current" aria-current="page"' if cur else ""
            translated = page in have
            if len(it) == 3:
                suffix = f' <span class="kit-badge kit-badge-neutral">{it[2]}</span>'
            elif not translated and lang != "it":
                suffix = f' <span class="kit-badge kit-badge-neutral" title="{html.escape(u["no_translation"])}">{u["it_only"]}</span>'
            else:
                suffix = ""
            hl = ' hreflang="it" lang="it"' if (not translated and lang != "it" and page not in EXAMPLES) else ""
            out.append(f'          <a href="{page_href(lang, page, translated)}"{cls}{hl}>{html.escape(title)}{suffix}</a>')
            if cur and toc:
                out.append('          <ul class="doc-toc">')
                for anchor, text in toc:
                    out.append(f'            <li><a href="#{anchor}">{re.sub(r"<[^>]+>", "", text)}</a></li>')
                out.append("          </ul>")
    out += ["        </div>", "      </details>", "    </nav>"]
    return "\n".join(out)


def build_pager(lang, current, have):
    u = UI[lang]
    titles = {p[0]: p[1] for _, items in NAV[lang] for p in items}
    i = PAGE_IDS.index(current)
    prev = PAGE_IDS[i - 1] if i > 0 else None
    nxt = PAGE_IDS[i + 1] if i < len(PAGE_IDS) - 1 else None
    out = [f'    <nav class="doc-pager" aria-label="{u["pager"]}">']
    out.append(f'      <a href="{page_href(lang, prev, prev in have)}"><small>{u["prev"]}</small><b>{html.escape(titles[prev])}</b></a>' if prev else "      <span></span>")
    out.append(f'      <a class="doc-next" href="{page_href(lang, nxt, nxt in have)}"><small>{u["next"]}</small><b>{html.escape(titles[nxt])}</b></a>' if nxt else "      <span></span>")
    out.append("    </nav>")
    return "\n".join(out)


COLOR_DESC = {
    "it": {
        "bg": "Sfondo della pagina", "card": "Sfondo di card, header, tabelle", "ink": "Testo principale",
        "mute": "Testo secondario", "line": "Bordi", "line-soft": "Bordi leggeri, righe di tabella",
        "hover": "Sfondo al passaggio del mouse", "accent": "Colore di accento (bottoni, link, selezione)",
        "accent-ink": "Testo sopra l'accento", "accent-soft": "Sfondo tenue dell'accento",
        "danger": "Errori, valori negativi", "success": "Esito positivo", "warning": "Avvisi",
        "c1": "Serie 1 dei grafici", "c2": "Serie 2 dei grafici", "c3": "Serie 3 dei grafici", "c4": "Serie 4 dei grafici",
        "hl-tag": "Codice: tag e selettori", "hl-attr": "Codice: attributi e proprietà", "hl-str": "Codice: stringhe",
        "hl-kw": "Codice: parole chiave", "hl-fn": "Codice: funzioni e pseudo-classi", "hl-num": "Codice: numeri e nomi di classe",
        "hl-com": "Codice: commenti",
    },
    "en": {
        "bg": "Page background", "card": "Background of cards, header, tables", "ink": "Main text",
        "mute": "Secondary text", "line": "Borders", "line-soft": "Light borders, table rows",
        "hover": "Background on mouse hover", "accent": "Accent color (buttons, links, selection)",
        "accent-ink": "Text on the accent", "accent-soft": "Soft accent background",
        "danger": "Errors, negative values", "success": "Positive outcome", "warning": "Warnings",
        "c1": "Chart series 1", "c2": "Chart series 2", "c3": "Chart series 3", "c4": "Chart series 4",
        "hl-tag": "Code: tags and selectors", "hl-attr": "Code: attributes and properties", "hl-str": "Code: strings",
        "hl-kw": "Code: keywords", "hl-fn": "Code: functions and pseudo-classes", "hl-num": "Code: numbers and class names",
        "hl-com": "Code: comments",
    },
}


def tokens_table(lang):
    u = UI[lang]
    css = (ROOT / "dist" / "kit.css").read_text(encoding="utf-8")
    root = re.search(r":root \{(.*?)\n\}", css, re.S).group(1)
    layout, colors = [], []
    for m in re.finditer(r"--kit-([a-z0-9-]+):\s*([^;]+);(?:\s*/\*\s*(.*?)\s*\*/)?", root):
        name, value, note = m.group(1), m.group(2).strip(), m.group(3) or ""
        if name.startswith("shadow"):
            continue
        if value.startswith("light-dark("):
            inner = value[len("light-dark("):-1]
            light, dark = [x.strip() for x in inner.split(",", 1)] if "," in inner and "(" not in inner else (inner, "")
            colors.append((name, light, dark))
        elif re.fullmatch(r"[\d.]+(px|rem)?", value):
            layout.append((name, value, note))
    rows = []
    for n, v, note in layout:
        rows.append(f'<tr><td><code>--kit-{n}</code></td><td><code>{html.escape(v)}</code></td><td>{html.escape(note)}</td></tr>')
    t1 = ('<div class="kit-card"><div class="kit-table-wrap"><table class="kit-table"><thead><tr>'
          f'<th>{u["tok_token"]}</th><th>{u["tok_value"]}</th><th>{u["tok_what"]}</th></tr></thead><tbody>\n' + "\n".join(rows) + "\n</tbody></table></div></div>")
    rows = []
    for n, light, dark in colors:
        desc = COLOR_DESC[lang].get(n, "")
        rows.append(f'<tr><td><span class="doc-swatch" style="background:var(--kit-{n})"></span><code>--kit-{n}</code></td>'
                    f'<td><code>{html.escape(light)}</code></td><td><code>{html.escape(dark)}</code></td><td>{html.escape(desc)}</td></tr>')
    t2 = ('<div class="kit-card"><div class="kit-table-wrap"><table class="kit-table"><thead><tr>'
          f'<th>{u["tok_token"]}</th><th>{u["tok_light"]}</th><th>{u["tok_dark"]}</th><th>{u["tok_use"]}</th></tr></thead><tbody>\n' + "\n".join(rows) + "\n</tbody></table></div></div>")
    return t1, t2


def snippets_table(lang):
    u = UI[lang]
    d = json.loads((ROOT / "vscode" / "dashboard-kit.code-snippets").read_text(encoding="utf-8"))
    rows = [f'<tr><td><code>{html.escape(v["prefix"])}</code></td><td>{html.escape(v["description"])}</td></tr>'
            for v in sorted(d.values(), key=lambda v: v["prefix"])]
    return ('<div class="kit-card"><div class="kit-table-wrap"><table class="kit-table"><thead><tr>'
            f'<th>{u["snip_prefix"]}</th><th>{u["snip_comp"]}</th></tr></thead><tbody>\n' + "\n".join(rows) + "\n</tbody></table></div></div>")


def icons_grid():
    cells = "".join(
        f'<div class="doc-icon"><svg class="kit-icon"><use href="#i-{n}"/></svg><code>{n}</code></div>'
        for n in icons.ICONS)
    return f'<div class="doc-icons">{cells}</div>'


def plain(fragment):
    """Testo di un frammento HTML: senza tag, con le entità risolte e gli spazi ridotti."""
    fragment = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", fragment, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


CLASS_RE = re.compile(r"--kit-[a-z0-9-]+|(?:data-)?kit-[a-z0-9-]+|Kit\.[A-Za-z]+")


def search_entries(page, page_title, desc, body):
    """Una voce per ogni sezione (h2 e h3 con id) più una per la pagina: [pagina, titolo pagina, id, titolo,
    testo, classi]. Le classi (kit-*, data-kit-*, --kit-*, Kit.*) sono quelle usate nella sezione."""
    parts = re.split(r'(<h[23] id="[^"]+">.*?</h[23]>)', body, flags=re.S)
    entries = []

    def add(anchor, title, chunk, extra=""):
        classes = []
        for c in CLASS_RE.findall(chunk):
            c = c.rstrip("-")
            if c not in classes:
                classes.append(c)
        text = (extra + " " + plain(chunk)).strip()
        entries.append([page, page_title, anchor, title, text[:1200], " ".join(classes[:60])])

    add("", page_title, parts[0], plain(desc))
    for i in range(1, len(parts), 2):
        m = re.match(r'<h[23] id="([^"]+)">(.*?)</h[23]>', parts[i], re.S)
        add(m.group(1), plain(m.group(2)), parts[i + 1] if i + 1 < len(parts) else "")
    return entries


REDIRECT = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dashboard Kit — docs</title>
<link rel="canonical" href="en/">
<!-- Pagina generata da tools/gen-docs.py: porta alla documentazione nella lingua del browser (italiano, altrimenti inglese). -->
<script>
(function () {
    var l = (navigator.language || "en").toLowerCase().slice(0, 2);
    var hash = location.hash || "";
    location.replace((l === "it" ? "it/" : "en/") + hash);
})();
</script>
<noscript><meta http-equiv="refresh" content="0; url=en/"></noscript>
</head>
<body>
<p><a href="en/">Dashboard Kit documentation (English)</a> · <a href="it/">Documentazione (italiano)</a></p>
</body>
</html>
"""


def main():
    icons.build()
    for lang in LANGS:
        found = {f.stem for f in (SRC / lang).glob("*.html")}
        unknown = found - set(PAGE_IDS)
        if unknown:
            sys.exit(f"[{lang}] sorgenti non in NAV: {sorted(unknown)}")
    it_missing = set(PAGE_IDS) - {f.stem for f in (SRC / "it").glob("*.html")}
    if it_missing:
        sys.exit(f"Pagine senza sorgente italiano: {sorted(it_missing)}")
    for old in OUT.glob("*.html"):       # le pagine di prima della divisione in lingue (le pagine d'esempio restano)
        if old.stem in PAGE_IDS and old.stem != "index":
            old.unlink()
    (OUT / "index.html").write_text(REDIRECT, encoding="utf-8")
    total = 0
    for lang in LANGS:
        (OUT / lang).mkdir(exist_ok=True)
        for old in (OUT / lang).glob("*.html"):
            old.unlink()
        have = {f.stem for f in (SRC / lang).glob("*.html")}
        tok_layout, tok_colors = tokens_table(lang)
        index = []
        for f in sorted((SRC / lang).glob("*.html")):
            text = f.read_text(encoding="utf-8")
            title, desc = meta(text, "title"), meta(text, "desc")
            body = re.sub(r"<!--(title|desc):.*?-->\n?", "", text, flags=re.S)
            body = markdown_lite(body)
            body = (body.replace("{{version}}", VERSION).replace("{{sri-css}}", sri("kit.css")).replace("{{sri-js}}", sri("kit.js")).replace("{{sri-icons}}", sri("kit-icons.js")))
            body = body.replace("<!--icons-->", icons_grid())
            body = body.replace("<!--tokens-layout-->", tok_layout).replace("<!--tokens-colors-->", tok_colors)
            body = body.replace("<!--snippets-->", snippets_table(lang))
            body = re.sub(r'href="(dashboard|dashboard-sidebar)\.html"', r'href="../\1.html"', body)   # gli esempi stanno in docs/
            if lang != "it":    # un link a una pagina non ancora tradotta porta alla versione italiana
                body = re.sub(r'href="([a-z-]+)\.html', lambda m: m.group(0) if (m.group(1) in have or m.group(1) in EXAMPLES) else 'href="../it/' + m.group(1) + ".html", body)
            body = body.strip("\n")   # niente rientro: i blocchi <pre> devono restare com'erano
            page = (PAGE.replace("%%TITLE%%", html.escape(title)).replace("%%DESC%%", desc)
                    .replace("%%DESC_ATTR%%", html.escape(re.sub(r"<[^>]+>", "", desc), quote=True))
                    .replace("%%LANG%%", lang).replace("%%FILE%%", f.stem).replace("%%SPRITE%%", SPRITE).replace("%%HEADER%%", header(lang, f.stem))
                    .replace("%%NAV%%", build_nav(lang, f.stem, toc_for(body), have)).replace("%%PAGER%%", build_pager(lang, f.stem, have))
                    .replace("%%BODY%%", body))
            (OUT / lang / f"{f.stem}.html").write_text(page, encoding="utf-8")
            index += search_entries(f.stem, title, desc, body)
        if lang != "it":
            # le pagine non ancora tradotte si cercano comunque: il risultato porta alla versione italiana
            for f in sorted((SRC / "it").glob("*.html")):
                if f.stem in have:
                    continue
                text = f.read_text(encoding="utf-8")
                title, desc = meta(text, "title"), meta(text, "desc")
                body = markdown_lite(re.sub(r"<!--(title|desc):.*?-->\n?", "", text, flags=re.S))
                index += [["../it/" + e[0]] + e[1:] for e in search_entries(f.stem, title, desc, body)]
        u = UI[lang]
        index.append(["../dashboard", "Dashboard", "", "Dashboard", u["ex_dashboard"], "kit-header kit-card kit-kpi kit-table"])
        index.append(["../dashboard-sidebar", NAV_TITLE_SIDEBAR[lang], "", NAV_TITLE_SIDEBAR[lang], u["ex_sidebar"], "kit-app kit-sidebar kit-side-link kit-header"])
        (OUT / lang / "search-index.js").write_text(
            "/* Indice della ricerca, generato da tools/gen-docs.py: non modificarlo a mano. */\n"
            "window.DOC_SEARCH = " + json.dumps(index, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
        total += len(index)
        print(f"ok [{lang}]: {len(have)} pagine tradotte, {len(index)} voci di ricerca")
    (OUT / "search-index.js").unlink(missing_ok=True)


NAV_TITLE_SIDEBAR = {"en": "Dashboard with sidebar", "it": "Dashboard con sidebar"}


if __name__ == "__main__":
    main()
