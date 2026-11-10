/*!
 * Dashboard Kit 0.4.0 — JavaScript opzionale. Nessuna dipendenza, niente innerHTML, niente eval:
 * compatibile con una Content-Security-Policy rigida (script-src 'self').
 *
 * Si attiva da solo con attributi data-kit-*:
 *   data-kit-theme-set="auto|light|dark"     bottone che imposta il tema
 *   data-kit-fs-set="sm|md|lg|xl"            bottone che imposta la dimensione del testo (87,5% · 100% · 112,5% · 125%)
 *   data-kit-fs-step="1|-1"                  bottone che ingrandisce o rimpicciolisce il testo di un passo
 *   data-kit-reset                           bottone che ripristina tema, testo e larghezza
 *   data-kit-layout-set="boxed|fluid"        bottone che sceglie contenuto centrato o a tutta larghezza
 *   data-kit-layout-toggle                   bottone che alterna le due larghezze
 *   data-kit-toggle="#id"                    bottone che apre/chiude un .kit-pop
 *   data-kit-select                          su .kit-select: scelta di un valore
 *   data-kit-tabs                            su .kit-tabs: tab con data-kit-panel="#id"
 *   data-kit-nav="#id"                       bottone (hamburger) che apre/chiude il menu a scomparsa di una .kit-navbar
 *   data-kit-open="#dialogId"                apre un <dialog>
 *   data-kit-close                           dentro un <dialog>, lo chiude
 *   data-kit-confirm="Domanda?"              su un bottone, link o form: prima chiede conferma (opzioni: data-kit-confirm-text,
 *                                            -ok, -cancel, -danger, -type="testo da digitare")
 *   data-kit-tip="testo"                     tooltip (solo CSS; con kit.js Esc lo nasconde)
 *   data-kit-dismiss                         dentro un .kit-alert, lo rimuove (evento "kit:dismiss")
 *
 * API: window.Kit.theme.get()/set(), Kit.layout.get()/set()/toggle(), Kit.fontSize.get()/set()/step(), Kit.reset(), Kit.toast(testo, opzioni), Kit.toast.clear(), Kit.confirm(domanda, opzioni), Kit.undo(testo, opzioni), Kit.init(radice)
 * Eventi: "kit:change" (select), "kit:tab" (tab), "kit:theme" (tema), "kit:layout" (larghezza), "kit:fs" (dimensione del testo), "kit:reset" (impostazioni ripristinate), "kit:dismiss" (avviso chiuso)
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
                var on = b.getAttribute("data-kit-theme-set") === v;
                // voce di un menu (.kit-opt, role="menuitemradio"): aria-checked e spunta; bottone normale: aria-pressed
                if (b.classList.contains("kit-opt")) { b.setAttribute("aria-checked", String(on)); b.classList.toggle("is-on", on); }
                else b.setAttribute("aria-pressed", String(on));
            });
            root.dispatchEvent(new CustomEvent("kit:theme", { detail: v }));
        }
    };

    /* ---------- Dimensione del testo: sm, md (predefinita), lg, xl ---------- */
    var FKEY = "kit-fs";
    var FS_STEPS = ["sm", "md", "lg", "xl"];

    function readFs() {
        try {
            var v = localStorage.getItem(FKEY);
            return FS_STEPS.indexOf(v) >= 0 ? v : null;
        } catch (e) { return null; }
    }

    function syncFsButtons() {
        var cur = fontSize.get(), i = FS_STEPS.indexOf(cur);
        document.querySelectorAll("[data-kit-fs-set]").forEach(function (b) {
            var on = b.getAttribute("data-kit-fs-set") === cur;
            if (b.classList.contains("kit-opt")) { b.setAttribute("aria-checked", String(on)); b.classList.toggle("is-on", on); }
            else b.setAttribute("aria-pressed", String(on));
        });
        document.querySelectorAll("[data-kit-fs-step]").forEach(function (b) {
            var d = parseInt(b.getAttribute("data-kit-fs-step"), 10) || 0;
            b.disabled = i + d < 0 || i + d >= FS_STEPS.length;
        });
    }

    var fontSize = {
        get: function () {
            var v = root.getAttribute("data-kit-fs");
            return FS_STEPS.indexOf(v) >= 0 ? v : "md";
        },
        set: function (v) {
            if (FS_STEPS.indexOf(v) < 0) v = "md";
            if (v === "md") root.removeAttribute("data-kit-fs");
            else root.setAttribute("data-kit-fs", v);
            try {
                if (v === "md") localStorage.removeItem(FKEY);
                else localStorage.setItem(FKEY, v);
            } catch (e) { /* storage non disponibile: vale solo per questa pagina */ }
            syncFsButtons();
            root.dispatchEvent(new CustomEvent("kit:fs", { detail: v }));
        },
        step: function (d) {
            var i = FS_STEPS.indexOf(fontSize.get()) + (d < 0 ? -1 : 1);
            fontSize.set(FS_STEPS[Math.max(0, Math.min(FS_STEPS.length - 1, i))]);
        }
    };

    /* ---------- Larghezza del contenuto: centrato (boxed) o a tutta larghezza (fluid) ---------- */
    var LKEY = "kit-layout";
    var authoredLayout = root.getAttribute("data-layout") === "fluid" ? "fluid" : "boxed";   // quella scritta nell'HTML

    function readLayout() {
        try {
            var v = localStorage.getItem(LKEY);
            return v === "boxed" || v === "fluid" ? v : null;
        } catch (e) { return null; }
    }

    function syncLayoutButtons() {
        var cur = layout.get();
        document.querySelectorAll("[data-kit-layout-set]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-layout-set") === cur));
        });
        document.querySelectorAll("[data-kit-layout-toggle]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(cur === "fluid"));
        });
    }

    var layout = {
        get: function () {
            return root.getAttribute("data-layout") === "fluid" ? "fluid" : "boxed";
        },
        set: function (v) {
            v = v === "fluid" ? "fluid" : "boxed";
            root.setAttribute("data-layout", v);
            try { localStorage.setItem(LKEY, v); } catch (e) { /* storage non disponibile: vale solo per questa pagina */ }
            syncLayoutButtons();
            root.dispatchEvent(new CustomEvent("kit:layout", { detail: v }));
        },
        toggle: function () {
            layout.set(layout.get() === "fluid" ? "boxed" : "fluid");
        }
    };

    /* ---------- Ripristino: tema automatico, testo normale, larghezza scritta nell'HTML ---------- */
    function reset() {
        theme.set("auto");
        fontSize.set("md");
        try { localStorage.removeItem(LKEY); } catch (e) { /* storage non disponibile */ }
        root.setAttribute("data-layout", authoredLayout);
        syncLayoutButtons();
        root.dispatchEvent(new CustomEvent("kit:layout", { detail: authoredLayout }));
        root.dispatchEvent(new CustomEvent("kit:reset"));
    }

    // Dentro un pannello di impostazioni (.kit-settings) il menu resta aperto: si cambiano più cose di fila.
    function keepOpen(btn) { return !!btn.closest(".kit-settings"); }

    /* ---------- Toast ----------
       Kit.toast("testo")  oppure  Kit.toast("testo", { type, title, duration, position, action, closable, progress, onClose })
       (il secondo argomento può anche essere solo la durata in ms). Restituisce { close() }.
       Si costruisce con createElement/textContent: il testo non è mai interpretato come HTML. */
    var TOAST_MAX = 6;                       // oltre questo numero il più vecchio si chiude
    var TOAST_POS = { "bottom": 1, "top": 1, "bottom-start": 1, "bottom-end": 1, "top-start": 1, "top-end": 1 };
    var TOAST_ICON = { info: "i-info", success: "i-ok", warning: "i-warn", danger: "i-error" };

    function toastBox(pos) {
        var box = document.querySelector('.kit-toasts[data-pos="' + pos + '"]');
        if (!box) {
            box = document.createElement("div");
            box.className = "kit-toasts";
            box.setAttribute("data-pos", pos);
            document.body.appendChild(box);
        }
        return box;
    }

    // Quando un toast entra o esce, gli altri scorrono al loro nuovo posto invece di scattare (FLIP: si misura la
    // posizione prima, si cambia il DOM, poi ogni vicino parte dalla vecchia posizione e arriva alla nuova).
    function flip(box, change) {
        var items = Array.prototype.filter.call(box.children, function (e) { return !e.classList.contains("is-leaving"); });
        // Posizione sullo schermo senza le transizioni in corso: sopra del contenitore + posizione nel contenitore
        // (nei contenitori ancorati in basso è il contenitore a spostarsi, non i figli).
        function y(e) { return box.getBoundingClientRect().top + e.offsetTop; }
        var before = items.map(y);
        change();
        if (!box.animate || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
        items.forEach(function (e, i) {
            if (!e.isConnected || e.classList.contains("is-leaving")) return;
            var d = before[i] - y(e);
            if (d) e.animate([{ transform: "translateY(" + d + "px)" }, { transform: "translateY(0)" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
        });
    }

    function toast(text, opts) {
        if (typeof opts === "number") opts = { duration: opts };
        opts = opts || {};
        var type = TOAST_ICON[opts.type] ? opts.type : "neutral";
        var pos = TOAST_POS[opts.position] ? opts.position : "bottom";
        var duration = typeof opts.duration === "number" ? opts.duration : 4000;     // 0 = resta finché non si chiude
        var closable = opts.closable !== undefined ? !!opts.closable : (duration === 0 || !!opts.action);
        var box = toastBox(pos);

        var el = document.createElement("div");
        el.className = "kit-toast" + (type !== "neutral" ? " kit-toast-" + type : "");
        el.setAttribute("role", type === "danger" || type === "warning" ? "alert" : "status");

        // L'icona c'è solo se lo sprite (kit-icons.js o il tuo) definisce il simbolo.
        if (TOAST_ICON[type] && document.getElementById(TOAST_ICON[type])) {
            var NS = "http://www.w3.org/2000/svg";
            var svg = document.createElementNS(NS, "svg");
            svg.setAttribute("class", "kit-icon kit-toast-icon");
            svg.setAttribute("aria-hidden", "true");
            var use = document.createElementNS(NS, "use");
            use.setAttribute("href", "#" + TOAST_ICON[type]);
            svg.appendChild(use);
            el.appendChild(svg);
        }

        var body = document.createElement("div");
        body.className = "kit-toast-body";
        if (opts.title) {
            var t = document.createElement("strong");
            t.className = "kit-toast-title";
            t.textContent = String(opts.title);
            body.appendChild(t);
        }
        var msg = document.createElement("span");
        msg.textContent = String(text);
        body.appendChild(msg);
        el.appendChild(body);

        var timer = null, closed = false;
        var onClose = typeof opts.onClose === "function" ? opts.onClose : null;     // chiamata una volta, quando il toast esce
        // Il toast che esce si dissolve fuori dal flusso (position: absolute, dove si trova): i vicini si spostano subito.
        function leave() {
            if (closed) return;
            closed = true;
            clearTimeout(timer);
            if (onClose) setTimeout(onClose, 0);
            if (barAnim) barAnim.pause();
            // Uscendo dal flusso il contenitore si restringe e (se è ancorato in basso) si sposta: il toast va quindi
            // ancorato a dove si trova sullo schermo adesso, non alla sua posizione dentro il contenitore.
            var box = el.parentNode, screenTop = box.getBoundingClientRect().top + el.offsetTop;
            el.style.left = el.offsetLeft + "px";
            el.style.width = el.offsetWidth + "px";
            el.classList.remove("is-on");
            el.classList.add("is-leaving");
            el.style.top = (screenTop - box.getBoundingClientRect().top) + "px";
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
        }
        function close() {
            if (closed || !el.parentNode) return;
            flip(el.parentNode, leave);
        }
        el.kitLeave = leave;
        el.kitClose = close;

        if (opts.action && opts.action.label) {
            var act = document.createElement("button");
            act.type = "button";
            act.className = "kit-toast-action";
            act.textContent = String(opts.action.label);
            act.addEventListener("click", function () {
                if (typeof opts.action.onClick === "function") opts.action.onClick();
                close();
            });
            el.appendChild(act);
        }
        if (closable) {
            var x = document.createElement("button");
            x.type = "button";
            x.className = "kit-toast-close";
            x.setAttribute("aria-label", "Chiudi");
            x.textContent = "×";
            x.addEventListener("click", close);
            el.appendChild(x);
        }

        // Il timer si ferma mentre il mouse o il focus sono sul toast, così c'è il tempo di leggerlo e usarlo.
        // La barra in fondo si accorcia fino alla chiusura (opzione progress: false la toglie). Quando il tempo si
        // ferma e riparte da capo, anche la barra torna piena e riparte.
        var bar = null, barAnim = null;
        if (duration > 0 && opts.progress !== false) {
            bar = document.createElement("span");
            bar.className = "kit-toast-bar";
            bar.setAttribute("aria-hidden", "true");
            el.appendChild(bar);
        }
        function runBar() {
            if (!bar || !bar.animate) return;
            if (barAnim) barAnim.cancel();
            barAnim = bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: duration, easing: "linear", fill: "forwards" });
        }
        function stopBar() { if (barAnim) { barAnim.cancel(); barAnim = null; } }
        function arm() { if (duration > 0 && !closed) { clearTimeout(timer); timer = setTimeout(close, duration); runBar(); } }
        function hold() { clearTimeout(timer); stopBar(); }
        el.addEventListener("mouseenter", hold);
        el.addEventListener("mouseleave", arm);
        el.addEventListener("focusin", hold);
        el.addEventListener("focusout", arm);

        flip(box, function () {
            // oltre TOAST_MAX il più vecchio esce (con la stessa dissolvenza)
            var live = Array.prototype.filter.call(box.children, function (e) { return !e.classList.contains("is-leaving"); });
            while (live.length >= TOAST_MAX) { var old = live.shift(); if (old.kitLeave) old.kitLeave(); else box.removeChild(old); }
            box.appendChild(el);
            // Su schermi bassi sei toast possono non starci: esce il più vecchio finché la pila entra nella finestra.
            live.push(el);
            while (live.length > 1 && box.offsetHeight > window.innerHeight) { var o = live.shift(); if (o.kitLeave) o.kitLeave(); else box.removeChild(o); }
        });
        void el.offsetWidth;              // forza il calcolo dello stile: senza, la transizione d'entrata non parte
        el.classList.add("is-on");
        arm();
        return { close: close };
    }

    /* ---------- Annulla invece di chiedere conferma ----------
       Kit.undo("Fattura eliminata", { onUndo, onCommit, duration, label, type, position })
       L'azione si considera fatta subito nell'interfaccia; onCommit (quella vera, definitiva) parte quando il toast
       sparisce senza che l'utente abbia premuto "Annulla" (scadenza, chiusura con la ×, pagina chiusa o ricaricata).
       Restituisce { undo(), commit() }. */
    function undo(text, opts) {
        opts = opts || {};
        var done = false, handle = null;
        function commit() {
            if (done) return;
            done = true;
            window.removeEventListener("pagehide", commit);
            if (typeof opts.onCommit === "function") opts.onCommit();
        }
        function undoNow() {
            if (done) return;
            done = true;
            window.removeEventListener("pagehide", commit);
            if (typeof opts.onUndo === "function") opts.onUndo();
        }
        window.addEventListener("pagehide", commit);
        handle = toast(text, {
            type: opts.type,
            position: opts.position,
            duration: typeof opts.duration === "number" ? opts.duration : 6000,
            action: { label: opts.label || "Annulla", onClick: undoNow },
            onClose: commit
        });
        return { undo: function () { undoNow(); handle.close(); }, commit: function () { commit(); handle.close(); } };
    }

    // Kit.toast.clear(): chiude tutti i toast aperti
    toast.clear = function () {
        document.querySelectorAll(".kit-toast").forEach(function (el) { if (el.kitClose) el.kitClose(); else el.remove(); });
    };

    /* ---------- Conferma ----------
       Kit.confirm("Eliminare 12 fatture?", { text, confirm, cancel, danger, type }) → Promise<boolean>
       Un <dialog> modale creato al volo (role="alertdialog"): Esc, click sullo sfondo e "Annulla" danno false.
       Con danger il bottone di conferma è rosso e il focus parte su "Annulla", così un Invio distratto non fa danni.
       Con type: "testo" l'utente deve digitare quel testo per abilitare la conferma (il focus parte sul campo). */
    var confirmSeq = 0;
    function mkEl(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }

    function confirmDialog(title, opts) {
        if (typeof opts === "string") opts = { text: opts };
        opts = opts || {};
        var danger = !!opts.danger, typed = opts.type ? String(opts.type) : "";
        var id = "kit-confirm-" + (++confirmSeq);

        var dlg = mkEl("dialog", "kit-dialog kit-confirm" + (danger ? " kit-confirm-danger" : ""));
        dlg.setAttribute("role", "alertdialog");
        dlg.setAttribute("aria-labelledby", id + "-t");

        var body = mkEl("div", "kit-card-body");
        var iconId = danger ? "i-warn" : "i-info";
        if (document.getElementById(iconId)) {
            var NS = "http://www.w3.org/2000/svg";
            var wrap = mkEl("span", "kit-confirm-icon");
            var svg = document.createElementNS(NS, "svg");
            svg.setAttribute("class", "kit-icon");
            svg.setAttribute("aria-hidden", "true");
            var use = document.createElementNS(NS, "use");
            use.setAttribute("href", "#" + iconId);
            svg.appendChild(use);
            wrap.appendChild(svg);
            body.appendChild(wrap);
        }
        var txt = mkEl("div", "kit-confirm-text");
        var h = mkEl("strong", "kit-confirm-title", String(title || "Confermi l'azione?"));
        h.id = id + "-t";
        txt.appendChild(h);
        if (opts.text) {
            var p = mkEl("p", "", String(opts.text));
            p.id = id + "-d";
            txt.appendChild(p);
            dlg.setAttribute("aria-describedby", id + "-d");
        }
        var input = null;
        if (typed) {
            var lab = mkEl("label", "kit-field");
            lab.appendChild(document.createTextNode("Per confermare scrivi "));
            lab.appendChild(mkEl("b", "", typed));
            input = mkEl("input", "kit-input");
            input.type = "text";
            input.autocomplete = "off";
            input.spellcheck = false;
            input.setAttribute("autocapitalize", "off");
            lab.appendChild(input);
            txt.appendChild(lab);
        }
        body.appendChild(txt);
        dlg.appendChild(body);

        var foot = mkEl("div", "kit-card-foot");
        var cancel = mkEl("button", "kit-btn", String(opts.cancel || "Annulla"));
        cancel.type = "button";
        var ok = mkEl("button", "kit-btn " + (danger ? "kit-btn-danger-solid" : "kit-btn-primary"), String(opts.confirm || "Conferma"));
        ok.type = "button";
        if (typed) ok.disabled = true;
        foot.appendChild(cancel);
        foot.appendChild(ok);
        dlg.appendChild(foot);

        // il focus parte sul campo, su "Annulla" se l'azione è pericolosa, altrimenti sulla conferma
        (input || (danger ? cancel : ok)).setAttribute("autofocus", "");

        return new Promise(function (resolve) {
            cancel.addEventListener("click", function () { dlg.close("cancel"); });
            ok.addEventListener("click", function () { dlg.close("ok"); });
            if (input) {
                input.addEventListener("input", function () { ok.disabled = input.value.trim() !== typed; });
                input.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); if (!ok.disabled) ok.click(); }
                });
            }
            dlg.addEventListener("close", function () {
                resolve(dlg.returnValue === "ok");
                setTimeout(function () { if (dlg.parentNode) dlg.parentNode.removeChild(dlg); }, 300);   // dopo l'animazione d'uscita
            });
            document.body.appendChild(dlg);
            dlg.showModal();
        });
    }

    // data-kit-confirm: la conferma si chiede prima di qualunque altra azione dell'elemento (anche i tuoi gestori di click).
    var passing = null;   // l'elemento che ha appena avuto conferma: il suo click o invio va lasciato passare

    function confirmFor(el) {
        var a = function (n) { return el.getAttribute("data-kit-confirm" + n); };
        return confirmDialog(a("") || undefined, {
            text: a("-text"),
            confirm: a("-ok"),
            cancel: a("-cancel"),
            danger: el.hasAttribute("data-kit-confirm-danger"),
            type: a("-type")
        });
    }

    document.addEventListener("click", function (e) {
        var t = e.target instanceof Element && e.target.closest("[data-kit-confirm]");
        if (!t || t.tagName === "FORM" || t === passing) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmFor(t).then(function (yes) {
            if (!yes) return;
            passing = t;
            try { t.click(); } finally { passing = null; }
        });
    }, true);

    document.addEventListener("submit", function (e) {
        var f = e.target;
        if (!(f instanceof HTMLFormElement) || !f.hasAttribute("data-kit-confirm") || f === passing) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var sub = e.submitter;
        confirmFor(f).then(function (yes) {
            if (!yes) return;
            passing = f;
            try { f.requestSubmit(sub || undefined); } finally { passing = null; }
        });
    }, true);

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
            var first = pop.querySelector(".kit-opt.is-on:not([aria-disabled='true']), .kit-opt:not([aria-disabled='true'])");
            if (first) first.classList.add("is-active");
            pop.tabIndex = -1;
            pop.focus({ preventScroll: true });
        }
    }

    /* ---------- Navigazione da tastiera nelle opzioni ---------- */
    function options(pop) {
        // le voci disattivate (aria-disabled) si saltano con le frecce
        return Array.prototype.slice.call(pop.querySelectorAll(".kit-opt:not([aria-disabled='true'])"));
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
            Array.prototype.forEach.call(pop.querySelectorAll(".kit-opt"), function (o) {
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

    /* ---------- Navbar: menu a scomparsa ---------- */
    function setNav(menu, open) {
        menu.classList.toggle("is-open", open);
        document.querySelectorAll('[data-kit-nav="#' + menu.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
        if (!open) closePop(false);
    }

    function openNavs() { return Array.prototype.slice.call(document.querySelectorAll(".kit-navbar-menu.is-open")); }

    window.addEventListener("resize", function () {
        // Se il menu è diventato visibile in linea (il bottone è nascosto), lo stato "aperto" non serve più.
        openNavs().forEach(function (m) {
            var b = document.querySelector('[data-kit-nav="#' + m.id + '"]');
            if (b && b.offsetParent === null) setNav(m, false);
        });
    });

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

        var navBtn = t.closest("[data-kit-nav]");
        if (navBtn) {
            var menu = document.querySelector(navBtn.getAttribute("data-kit-nav"));
            if (menu) { closePop(false); setNav(menu, !menu.classList.contains("is-open")); }
            return;
        }
        // Un click fuori dalla barra, o su un link del menu, chiude il menu a scomparsa.
        openNavs().forEach(function (m) {
            var bar = m.closest(".kit-navbar") || m.parentNode;
            var link = t.closest("a[href]");
            if (!bar.contains(t) || (link && m.contains(link))) setNav(m, false);
        });

        var themeBtn = t.closest("[data-kit-theme-set]");
        if (themeBtn) { theme.set(themeBtn.getAttribute("data-kit-theme-set")); if (!keepOpen(themeBtn)) closePop(false); return; }

        var fsBtn = t.closest("[data-kit-fs-set]");
        if (fsBtn) { fontSize.set(fsBtn.getAttribute("data-kit-fs-set")); if (!keepOpen(fsBtn)) closePop(false); return; }

        var fsStep = t.closest("[data-kit-fs-step]");
        if (fsStep) { fontSize.step(parseInt(fsStep.getAttribute("data-kit-fs-step"), 10) || 0); return; }

        if (t.closest("[data-kit-reset]")) { reset(); return; }

        var layoutBtn = t.closest("[data-kit-layout-set]");
        if (layoutBtn) { layout.set(layoutBtn.getAttribute("data-kit-layout-set")); return; }

        if (t.closest("[data-kit-layout-toggle]")) { layout.toggle(); return; }

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
            if (dlg && dlg.showModal) {
                dlg.showModal();
                // Il browser darebbe il focus al primo elemento (spesso la X di chiusura, con il suo anello):
                // lo si sposta sul dialog stesso, salvo che l'autore abbia indicato un [autofocus].
                if (!dlg.querySelector("[autofocus]")) { dlg.tabIndex = -1; dlg.focus({ preventScroll: true }); }
            }
            return;
        }

        var dismiss = t.closest("[data-kit-dismiss]");
        if (dismiss) {
            var al = dismiss.closest(".kit-alert");
            if (al) {
                var parent = al.parentNode;
                al.remove();
                parent.dispatchEvent(new CustomEvent("kit:dismiss", { bubbles: true }));
            }
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
        // Esc nasconde i tooltip visibili (finché il mouse o il focus non lasciano l'elemento)
        if (e.key === "Escape") {
            document.querySelectorAll("[data-kit-tip]:is(:hover, :focus-visible)").forEach(function (el) {
                el.setAttribute("data-kit-tip-hide", "");
                function show() {
                    el.removeAttribute("data-kit-tip-hide");
                    el.removeEventListener("mouseleave", show);
                    el.removeEventListener("blur", show);
                }
                el.addEventListener("mouseleave", show);
                el.addEventListener("blur", show);
            });
        }

        if (openPop) {
            if (e.key === "Escape") { e.preventDefault(); closePop(true); return; }
            if (e.key === "ArrowDown") { e.preventDefault(); moveActive(openPop.pop, 1); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); moveActive(openPop.pop, -1); return; }
            if (e.key === "Enter" || e.key === " ") {
                var a = openPop.pop.querySelector(".kit-opt.is-active");
                // click() attiva la voce come un click vero: partono anche i suoi gestori e i link
                if (a) { e.preventDefault(); a.click(); return; }
            }
        }
        // Esc chiude il menu a scomparsa della navbar e riporta il focus sul suo bottone.
        if (e.key === "Escape") {
            var om = openNavs()[0];
            if (om) {
                setNav(om, false);
                var ob = document.querySelector('[data-kit-nav="#' + om.id + '"]');
                if (ob && ob.offsetParent !== null) ob.focus();
                return;
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
        scope.querySelectorAll("[data-kit-nav]").forEach(function (b) {
            b.setAttribute("aria-expanded", "false");
            var id = b.getAttribute("data-kit-nav");
            if (id.charAt(0) === "#" && !b.hasAttribute("aria-controls")) b.setAttribute("aria-controls", id.slice(1));
        });
        syncLayoutButtons();
        syncFsButtons();
        scope.querySelectorAll("[data-kit-theme-set]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-theme-set") === theme.get()));
        });
    }

    // Applica subito il tema salvato (evita il lampo se lo script è nel <head>).
    var saved = readStored();
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

    // Idem per la dimensione del testo.
    var savedFs = readFs();
    if (savedFs) root.setAttribute("data-kit-fs", savedFs);

    // Idem per la larghezza: la scelta dell'utente vince su quella scritta nell'HTML.
    var savedLayout = readLayout();
    if (savedLayout) root.setAttribute("data-layout", savedLayout);

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
    else init();

    window.Kit = { theme: theme, layout: layout, fontSize: fontSize, reset: reset, toast: toast, undo: undo, confirm: confirmDialog, init: init };
})();
