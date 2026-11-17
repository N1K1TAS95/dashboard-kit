#!/usr/bin/env python3
"""Generates the 12-column grid and the flex utilities in dist/kit.css.

Rewrites only the block between `/* grid:start */` and `/* grid:end */`.
Usage:  python3 tools/gen-grid.py
To change the breakpoints, the spacing scale or the number of columns, edit the constants below.
"""
import pathlib
import re
import sys

CSS = pathlib.Path(__file__).resolve().parent.parent / "dist" / "kit.css"

COLUMNS = 12
# Same breakpoints as Bootstrap (min-width, mobile first). The base (no suffix) applies from 0px.
BREAKPOINTS = [("sm", 576), ("md", 768), ("lg", 992), ("xl", 1200)]
# Spacing scale (m-*, p-*, g-*, gap-*): 0..5, as in Bootstrap but in px.
SPACES = {0: "0", 1: "4px", 2: "8px", 3: "16px", 4: "24px", 5: "48px"}

JUSTIFY = {"start": "flex-start", "end": "flex-end", "center": "center",
           "between": "space-between", "around": "space-around", "evenly": "space-evenly"}
ALIGN = {"start": "flex-start", "end": "flex-end", "center": "center",
         "baseline": "baseline", "stretch": "stretch"}
DISPLAY = ["none", "inline", "block", "inline-block", "flex", "inline-flex", "grid"]
DIRECTION = ["row", "column", "row-reverse", "column-reverse"]


def pct(n, total=COLUMNS):
    v = f"{n / total * 100:.6f}".rstrip("0").rstrip(".")
    return f"{v}%"


def rule(sel, decl):
    return f"{sel}{{{decl}}}"


def breakpoint_rules(i):
    """Rules that exist in a base version and in a per-breakpoint version. i = '' or '-md'."""
    out = []
    out.append(rule(f".kit-col{i}", "flex:1 0 0%"))
    for n in range(1, 7):
        out.append(rule(f".kit-row-cols{i}-{n}>*", f"flex:0 0 auto;width:{pct(1, n)}"))
    out.append(rule(f".kit-col{i}-auto", "flex:0 0 auto;width:auto"))
    for n in range(1, COLUMNS + 1):
        out.append(rule(f".kit-col{i}-{n}", f"flex:0 0 auto;width:{pct(n)}"))
    for n in range(0, COLUMNS):
        out.append(rule(f".kit-offset{i}-{n}", f"margin-inline-start:{pct(n) if n else '0'}"))
    out.append(rule(f".kit-order{i}-first", "order:-1!important"))
    out.append(rule(f".kit-order{i}-last", f"order:{COLUMNS}!important"))
    for n in range(0, 6):
        out.append(rule(f".kit-order{i}-{n}", f"order:{n}!important"))
    for n, v in SPACES.items():
        out.append(rule(f".kit-g{i}-{n}", f"--kit-gx:{v};--kit-gy:{v}"))
    for d in DISPLAY:
        out.append(rule(f".kit-d{i}-{d}", f"display:{d}!important"))
    for d in DIRECTION:
        out.append(rule(f".kit-flex{i}-{d}", f"flex-direction:{d}!important"))
    for k, v in JUSTIFY.items():
        out.append(rule(f".kit-justify-content{i}-{k}", f"justify-content:{v}!important"))
    for k, v in ALIGN.items():
        out.append(rule(f".kit-align-items{i}-{k}", f"align-items:{v}!important"))
    return out


