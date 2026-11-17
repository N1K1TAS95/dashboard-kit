// Solo per la documentazione, non fa parte del framework.

/* ---------- Testi della documentazione, per lingua (quella di <html lang>) ----------
   Gli esempi di grafici e combobox (più sotto) usano ancora dati in italiano: si traducono insieme alle loro pagine. */
var DOC_T = {
    en: {
        copy: "Copy", copied: "Copied", copyFail: "Copy failed", page: "Page", showPages: "Show the pages", more: "{n} more results: type more to narrow down",
        undone: "Action undone", valid: "All valid: the form would have been sent.", value: "Value: ",
        filesOne: " file accepted", filesMany: " files accepted", filesNone: "No file", rejected: ", {n} rejected", rejected1: ", 1 rejected",
        archive: "Archive the invoice?", archiveText: "You will find it again in the archive.", archiveOk: "Archive", archived: "Invoice archived", cancelled: "Cancelled",
        del12: "Delete 12 invoices?", del12Text: "This cannot be undone.", del12Ok: "Delete 12 invoices", del12Done: "12 invoices deleted",
        delYear: "Delete the 2024 archive?", delYearText: "312 invoices will be deleted. This cannot be undone.", delYearOk: "Delete the archive", delYearType: "Archive 2024", delYearDone: "Archive deleted",
        reading: "Reading the invoices…", readingCancel: "Reading cancelled", readingN: "Reading {i} of 20", moment: "Just a moment…",
        invDeleted: "Invoice deleted", finalDeleted: "Deleted permanently"
    },
    it: {
        copy: "Copia", copied: "Copiato", copyFail: "Copia non riuscita", page: "Pagina", showPages: "Mostra le pagine", more: "Altri {n} risultati: scrivi di più per restringere",
        undone: "Operazione annullata", valid: "Tutto valido: il form sarebbe partito.", value: "Valore: ",
        filesOne: " file accettato", filesMany: " file accettati", filesNone: "Nessun file", rejected: ", {n} scartati", rejected1: ", 1 scartato",
        archive: "Archiviare la fattura?", archiveText: "Potrai ritrovarla nell'archivio.", archiveOk: "Archivia", archived: "Fattura archiviata", cancelled: "Annullato",
        del12: "Eliminare 12 fatture?", del12Text: "L'operazione non si può annullare.", del12Ok: "Elimina 12 fatture", del12Done: "12 fatture eliminate",
        delYear: "Eliminare l'archivio 2024?", delYearText: "Verranno cancellate 312 fatture. Non si può annullare.", delYearOk: "Elimina l'archivio", delYearType: "Archivio 2024", delYearDone: "Archivio eliminato",
        reading: "Lettura delle fatture…", readingCancel: "Lettura annullata", readingN: "Lettura {i} di 20", moment: "Un momento…",
        invDeleted: "Fattura eliminata", finalDeleted: "Eliminata definitivamente"
    }
};
function D(key, vars) {
    var l = (document.documentElement.lang || "en").slice(0, 2) === "it" ? "it" : "en";
    return String(DOC_T[l][key]).replace(/\{(\w+)\}/g, function (m, n) { return vars && vars[n] !== undefined ? vars[n] : m; });
}

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
            btn.textContent = ok ? D("copied") : D("copyFail");
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
        btn.textContent = D("copy");
        btn.addEventListener("click", function () { copy(code, btn); });
        box.appendChild(btn);

        var pre = document.createElement("pre");
        pre.className = "kit-code";
        pre.setAttribute("data-kit-code", "");              // kit.js colora il codice (lo fa in init, dopo questo script)
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
    if (d.docAction) o.action = { label: d.docAction, onClick: function () { Kit.toast(D("undone"), { type: "success", duration: 2000 }); } };
    Kit.toast(t.getAttribute("data-doc-toast"), o);
});

