#!/usr/bin/env python3
"""Genera le pagine della documentazione in docs/*.html da docs/src/*.html.

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
VERSION = "0.5.0"   # versione che le istruzioni di installazione indicano (tag v<VERSIONE>)
SRC = ROOT / "docs" / "src"
OUT = ROOT / "docs"

# (gruppo, [(file senza .html, titolo nel menu), ...])  Un terzo valore = link esterno alla documentazione.
NAV = [
    ("Per iniziare", [("index", "Introduzione"), ("javascript", "JavaScript")]),
    ("Layout", [("layout", "Layout"), ("grid", "Griglia"), ("utilities", "Utility")]),
    ("Contenuto", [("typography", "Tipografia")]),
    ("Componenti", [("buttons", "Bottoni"), ("forms", "Form"), ("navigation", "Navigazione"), ("navbar", "Navbar"),
                    ("cards", "Schede"), ("tables", "Tabelle"), ("charts", "Grafici"), ("content", "Contenuti"),
                    ("feedback", "Feedback"), ("overlays", "Dialog e menu"), ("icons", "Icone")]),
    ("Personalizzare", [("theming", "Temi e token"), ("snippets", "Snippet VS Code")]),
    ("Esempi", [("dashboard", "Dashboard", "esempio")]),
]
PAGES = [p for _, items in NAV for p in items if len(p) == 2]

SPRITE = icons.inline_sprite()

HEADER = """<header class="kit-header">
  <div class="kit-container-boxed">
    <h1 class="kit-brand"><a href="index.html">Dashboard Kit <span>docs</span></a></h1>
    <span class="kit-spacer"></span>
    <a class="kit-btn kit-btn-ghost kit-d-none kit-d-md-inline-flex" href="https://github.com/N1K1TAS95/dashboard-kit">GitHub</a>
    <div class="kit-dropdown">
      <button class="kit-btn kit-btn-icon" data-kit-toggle="#settings" aria-haspopup="true" aria-expanded="false" aria-label="Impostazioni" title="Impostazioni"><svg class="kit-icon"><use href="#i-sliders"/></svg></button>
      <div class="kit-pop kit-pop-right kit-settings" id="settings" role="group" aria-label="Impostazioni" hidden>
        <div class="kit-settings-row">
          <span class="kit-settings-label">Tema</span>
          <div class="kit-seg" role="group" aria-label="Tema">
            <button data-kit-theme-set="auto"><svg class="kit-icon"><use href="#i-auto"/></svg>Auto</button>
            <button data-kit-theme-set="light"><svg class="kit-icon"><use href="#i-sun"/></svg>Chiaro</button>
            <button data-kit-theme-set="dark"><svg class="kit-icon"><use href="#i-moon"/></svg>Scuro</button>
          </div>
        </div>
        <div class="kit-settings-row">
          <span class="kit-settings-label">Dimensione del testo</span>
          <div class="kit-seg" role="group" aria-label="Dimensione del testo">
            <button data-kit-fs-set="md" aria-label="Normale" title="Normale">A</button>
            <button data-kit-fs-set="lg" aria-label="Grande" title="Grande">A</button>
            <button data-kit-fs-set="xl" aria-label="Molto grande" title="Molto grande">A</button>
          </div>
        </div>
        <div class="kit-settings-row">
          <span class="kit-settings-label">Larghezza del contenuto</span>
          <div class="kit-seg" role="group" aria-label="Larghezza del contenuto">
            <button data-kit-layout-set="boxed">Centrata</button>
            <button data-kit-layout-set="fluid">Tutta la pagina</button>
          </div>
          <small>Si nota sugli schermi più larghi del contenuto.</small>
        </div>
        <div class="kit-settings-foot"><button class="kit-btn kit-btn-ghost" data-kit-reset>Ripristina</button></div>
      </div>
    </div>
  </div>
</header>"""

PAGE = """<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>%%TITLE%% — Dashboard Kit</title>
<meta name="description" content="%%DESC_ATTR%%">
<script src="../dist/kit.js"></script>
<link rel="stylesheet" href="../dist/kit.css">
<link rel="stylesheet" href="docs.css">
</head>
<body>
<!-- Pagina generata da tools/gen-docs.py a partire da docs/src/%%FILE%%.html: non modificarla a mano. -->
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
<script src="docs.js"></script>
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
        blocks.append('<pre class="kit-code"><code>' + html.escape(m.group(2), quote=False) + "</code></pre>")
        return f"@@BLOCK{len(blocks) - 1}@@"

    body = re.sub(r"```(\w*)\n(.*?)\n```", stash, body, flags=re.S)
    body = re.sub(r"`([^`\n]+)`", lambda m: "<code>" + html.escape(m.group(1), quote=False) + "</code>", body)
    return re.sub(r"@@BLOCK(\d+)@@", lambda m: blocks[int(m.group(1))], body)


def meta(text, key):
    m = re.search(r"<!--%s:\s*(.*?)\s*-->" % key, text, re.S)
    return m.group(1) if m else ""


def toc_for(body):
    return re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body, re.S)


def build_nav(current, toc):
    out = ['    <nav class="doc-nav" aria-label="Documentazione">',
           '      <details class="doc-nav-d" open>',
           '        <summary class="kit-btn">Menu della documentazione</summary>',
           '        <div class="doc-nav-body">']
    for group, items in NAV:
        out.append(f'          <div class="doc-nav-group">{html.escape(group)}</div>')
        for it in items:
            page, title = it[0], it[1]
            cur = page == current
            cls = ' class="is-current" aria-current="page"' if cur else ""
            suffix = f' <span class="kit-badge kit-badge-neutral">{it[2]}</span>' if len(it) == 3 else ""
            out.append(f'          <a href="{page}.html"{cls}>{html.escape(title)}{suffix}</a>')
            if cur and toc:
                out.append('          <ul class="doc-toc">')
                for anchor, text in toc:
                    out.append(f'            <li><a href="#{anchor}">{re.sub(r"<[^>]+>", "", text)}</a></li>')
                out.append("          </ul>")
    out += ["        </div>", "      </details>", "    </nav>"]
    return "\n".join(out)


