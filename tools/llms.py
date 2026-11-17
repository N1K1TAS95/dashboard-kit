"""Converts the documentation pages (HTML) into clean Markdown, for llms-full.txt."""
import html
import re
from html.parser import HTMLParser

BASE = "https://n1k1tas95.github.io/dashboard-kit/en/"   # relative links become absolute
SKIP = {"script", "style", "svg", "nav", "button"}
VOID = {"br", "hr", "img", "input", "meta", "link", "source", "wbr", "col"}


class Conv(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=True)
        self.src = src
        self.lines = [0]
        for l in src.split("\n"):
            self.lines.append(self.lines[-1] + len(l) + 1)
        self.out = []            # ready text blocks
        self.inline = []         # text of the current line
        self.skip = 0
        self.pre = None          # [language, text]
        self.demo = None         # [div depth, start, nocode]
        self.depth = 0           # depth of the divs
        self.list = []           # stack of "ul"/"ol" with a counter
        self.link = None
        self.table = None
        self.cell = None
        self.stack = []

    def off(self):
        l, c = self.getpos()
        return self.lines[l - 1] + c

    def flush(self, prefix=""):
        t = re.sub(r"[ \t\r\n]+", " ", "".join(self.inline)).strip()
        self.inline = []
        if t:
            self.out.append(prefix + t)

    def text(self, s):
        if self.cell is not None:
            self.cell.append(s)
        else:
            self.inline.append(s)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        if self.skip or tag in SKIP:
            if tag in SKIP:
                self.skip += 1
            return
        if self.pre is not None or (self.demo and not self.demo[2]):
            if tag == "div" and self.demo:
                self.depth += 1
            return
        if tag == "div":
            self.depth += 1
            if "doc-demo" in cls:
                self.flush()
                self.demo = [self.depth, self.src.index(">", self.off()) + 1, "data-doc-nocode" in a]
            elif "doc-icons" in cls:
                self.flush()
            elif "doc-icon" in cls:
                self.text(" ")
            return
        if tag in ("h2", "h3", "h4"):
            self.flush()
            self.stack.append(("h", "#" * int(tag[1]) + " "))
        elif tag == "p" or tag == "li" or tag == "summary":
            self.flush()
            if tag == "li":
                self.stack.append(("li", ("  " * (len(self.list) - 1)) + (f"{self.list[-1][1]}. " if self.list[-1][0] == "ol" else "- ")))
                if self.list[-1][0] == "ol":
                    self.list[-1][1] += 1
        elif tag in ("ul", "ol"):
            self.flush()
            self.list.append([tag, 1])
        elif tag == "pre":
            self.flush()
            self.pre = [a.get("data-kit-code") or "", ""]
        elif tag == "code" and self.pre is None:
            self.text("`")
        elif tag in ("strong", "b"):
            self.text("**")
        elif tag in ("em", "i"):
            self.text("_")
        elif tag == "a":
            h = a.get("href", "")
            self.link = BASE + h if h and not re.match(r"(https?:|#|mailto:|/)", h) else h
            self.text("[")
        elif tag == "table":
            self.flush()
            self.table = []
        elif tag == "tr" and self.table is not None:
            self.table.append([])
        elif tag in ("td", "th") and self.table is not None:
            self.cell = []
        elif tag == "br":
            self.text(" ")

    def handle_endtag(self, tag):
        if self.skip:
            if tag in SKIP:
                self.skip -= 1
            return
        if self.pre is not None:
            if tag == "pre":
                lang, txt = self.pre
                self.pre = None
                self.out.append("```" + lang + "\n" + txt.strip("\n") + "\n```")
            return
        if tag == "div":
            if self.demo and self.depth == self.demo[0]:
                if not self.demo[2]:
                    raw = self.src[self.demo[1]:self.off()]
                    raw = self.dedent(raw)
                    if raw.strip():
                        self.out.append("Example markup:\n\n```html\n" + raw + "\n```")
                self.demo = None
            self.depth -= 1
            return
        if self.demo and not self.demo[2]:
            return
        if tag in ("h2", "h3", "h4"):
            self.flush(self.stack.pop()[1])
        elif tag == "p" or tag == "summary":
            self.flush()
        elif tag == "li":
            self.flush(self.stack.pop()[1])
        elif tag in ("ul", "ol"):
            self.flush()
            self.list.pop()
        elif tag == "code":
            self.text("`")
        elif tag in ("strong", "b"):
            self.text("**")
        elif tag in ("em", "i"):
            self.text("_")
        elif tag == "a":
            self.text(f"]({self.link})")
        elif tag in ("td", "th") and self.cell is not None:
            self.table[-1].append(re.sub(r"\s+", " ", "".join(self.cell)).strip().replace("|", "\\|"))
            self.cell = None
        elif tag == "table":
            rows = [r for r in self.table if r]
            self.table = None
            if rows:
                w = max(len(r) for r in rows)
                rows = [r + [""] * (w - len(r)) for r in rows]
                md = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * w] + ["| " + " | ".join(r) + " |" for r in rows[1:]]
                self.out.append("\n".join(md))

    def handle_data(self, data):
        if self.skip:
            return
        if self.pre is not None:
            self.pre[1] += data
        elif self.demo and not self.demo[2]:
            return
        else:
            self.text(data)

    @staticmethod
    def dedent(raw):
        lines = raw.strip("\n").split("\n")
        ind = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
        return "\n".join(l[ind:].rstrip() for l in lines)


def to_markdown(body):
    body = re.sub(r"<!--.*?-->", "", body, flags=re.S)
    c = Conv(body)
    c.feed(body)
    c.flush()
    text = "\n\n".join(c.out)
    # list items are consecutive lines: no blank line between them
    text = re.sub(r"\n\n(?=\s*(?:- |\d+\. ))", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"