// <button data-doc-run="nome">: esegue l'esempio con quel nome (il codice mostrato sotto l'esempio è quello di data-doc-js)
var DOC_RUN = {
    "confirm-base": function () {
        Kit.confirm(D("archive"), { text: D("archiveText"), confirm: D("archiveOk") }).then(function (ok) {
            Kit.toast(ok ? D("archived") : D("cancelled"), { type: ok ? "success" : undefined, duration: 2500 });
        });
    },
    "confirm-danger": function () {
        Kit.confirm(D("del12"), { text: D("del12Text"), confirm: D("del12Ok"), danger: true }).then(function (ok) {
            Kit.toast(ok ? D("del12Done") : D("cancelled"), { type: ok ? "danger" : undefined, duration: 2500 });
        });
    },
    "confirm-type": function () {
        Kit.confirm(D("delYear"), { text: D("delYearText"), confirm: D("delYearOk"), danger: true, type: D("delYearType") }).then(function (ok) {
            Kit.toast(ok ? D("delYearDone") : D("cancelled"), { type: ok ? "danger" : undefined, duration: 2500 });
        });
    },
    "progress-bar": function () {
        var t, i = 0;
        var p = Kit.progress(D("reading"), { value: 0, onCancel: function () { clearInterval(t); Kit.toast(D("readingCancel"), { duration: 2000 }); } });
        t = setInterval(function () {
            i++;
            p.update(D("readingN", { i: i }), i / 20);
            if (i >= 20) { clearInterval(t); p.close(); }
        }, 120);
    },
    "progress-indet": function () {
        var p = Kit.progress(D("moment"), { onCancel: function () {} });
        setTimeout(function () { p.close(); }, 2200);
    },
    "undo": function (btn) {
        var row = btn.closest("#doc-undo-row"), note = document.getElementById("doc-undo-note");
        row.hidden = true;
        note.hidden = false;
        Kit.undo(D("invDeleted"), {
            onUndo: function () { row.hidden = false; note.hidden = true; },
            onCommit: function () { note.hidden = true; row.hidden = false; Kit.toast(D("finalDeleted"), { type: "danger", duration: 2500 }); }
        });
    }
};
document.addEventListener("click", function (e) {
    var b = e.target instanceof Element && e.target.closest("[data-doc-run]");
    if (b && window.Kit && DOC_RUN[b.getAttribute("data-doc-run")]) DOC_RUN[b.getAttribute("data-doc-run")](b);
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

// Form di prova negli esempi: l'invio non deve lasciare la pagina (se è valido, un toast lo conferma)
document.addEventListener("submit", function (e) {
    var f = e.target;
    if (!(f instanceof HTMLFormElement) || !f.closest(".doc-demo")) return;
    e.preventDefault();
    if (window.Kit && f.hasAttribute("data-kit-validate")) Kit.toast(D("valid"), { type: "success" });
});

// Select: mostra il valore scelto nell'elemento [data-doc-out] dello stesso esempio
document.addEventListener("kit:change", function (e) {
    var demo = e.target.closest(".doc-demo");
    var out = demo && demo.querySelector("[data-doc-out]");
    if (!out) return;
    var d = e.detail;
    out.textContent = D("value") + (d.value !== undefined ? d.value || "–" : (d.from || "–") + " → " + (d.to || "–"));
});

// Esempi che si disegnano da soli al caricamento (data-doc-init="nome"); il codice mostrato è quello di data-doc-js.
var DOC_INIT = {
    "combo-js": function (demo) {
        var nomi = ["Rossi", "Bianchi", "Verdi", "Neri", "Gallo", "Conti", "Greco", "Fontana", "Moretti", "Barbieri"];
        var tipi = ["Srl", "Spa", "Autotrasporti", "Edilizia", "Servizi", "Trasporti"];
        var items = [];
        for (var i = 0; i < 240; i++) {
            items.push({ value: nomi[i % 10] + " " + tipi[(i * 7) % 6] + (i > 59 ? " " + (Math.floor(i / 60) + 1) : ""), hint: "IT" + String(10000000000 + i * 7919).slice(0, 11) });
        }
        Kit.combo(demo.querySelector("#cliente"), { items: items, max: 8 });
    },
    "chart-base": function () {
        var mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        var data = [];
        for (var i = 0; i < 14; i++) {
            var m = (i + 10) % 12, anno = 2025 + Math.floor((i + 10) / 12);
            data.push({ label: mesi[m], group: String(anno), values: [3200 + ((i * 937) % 2600) + i * 120] });
        }
        Kit.barChart("#grafico", { label: "Fatturato mensile", data: data, series: [{ name: "Fatturato" }],
            format: function (v) { return v.toLocaleString("it-IT", { style: "currency", currency: "EUR" }); } });
    },
    "chart-series": function () {
        var mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        var data = mesi.map(function (m, i) { return { label: m, group: i === 0 ? "2026" : "", values: [2500 + ((i * 713) % 1900), 1800 + ((i * 1151) % 2300)] }; });
        Kit.barChart("#grafico2", { label: "Emesso e ricevuto", data: data, series: [{ name: "Emesso" }, { name: "Ricevuto" }],
            legendNote: "· clicca una barra per vedere le fatture di quel mese",
            format: function (v) { return v.toLocaleString("it-IT", { style: "currency", currency: "EUR" }); },
            onSelect: function (d) { Kit.toast("Mese: " + d.label + " 2026", { duration: 2000 }); } });
    },
    "chart-stacked": function () {
        var mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        Kit.barChart("#grafico3", { label: "Spese per categoria", stacked: true,
            data: mesi.map(function (m, i) { return { label: m, values: [700 + ((i * 331) % 500), 150 + ((i * 577) % 600), i % 3 === 0 ? 700 : 0] }; }),
            series: [{ name: "Carburante" }, { name: "Manutenzione" }, { name: "Assicurazioni" }],
            format: function (v) { return v.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }); } });
    },
    "chart-line": function () {
        var mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        Kit.lineChart("#grafico4", { label: "Prezzo medio al litro",
            data: mesi.map(function (m, i) { return { label: m, group: i === 0 ? "2026" : "", values: [1.62 + Math.sin(i / 2) * .07 + i * .004, i === 4 || i === 5 ? null : 1.78 + Math.cos(i / 2.5) * .06] }; }),
            series: [{ name: "Gasolio" }, { name: "Benzina" }],
            format: function (v) { return v.toFixed(3).replace(".", ",") + " €/l"; },
            axisFormat: function (v) { return v.toFixed(2).replace(".", ",") + " €"; } });
    },
    "chart-area": function () {
        var mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        Kit.lineChart("#grafico5", { label: "Fatture ricevute", area: true, markers: false, zero: true, height: 180,
            data: mesi.map(function (m, i) { return { label: m, values: [18 + Math.round(Math.sin(i / 1.7) * 7 + i)] }; }),
            series: [{ name: "Fatture" }] });
    },
    "chart-donut": function () {
        Kit.donut("#grafico-ciambella", { label: "Spese per categoria", centerLabel: "Spese 2026",
            data: [{ label: "Carburante", value: 8420 }, { label: "Manutenzione", value: 3150 }, { label: "Assicurazioni", value: 2800 }, { label: "Altro", value: 640, color: "var(--kit-mute)" }],
            format: function (v) { return v.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }); } });
    },
    "chart-spark": function () {
        Kit.sparkline("#spark1", { values: [12, 14, 11, 16, 18, 17, 22], label: "Fatture negli ultimi 7 mesi" });
        Kit.sparkline("#spark2", { values: [5, 3, 6, 2, 4, 7, 5], type: "bar", color: "var(--kit-c2)" });
    }
};
if (window.Kit) document.querySelectorAll("[data-doc-init]").forEach(function (d) {
    var f = DOC_INIT[d.getAttribute("data-doc-init")];
    if (f) f(d);
});

