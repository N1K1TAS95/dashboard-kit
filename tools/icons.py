#!/usr/bin/env python3
"""Icone del kit: unica fonte di verità.

Genera:
  dist/kit-icons.svg   sprite SVG (da incollare nella pagina o da usare con un build tool)
  dist/kit-icons.js    inserisce lo sprite nella pagina: dopo, <use href="#i-nome"/> funziona ovunque

Le icone sono su una griglia 24x24, solo tracciati (nessun riempimento): colore, spessore e
dimensione arrivano dalla classe .kit-icon (currentColor, 18px, tratto 1.8).

Per aggiungere un'icona: una riga in ICONS, poi `python3 tools/icons.py` (o gen-docs.py, che lo chiama).
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# nome -> contenuto SVG (viewBox 0 0 24 24). L'id nello sprite è "i-<nome>".
ICONS = {
    # frecce e movimento
    "chev": '<path d="m6 9 6 6 6-6"/>',
    "chev-up": '<path d="m6 15 6-6 6 6"/>',
    "chev-left": '<path d="m15 6-6 6 6 6"/>',
    "chev-right": '<path d="m9 6 6 6-6 6"/>',
    "arrow-up": '<path d="M12 19V5m0 0-6 6m6-6 6 6"/>',
    "arrow-down": '<path d="M12 5v14m0 0-6-6m6 6 6-6"/>',
    "arrow-left": '<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>',
    "arrow-right": '<path d="M5 12h14m0 0-6-6m6 6-6 6"/>',
    "expand": '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    "external": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    # azioni
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "x": '<path d="M6 6l12 12M18 6 6 18"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "download": '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
    "upload": '<path d="M12 15V4m0 0L8 8m4-4 4 4M5 20h14"/>',
    "refresh": '<path d="M20 11a8 8 0 0 0-14.5-3.5L4 9m0-5v5h5M4 13a8 8 0 0 0 14.5 3.5L20 15m0 5v-5h-5"/>',
    "edit": '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
    "trash": '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    "copy": '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    "filter": '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/>',
    "sliders": '<path d="M4 7h8m4 0h4M4 17h4m4 0h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    "menu": '<path d="M4 6h16M4 12h16M4 18h16"/>',
    "more": '<path d="M5 12h.01M12 12h.01M19 12h.01"/>',
    "more-v": '<path d="M12 5h.01M12 12h.01M12 19h.01"/>',
    # oggetti
    "home": '<path d="M4 11 12 4l8 7M6 10v10h4v-6h4v6h4V10"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
    "bell": '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4"/>',
    "calendar": '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    "file": '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5"/>',
    "folder": '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    # tema
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "moon": '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    "auto": '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
    # stato (usate dagli avvisi)
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    "ok": '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
    "warn": '<path d="M12 3.5 2.5 20h19L12 3.5z"/><path d="M12 10v4.5M12 17.5h.01"/>',
    "error": '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
}


def symbols():
    return "\n".join(f'<symbol id="i-{n}" viewBox="0 0 24 24">{body}</symbol>' for n, body in ICONS.items())


def inline_sprite():
    """Sprite da incollare nel <body> (nascosto)."""
    return ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>\n'
            + symbols() + "\n</defs></svg>")


def build():
    dist = ROOT / "dist"
    (dist / "kit-icons.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false"><defs>\n'
        + symbols() + "\n</defs></svg>\n", encoding="utf-8")
    sprite = ('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" '
              'aria-hidden="true" focusable="false" data-kit-icons=""><defs>' + symbols().replace("\n", "") + "</defs></svg>")
    js = f"""/*! Dashboard Kit icone | MIT | generato da tools/icons.py, non modificare a mano
 * Inserisce lo sprite nella pagina: poi <svg class="kit-icon"><use href="#i-search"/></svg> funziona ovunque.
 * (Un <use> verso un file esterno non funziona se il file è su un altro dominio, per questo lo sprite si inserisce con JS.)
 */
(function () {{
    "use strict";
    var SPRITE = {sprite!r};
    function mount() {{
        if (document.querySelector("svg[data-kit-icons]")) return;
        var doc = new DOMParser().parseFromString(SPRITE, "image/svg+xml");
        document.body.insertBefore(document.importNode(doc.documentElement, true), document.body.firstChild);
    }}
    if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
}})();
"""
    (dist / "kit-icons.js").write_text(js, encoding="utf-8")
    return len(ICONS)


if __name__ == "__main__":
    print(f"ok: {build()} icone in dist/kit-icons.svg e dist/kit-icons.js")
