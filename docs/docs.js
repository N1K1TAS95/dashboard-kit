// Solo per la documentazione, non fa parte del framework.

/* ---------- Snippet: il codice di ogni esempio, generato dalla pagina stessa ----------
   Va eseguito PRIMA che kit.js inizializzi la pagina (DOMContentLoaded), altrimenti
   nel codice mostrato finirebbero gli attributi aggiunti a runtime (role, aria-selected…).

   Un esempio è un <div class="doc-demo">: si mostra il suo contenuto. Attributi opzionali:
     data-doc-include="#id"   aggiunge al codice anche un altro elemento (es. un <dialog>)
     data-doc-js="codice"     aggiunge una riga di JavaScript d'esempio
     data-doc-nocode          nessuno snippet sotto l'esempio
   Gli id che iniziano con "doc-" servono solo all'esempio e si tolgono dal codice. */
(function () {
    function dedent(text) {
        var lines = text.replace(/\t/g, "    ").split("\n");
        while (lines.length && !lines[0].trim()) lines.shift();
        while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
        var min = Infinity;
        lines.forEach(function (l) {
            if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length);
        });
        if (!isFinite(min)) min = 0;
        return lines.map(function (l) { return l.slice(min); }).join("\n");
    }

    function clean(html) {
        return html
            .replace(/\s+id="doc-[^"]*"/g, "")
            .replace(/<use href="([^"]*)"><\/use>/g, '<use href="$1"/>')
            // il browser scrive gli attributi senza valore come attr="": si riportano come nel sorgente
            .replace(/\s(data-kit-[a-z-]+|disabled|hidden|checked|open)=""/g, " $1")
            .replace(/\s+data-doc-[a-z]+="[^"]*"/g, "");
    }

    function snippetFor(demo) {
        var parts = [dedent(clean(demo.innerHTML))];
        var inc = demo.getAttribute("data-doc-include");
        var other = inc && document.querySelector(inc);
        if (other) parts.push(dedent(clean(other.outerHTML)));
        var js = demo.getAttribute("data-doc-js");
        if (js) parts.push("<script>\n  " + js + "\n</script>");
        return parts.join("\n\n");
    }

    function copy(text, btn) {
        function done(ok) {
            var old = btn.textContent;
            btn.textContent = ok ? "Copiato" : "Copia non riuscita";
            setTimeout(function () { btn.textContent = old; }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
        } else {
            done(false);
        }
    }

    document.querySelectorAll(".doc-demo").forEach(function (demo) {
        if (demo.hasAttribute("data-doc-nocode")) return;
        var code = snippetFor(demo);
        var box = document.createElement("details");
        box.className = "doc-code";

        var sum = document.createElement("summary");
        sum.textContent = "Codice";
        box.appendChild(sum);

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kit-btn kit-btn-ghost doc-copy";
        btn.textContent = "Copia";
        btn.addEventListener("click", function () { copy(code, btn); });
        box.appendChild(btn);

        var pre = document.createElement("pre");
        pre.className = "kit-code";
        var c = document.createElement("code");
        c.textContent = code;                              // textContent: il codice si mostra, non si esegue
        pre.appendChild(c);
        box.appendChild(pre);

        demo.insertAdjacentElement("afterend", box);
    });
})();

/* ---------- Menu laterale: aperto su schermi larghi, chiuso sul telefono ---------- */
(function () {
    var d = document.querySelector(".doc-nav-d");
    if (!d || !window.matchMedia) return;
    var mq = window.matchMedia("(min-width: 992px)");
    function sync() { d.open = mq.matches; }
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
})();

/* ---------- Interazioni degli esempi ---------- */
// <button data-doc-toast="testo">: mostra un toast. Opzioni facoltative: data-doc-type, -title, -duration, -pos, -action
document.addEventListener("click", function (e) {
    if (e.target instanceof Element && e.target.closest("[data-doc-toast-clear]") && window.Kit) { Kit.toast.clear(); return; }
    var t = e.target instanceof Element && e.target.closest("[data-doc-toast]");
    if (!t || !window.Kit) return;
    var d = t.dataset, o = {};
    if (d.docType) o.type = d.docType;
    if (d.docTitle) o.title = d.docTitle;
    if (d.docDuration !== undefined) o.duration = Number(d.docDuration);
    if (d.docPos) o.position = d.docPos;
    if (d.docAction) o.action = { label: d.docAction, onClick: function () { Kit.toast("Operazione annullata", { type: "success", duration: 2000 }); } };
    Kit.toast(t.getAttribute("data-doc-toast"), o);
});

// Contenitore con data-doc-seg: una sola voce attiva alla volta (segmented, pill)
document.addEventListener("click", function (e) {
    var box = e.target instanceof Element && e.target.closest("[data-doc-seg]");
    if (!box) return;
    var b = e.target.closest("button");
    if (!b || !box.contains(b)) return;
    box.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); });
});

// Chip: un click lo rimuove
document.addEventListener("click", function (e) {
    var chip = e.target instanceof Element && e.target.closest(".doc-demo .kit-chip");
    if (chip) chip.remove();
});

// Select: mostra il valore scelto nell'elemento [data-doc-out] dello stesso esempio
document.addEventListener("kit:change", function (e) {
    var demo = e.target.closest(".doc-demo");
    var out = demo && demo.querySelector("[data-doc-out]");
    if (out) out.textContent = "Valore: " + e.detail.value;
});