def build():
    L = []
    L.append("/* Columns: 12 per row, breakpoints sm 576 / md 768 / lg 992 / xl 1200 (mobile first). */")
    L.append(":root{" + ";".join(f"--kit-s{n}:{v}" for n, v in SPACES.items()) + "}")

    # Base row and columns. The gutters (--kit-gx/--kit-gy) follow --kit-sp, so they tighten on phones.
    L.append(rule(".kit-row",
                  "--kit-gx:var(--kit-sp);--kit-gy:var(--kit-sp);display:flex;flex-wrap:wrap;"
                  "margin-top:calc(var(--kit-gy)*-1);margin-inline:calc(var(--kit-gx)*-.5)"))
    L.append(rule(".kit-row>*",
                  "flex-shrink:0;width:100%;max-width:100%;"
                  "padding-inline:calc(var(--kit-gx)*.5);margin-top:var(--kit-gy)"))
    for n, v in SPACES.items():
        L.append(rule(f".kit-gx-{n}", f"--kit-gx:{v}"))
        L.append(rule(f".kit-gy-{n}", f"--kit-gy:{v}"))

    L.extend(breakpoint_rules(""))
    for name, px in BREAKPOINTS:
        L.append(f"@media (min-width:{px}px){{")
        L.extend("  " + r for r in breakpoint_rules(f"-{name}"))
        L.append("}")

    # Base-only utilities (no per-breakpoint version)
    L.append("/* Flex and spacing utilities (no breakpoint) */")
    for k, v in ALIGN.items():
        L.append(rule(f".kit-align-self-{k}", f"align-self:{v}!important"))
    L.append(rule(".kit-align-self-auto", "align-self:auto!important"))
    L.append(rule(".kit-flex-wrap", "flex-wrap:wrap!important"))
    L.append(rule(".kit-flex-nowrap", "flex-wrap:nowrap!important"))
    L.append(rule(".kit-flex-wrap-reverse", "flex-wrap:wrap-reverse!important"))
    L.append(rule(".kit-flex-fill", "flex:1 1 auto!important"))
    L.append(rule(".kit-flex-grow-0", "flex-grow:0!important"))
    L.append(rule(".kit-flex-grow-1", "flex-grow:1!important"))
    L.append(rule(".kit-flex-shrink-0", "flex-shrink:0!important"))
    L.append(rule(".kit-flex-shrink-1", "flex-shrink:1!important"))
    for n in SPACES:
        L.append(rule(f".kit-gap-{n}", f"gap:var(--kit-s{n})!important"))
    L.append(rule(".kit-w-100", "width:100%!important"))
    L.append(rule(".kit-w-auto", "width:auto!important"))
    L.append(rule(".kit-h-100", "height:100%!important"))
    L.append(rule(".kit-h-auto", "height:auto!important"))

    sides = {"": ["{p}"], "t": ["{p}-top"], "b": ["{p}-bottom"],
             "s": ["{p}-inline-start"], "e": ["{p}-inline-end"],
             "x": ["{p}-inline"], "y": ["{p}-block"]}
    for abbr, prop in (("m", "margin"), ("p", "padding")):
        for side, props in sides.items():
            cls = f".kit-{abbr}{side}"
            for n in SPACES:
                decl = ";".join(f"{x.format(p=prop)}:var(--kit-s{n})!important" for x in props)
                L.append(rule(f"{cls}-{n}", decl))
            if abbr == "m":
                decl = ";".join(f"{x.format(p=prop)}:auto!important" for x in props)
                L.append(rule(f"{cls}-auto", decl))
    return "\n".join(L)


def main():
    css = CSS.read_text(encoding="utf-8")
    pat = re.compile(r"/\* grid:start \*/.*?/\* grid:end \*/", re.S)
    if not pat.search(css):
        sys.exit("Placeholders /* grid:start */ ... /* grid:end */ not found in dist/kit.css")
    new = pat.sub(lambda m: "/* grid:start */\n" + build() + "\n/* grid:end */", css)
    if new != css:
        CSS.write_text(new, encoding="utf-8")
    n = new.count("\n")
    print(f"ok: {CSS.relative_to(CSS.parent.parent)} ({len(new.encode('utf-8')) / 1024:.1f} KB, {n} lines)")


if __name__ == "__main__":
    main()
