// Solo per la pagina di documentazione, non fa parte del framework.

/* ---------- Snippet: il codice di ogni esempio, generato dalla pagina stessa ----------
   Va eseguito PRIMA che kit.js inizializzi la pagina (DOMContentLoaded), altrimenti
   nel codice mostrato finirebbero gli attributi aggiunti a runtime (role, aria-selected…). */
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
            .replace(/\s+id="(segDemo|selDemo|selOut|bToast|p1|p2)"/g, function (m, id) {
                // gli id dei pannelli servono alle tab: si tengono solo lì
                return /^p\d$/.test(id) ? m : "";
            })
            .replace(/<use href="([^"]*)"><\/use>/g, '<use href="$1"/>')
            // il browser scrive gli attributi senza valore come attr="": si riportano come nel sorgente
            .replace(/\s(data-kit-[a-z-]+|disabled|hidden|checked)=""/g, " $1")
            .replace(/\s+data-doc-[a-z]+="[^"]*"/g, "");
    }

    function snippetFor(demo) {
        // di solito si mostra l'interno dell'esempio (il contenitore è solo scena); con data-doc-outer anche il contenitore
        var parts = [dedent(clean(demo.hasAttribute("data-doc-outer") ? demo.outerHTML : demo.innerHTML))];
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

    document.querySelectorAll("h3.doc-h").forEach(function (h) {
        var demo = h.nextElementSibling;
        if (!demo || demo.querySelector("pre") || demo.hasAttribute("data-doc-skip")) return;   // niente snippet per le sezioni che sono già testo o codice

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

/* ---------- Interazioni degli esempi ---------- */
document.getElementById("bToast").addEventListener("click", function () {
    Kit.toast("Salvato!");
});

document.getElementById("selDemo").addEventListener("kit:change", function (e) {
    document.getElementById("selOut").textContent = "Valore: " + e.detail.value;
});

document.getElementById("segDemo").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); });
});
