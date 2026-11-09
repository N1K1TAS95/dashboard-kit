/*!
 * Dashboard Kit 0.1.0 — JavaScript opzionale. Nessuna dipendenza, niente innerHTML, niente eval:
 * compatibile con una Content-Security-Policy rigida (script-src 'self').
 *
 * Si attiva da solo con attributi data-kit-*:
 *   data-kit-theme-set="auto|light|dark"     bottone che imposta il tema
 *   data-kit-toggle="#id"                    bottone che apre/chiude un .kit-pop
 *   data-kit-select                          su .kit-select: scelta di un valore
 *   data-kit-tabs                            su .kit-tabs: tab con data-kit-panel="#id"
 *   data-kit-open="#dialogId"                apre un <dialog>
 *   data-kit-close                           dentro un <dialog>, lo chiude
 *
 * API: window.Kit.theme.get()/set(), Kit.toast(testo), Kit.init(radice)
 * Eventi: "kit:change" (select), "kit:tab" (tab), "kit:theme" (tema)
 */
(function () {
    "use strict";

    var KEY = "kit-theme";
    var root = document.documentElement;

    /* ---------- Tema ---------- */
    function readStored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    var theme = {
        get: function () {
            var v = readStored();
            return v === "light" || v === "dark" ? v : "auto";
        },
        set: function (v) {
            if (v !== "light" && v !== "dark") v = "auto";
            if (v === "auto") root.removeAttribute("data-theme");
            else root.setAttribute("data-theme", v);
            try {
                if (v === "auto") localStorage.removeItem(KEY);
                else localStorage.setItem(KEY, v);
            } catch (e) { /* storage non disponibile: il tema vale solo per questa pagina */ }
            document.querySelectorAll("[data-kit-theme-set]").forEach(function (b) {
                b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-theme-set") === v));
            });
            root.dispatchEvent(new CustomEvent("kit:theme", { detail: v }));
        }
    };

    /* ---------- Toast ---------- */
    var toastEl, toastTimer;
    function toast(text, ms) {
        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.className = "kit-toast";
            toastEl.setAttribute("role", "status");
            toastEl.setAttribute("aria-live", "polite");
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = text;       // textContent: mai HTML
        toastEl.classList.add("is-on");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, ms || 2500);
    }

    /* ---------- Popover ---------- */
    var openPop = null;

    function setPop(pop, btn, open) {
        pop.hidden = !open;
        if (btn) btn.setAttribute("aria-expanded", String(open));
        openPop = open ? { pop: pop, btn: btn } : null;
    }

    function closePop(returnFocus) {
        if (!openPop) return;
        var p = openPop;
        setPop(p.pop, p.btn, false);
        if (returnFocus && p.btn) p.btn.focus();
    }

    function togglePop(btn, pop) {
        var wasOpen = !pop.hidden;
        closePop(false);
        if (!wasOpen) {
            setPop(pop, btn, true);
            var first = pop.querySelector(".kit-opt.is-on, .kit-opt");
            if (first) first.classList.add("is-active");
            pop.tabIndex = -1;
            pop.focus({ preventScroll: true });
        }
    }

    /* ---------- Navigazione da tastiera nelle opzioni ---------- */
    function options(pop) {
        return Array.prototype.slice.call(pop.querySelectorAll(".kit-opt"));
    }

    function moveActive(pop, dir) {
        var list = options(pop);
        if (!list.length) return;
        var i = list.findIndex(function (o) { return o.classList.contains("is-active"); });
        list.forEach(function (o) { o.classList.remove("is-active"); });
        i = i < 0 ? (dir > 0 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
        list[i].classList.add("is-active");
        list[i].scrollIntoView({ block: "nearest" });
    }

    function chooseOption(opt) {
        var pop = opt.closest(".kit-pop");
        var sel = opt.closest("[data-kit-select]");
        if (sel) {
            options(pop).forEach(function (o) {
                var on = o === opt;
                o.classList.toggle("is-on", on);
                o.setAttribute("aria-selected", String(on));
            });
            var label = sel.querySelector(".kit-select-value");
            var text = opt.querySelector(".kit-opt-text b");
            if (label) label.textContent = (text || opt).textContent.trim();
            sel.dataset.value = opt.dataset.value || "";
            sel.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: { value: sel.dataset.value } }));
        }
        closePop(true);
    }

    /* ---------- Tab ---------- */
    function selectTab(tabs, tab) {
        tabs.querySelectorAll(".kit-tab").forEach(function (t) {
            var on = t === tab;
            t.classList.toggle("is-on", on);
            t.setAttribute("aria-selected", String(on));
            t.tabIndex = on ? 0 : -1;
            var id = t.getAttribute("data-kit-panel");
            var panel = id && document.querySelector(id);
            if (panel) panel.hidden = !on;
        });
        tabs.dispatchEvent(new CustomEvent("kit:tab", { bubbles: true, detail: { tab: tab } }));
    }

    /* ---------- Eventi (delegati: valgono anche per il contenuto aggiunto dopo) ---------- */
    document.addEventListener("click", function (e) {
        var t = e.target;
        if (!(t instanceof Element)) return;

        var themeBtn = t.closest("[data-kit-theme-set]");
        if (themeBtn) { theme.set(themeBtn.getAttribute("data-kit-theme-set")); closePop(false); return; }

        var opt = t.closest(".kit-opt");
        if (opt && opt.closest(".kit-pop") && !opt.hasAttribute("aria-disabled")) { chooseOption(opt); return; }

        var tog = t.closest("[data-kit-toggle]");
        if (tog) {
            var pop = document.querySelector(tog.getAttribute("data-kit-toggle"));
            if (pop) togglePop(tog, pop);
            return;
        }

        var selBtn = t.closest("[data-kit-select] .kit-select-btn");
        if (selBtn) {
            var p = selBtn.closest("[data-kit-select]").querySelector(".kit-pop");
            if (p) togglePop(selBtn, p);
            return;
        }

        var tab = t.closest("[data-kit-tabs] .kit-tab");
        if (tab) { selectTab(tab.closest("[data-kit-tabs]"), tab); return; }

        var open = t.closest("[data-kit-open]");
        if (open) {
            var dlg = document.querySelector(open.getAttribute("data-kit-open"));
            if (dlg && dlg.showModal) dlg.showModal();
            return;
        }

        var close = t.closest("[data-kit-close]");
        if (close) {
            var d = close.closest("dialog");
            if (d) d.close();
            return;
        }

        // Click fuori da un popover aperto: lo chiude.
        if (openPop && !openPop.pop.contains(t)) closePop(false);

        // Click sullo sfondo (::backdrop) di un dialog: lo chiude.
        if (t instanceof HTMLDialogElement && t.classList.contains("kit-dialog")) {
            var r = t.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) t.close();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (openPop) {
            if (e.key === "Escape") { e.preventDefault(); closePop(true); return; }
            if (e.key === "ArrowDown") { e.preventDefault(); moveActive(openPop.pop, 1); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); moveActive(openPop.pop, -1); return; }
            if (e.key === "Enter" || e.key === " ") {
                var a = openPop.pop.querySelector(".kit-opt.is-active");
                if (a) { e.preventDefault(); chooseOption(a); return; }
            }
        }
        // Frecce sinistra/destra tra le tab.
        var tab = e.target instanceof Element && e.target.closest("[data-kit-tabs] .kit-tab");
        if (tab && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
            var tabs = tab.closest("[data-kit-tabs]");
            var all = Array.prototype.slice.call(tabs.querySelectorAll(".kit-tab"));
            var next = all[(all.indexOf(tab) + (e.key === "ArrowRight" ? 1 : -1) + all.length) % all.length];
            next.focus();
            selectTab(tabs, next);
        }
    });

    /* ---------- Inizializzazione ---------- */
    function init(scope) {
        scope = scope || document;
        scope.querySelectorAll("[data-kit-select]").forEach(function (sel) {
            var btn = sel.querySelector(".kit-select-btn");
            var pop = sel.querySelector(".kit-pop");
            if (btn) { btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false"); }
            if (pop) pop.setAttribute("role", "listbox");
            var on = sel.querySelector(".kit-opt.is-on");
            if (on) {
                sel.dataset.value = on.dataset.value || "";
                var label = sel.querySelector(".kit-select-value");
                var text = on.querySelector(".kit-opt-text b");
                if (label && !label.textContent.trim()) label.textContent = (text || on).textContent.trim();
            }
            sel.querySelectorAll(".kit-opt").forEach(function (o) {
                o.setAttribute("role", "option");
                o.setAttribute("aria-selected", String(o.classList.contains("is-on")));
            });
        });
        scope.querySelectorAll("[data-kit-tabs]").forEach(function (tabs) {
            tabs.setAttribute("role", "tablist");
            var cur = tabs.querySelector(".kit-tab.is-on") || tabs.querySelector(".kit-tab");
            tabs.querySelectorAll(".kit-tab").forEach(function (t) { t.setAttribute("role", "tab"); });
            if (cur) selectTab(tabs, cur);
        });
        scope.querySelectorAll("[data-kit-theme-set]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-theme-set") === theme.get()));
        });
    }

    // Applica subito il tema salvato (evita il lampo se lo script è nel <head>).
    var saved = readStored();
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
    else init();

    window.Kit = { theme: theme, toast: toast, init: init };
})();