def build_pager(current):
    names = [p[0] for p in PAGES]
    i = names.index(current)
    prev = PAGES[i - 1] if i > 0 else None
    nxt = PAGES[i + 1] if i < len(PAGES) - 1 else None
    out = ['    <nav class="doc-pager" aria-label="Pagina precedente e successiva">']
    out.append(f'      <a href="{prev[0]}.html"><small>← Precedente</small><b>{html.escape(prev[1])}</b></a>' if prev else "      <span></span>")
    out.append(f'      <a class="doc-next" href="{nxt[0]}.html"><small>Successiva →</small><b>{html.escape(nxt[1])}</b></a>' if nxt else "      <span></span>")
    out.append("    </nav>")
    return "\n".join(out)


COLOR_DESC = {
    "bg": "Sfondo della pagina", "card": "Sfondo di card, header, tabelle", "ink": "Testo principale",
    "mute": "Testo secondario", "line": "Bordi", "line-soft": "Bordi leggeri, righe di tabella",
    "hover": "Sfondo al passaggio del mouse", "accent": "Colore di accento (bottoni, link, selezione)",
    "accent-ink": "Testo sopra l'accento", "accent-soft": "Sfondo tenue dell'accento",
    "danger": "Errori, valori negativi", "success": "Esito positivo", "warning": "Avvisi",
    "c1": "Serie 1 dei grafici", "c2": "Serie 2 dei grafici",
}


def tokens_table():
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
          '<th>Token</th><th>Valore</th><th>Cosa controlla</th></tr></thead><tbody>\n' + "\n".join(rows) + "\n</tbody></table></div></div>")
    rows = []
    for n, light, dark in colors:
        desc = COLOR_DESC.get(n, "")
        rows.append(f'<tr><td><span class="doc-swatch" style="background:var(--kit-{n})"></span><code>--kit-{n}</code></td>'
                    f'<td><code>{html.escape(light)}</code></td><td><code>{html.escape(dark)}</code></td><td>{html.escape(desc)}</td></tr>')
    t2 = ('<div class="kit-card"><div class="kit-table-wrap"><table class="kit-table"><thead><tr>'
          '<th>Token</th><th>Chiaro</th><th>Scuro</th><th>Uso</th></tr></thead><tbody>\n' + "\n".join(rows) + "\n</tbody></table></div></div>")
    return t1, t2


def snippets_table():
    d = json.loads((ROOT / "vscode" / "dashboard-kit.code-snippets").read_text(encoding="utf-8"))
    rows = [f'<tr><td><code>{html.escape(v["prefix"])}</code></td><td>{html.escape(v["description"])}</td></tr>'
            for v in sorted(d.values(), key=lambda v: v["prefix"])]
    return ('<div class="kit-card"><div class="kit-table-wrap"><table class="kit-table"><thead><tr>'
            '<th>Prefisso</th><th>Componente</th></tr></thead><tbody>\n' + "\n".join(rows) + "\n</tbody></table></div></div>")


def icons_grid():
    cells = "".join(
        f'<div class="doc-icon"><svg class="kit-icon"><use href="#i-{n}"/></svg><code>{n}</code></div>'
        for n in icons.ICONS)
    return f'<div class="doc-icons">{cells}</div>'


def main():
    icons.build()
    names = {p[0] for p in PAGES}
    files = sorted(SRC.glob("*.html"))
    found = {f.stem for f in files}
    if names != found:
        sys.exit(f"Pagine in NAV senza sorgente: {sorted(names - found)}; sorgenti non in NAV: {sorted(found - names)}")
    tok_layout, tok_colors = tokens_table()
    for f in files:
        text = f.read_text(encoding="utf-8")
        title, desc = meta(text, "title"), meta(text, "desc")
        body = re.sub(r"<!--(title|desc):.*?-->\n?", "", text, flags=re.S)
        body = markdown_lite(body)
        body = (body.replace("{{version}}", VERSION).replace("{{sri-css}}", sri("kit.css")).replace("{{sri-js}}", sri("kit.js")).replace("{{sri-icons}}", sri("kit-icons.js")))
        body = body.replace("<!--icons-->", icons_grid())
        body = body.replace("<!--tokens-layout-->", tok_layout).replace("<!--tokens-colors-->", tok_colors)
        body = body.replace("<!--snippets-->", snippets_table())
        body = body.strip("\n")   # niente rientro: i blocchi <pre> devono restare com'erano
        page = (PAGE.replace("%%TITLE%%", html.escape(title)).replace("%%DESC%%", desc)
                .replace("%%DESC_ATTR%%", html.escape(re.sub(r"<[^>]+>", "", desc), quote=True))
                .replace("%%FILE%%", f.stem).replace("%%SPRITE%%", SPRITE).replace("%%HEADER%%", HEADER)
                .replace("%%NAV%%", build_nav(f.stem, toc_for(body))).replace("%%PAGER%%", build_pager(f.stem))
                .replace("%%BODY%%", body))
        (OUT / f"{f.stem}.html").write_text(page, encoding="utf-8")
    print(f"ok: {len(files)} pagine in docs/")


if __name__ == "__main__":
    main()