// Campo file e zona di rilascio: riassunto di ciò che è stato scelto
document.addEventListener("kit:files", function (e) {
    var demo = e.target.closest(".doc-demo");
    var out = demo && demo.querySelector("[data-doc-out]");
    if (!out) return;
    var n = e.detail.files.length, r = e.detail.rejected.length;
    out.textContent = (n ? n + (n === 1 ? D("filesOne") : D("filesMany")) : D("filesNone")) + (r ? D(r === 1 ? "rejected1" : "rejected", { n: r }) : "") + ".";
});

// Ricerca: l'indice (search-index.js) lo genera tools/gen-docs.py. Il campo è un combobox del kit.
(function () {
    var wrap = document.querySelector(".doc-search");
    var data = window.DOC_SEARCH;
    if (!wrap || !data || !window.Kit) return;
    function norm(t) { return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
    var entries = data.map(function (e) {
        return { page: e[0], pageTitle: e[1], id: e[2], title: e[3], classes: e[5].split(" ").filter(Boolean),
                 nTitle: norm(e[3]), nPage: norm(e[1]), nClasses: norm(e[5]), nText: norm(e[4]) };
    });
    var pages = entries.filter(function (e) { return !e.id; });

    function score(e, tokens) {
        var total = 0;
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i], s = 0;
            if (e.nTitle.indexOf(t) === 0) s = 40;
            else if (e.nTitle.indexOf(" " + t) >= 0) s = 30;
            else if (e.nTitle.indexOf(t) >= 0) s = 22;
            if (e.classes.some(function (c) { return norm(c) === t; })) s = Math.max(s, 36);
            else if (e.nClasses.indexOf(t) >= 0) s = Math.max(s, 14);
            if (e.nPage.indexOf(t) >= 0) s = Math.max(s, 8);
            if (!s && e.nText.indexOf(t) >= 0) s = 3;
            if (!s) return 0;
            total += s;
        }
        return total + (e.id ? 0 : 4);
    }

    function hint(e, tokens) {
        var hit = e.classes.filter(function (c) { var n = norm(c); return tokens.some(function (t) { return n.indexOf(t) >= 0; }); });
        var from = e.id ? e.pageTitle : D("page");
        return hit.length ? from + " · " + hit.slice(0, 3).join(", ") : from;
    }

    function find(q) {
        var tokens = norm(q).split(/\s+/).filter(Boolean);
        var list;
        if (!tokens.length) list = pages;
        else {
            list = entries.map(function (e, i) { return { e: e, s: score(e, tokens), i: i }; })
                .filter(function (r) { return r.s > 0; })
                .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
                .map(function (r) { return r.e; });
        }
        return list.map(function (e) {
            return { value: e.page + ".html" + (e.id ? "#" + e.id : ""), label: e.title, hint: hint(e, tokens) };
        });
    }

    var input = wrap.querySelector("input");
    Kit.combo(wrap, { items: find, filter: false, max: 12, autoActive: true, more: D("more"), buttonLabel: D("showPages") });
    wrap.addEventListener("kit:change", function (e) {
        var url = e.detail.value;
        input.value = "";
        input.blur();
        location.href = url;
    });
    document.addEventListener("keydown", function (e) {
        var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "")) || e.target.isContentEditable;
        if ((e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
            e.preventDefault();
            input.focus();
            input.select();
        }
    });
})();

