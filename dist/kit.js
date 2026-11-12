/*!
 * Dashboard Kit 0.9.0 — JavaScript opzionale. Nessuna dipendenza, niente innerHTML, niente eval:
 * compatibile con una Content-Security-Policy rigida (script-src 'self').
 *
 * Si attiva da solo con attributi data-kit-*:
 *   data-kit-theme-set="auto|light|dark"     bottone che imposta il tema
 *   data-kit-fs-set="md|lg|xl"               bottone che imposta la dimensione del testo (normale · grande · molto grande)
 *   data-kit-fs-step="1|-1"                  bottone che ingrandisce o rimpicciolisce il testo di un passo
 *   data-kit-reset                           bottone che ripristina tema, testo e larghezza
 *   data-kit-layout-set="boxed|fluid"        bottone che sceglie contenuto centrato o a tutta larghezza
 *   data-kit-layout-toggle                   bottone che alterna le due larghezze
 *   data-kit-sidebar-toggle                  bottone che apre la .kit-sidebar a comparsa (schermi piccoli) o la comprime a sole icone (schermi grandi, scelta ricordata)
 *   data-kit-toggle="#id"                    bottone che apre/chiude un .kit-pop
 *   data-kit-select                          su .kit-select: scelta di un valore; su un <select>: lo sostituisce con il menu del kit (opzioni: data-kit-search, -empty, -placeholder)
 *   data-kit-combo                           su .kit-combo: campo di testo con elenco di suggerimenti (opzioni: data-kit-combo-max, -empty, -more)
 *   data-kit-split                           su .kit-split: Esc lo chiude; con data-kit-split-open="#id" (bottone fuori), data-kit-split-close e
 *                                            data-kit-split-full (dentro) si apre, chiude e porta a tutta larghezza il pannello
 *   data-kit-file                            su .kit-file o .kit-dropzone: campo file con controllo di tipo e dimensione (data-kit-file-max in MB,
 *                                            data-kit-file-dir per le cartelle, data-kit-file-page per rilasciare ovunque nella pagina)
 *   data-kit-code="html|js|css"              su <pre class="kit-code">: colora il codice (senza lingua la indovina); data-kit-code-copy aggiunge il bottone «Copia»
 *   data-kit-sort                            su .kit-table: le intestazioni (<th>) ordinano le righe (con ="multi", Shift o Ctrl/⌘ + clic ordina per più colonne; numeri, date e testo si riconoscono da soli; data-kit-type e data-kit-value per forzarli, data-kit-nosort per escludere una colonna)
 *   data-kit-filter="#tabella"               su un campo di testo: mostra solo le righe che contengono tutte le parole scritte
 *   data-kit-page="N"                        su .kit-table: mostra N righe per volta, con la paginazione sotto (data-kit-empty cambia il testo «Nessun risultato»)
 *   (htmx)                                   i frammenti inseriti da htmx si inizializzano da soli (evento htmx:load)
 *   data-kit-tabs                            su .kit-tabs: tab con data-kit-panel="#id"
 *   data-kit-nav="#id"                       bottone (hamburger) che apre/chiude il menu a scomparsa di una .kit-navbar
 *   data-kit-open="#dialogId"                apre un <dialog>
 *   data-kit-close                           dentro un <dialog>, lo chiude
 *   data-kit-confirm="Domanda?"              su un bottone, link o form: prima chiede conferma (opzioni: data-kit-confirm-text,
 *                                            -ok, -cancel, -danger, -type="testo da digitare")
 *   data-kit-tip="testo"                     tooltip (solo CSS; con kit.js Esc lo nasconde)
 *   data-kit-dismiss                         dentro un .kit-alert, lo rimuove (evento "kit:dismiss")
 *
 * API: window.Kit.theme.get()/set(), Kit.layout.get()/set()/toggle(), Kit.sidebar.get()/set()/toggle()/open()/close(), Kit.fontSize.get()/set()/step(), Kit.reset(), Kit.toast(testo, opzioni), Kit.toast.clear(), Kit.confirm(domanda, opzioni), Kit.undo(testo, opzioni), Kit.split(elemento), Kit.file(elemento, opzioni), Kit.progress(testo, opzioni), Kit.combo(elemento, opzioni), Kit.select(elemento, opzioni), Kit.code(elemento, opzioni), Kit.highlight(testo, lingua), Kit.barChart(elemento, opzioni), Kit.lineChart(…), Kit.donut(…), Kit.sparkline(…), Kit.table(tabella, opzioni), Kit.paginate(tabella, righe), Kit.init(radice)
 * Eventi: "kit:change" (select, combobox), "kit:select" (barra, punto o fetta di un grafico), "kit:tab" (tab), "kit:files" (file scelti o rilasciati), "kit:copy" (codice copiato), "kit:sort" (tabella ordinata), "kit:filter" (tabella filtrata), "kit:page" (pagina della tabella cambiata), "kit:split" (pannello aperto, chiuso o a tutta larghezza), "kit:theme" (tema), "kit:layout" (larghezza), "kit:sidebar" (sidebar compressa, espansa, aperta o chiusa), "kit:fs" (dimensione del testo), "kit:reset" (impostazioni ripristinate), "kit:dismiss" (avviso chiuso)
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

    /* ---------- Dimensione del testo: md (predefinita), lg, xl ---------- */
    var FKEY = "kit-fs";
    var FS_STEPS = ["md", "lg", "xl"];

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

    /* ---------- Sidebar: a comparsa sugli schermi piccoli, compatta (solo icone) su quelli grandi ----------
       <aside class="kit-sidebar"> dentro .kit-app. Il bottone data-kit-sidebar-toggle (opz. ="#id") la apre/chiude quando è a comparsa
       e la comprime/espande quando è in linea. Lo stato compatto è <html data-kit-sidebar="collapsed|expanded"> e si ricorda. */
    var SIDEKEY = "kit-sidebar";
    var authoredSide = root.getAttribute("data-kit-sidebar") === "collapsed" ? "collapsed" : "expanded";
    var sideOpener = null;       // chi ha aperto la sidebar a comparsa: il focus torna lì alla chiusura

    function readSide() {
        try {
            var v = localStorage.getItem(SIDEKEY);
            return v === "collapsed" || v === "expanded" ? v : null;
        } catch (e) { return null; }
    }
    function sideBar(sel) { return document.querySelector(sel || ".kit-sidebar"); }
    // A comparsa = fuori dal flusso (position: fixed); in linea = sticky nella colonna.
    function sideDrawer(sb) { return getComputedStyle(sb).position === "fixed"; }

    function sideSync() {
        var collapsed = root.getAttribute("data-kit-sidebar") === "collapsed";
        document.querySelectorAll(".kit-sidebar").forEach(function (sb) {
            var drawer = sideDrawer(sb);
            var open = sb.classList.contains("is-open");
            if (open && !drawer) { sb.classList.remove("is-open"); open = false; }   // la finestra si è allargata
            // il resto della pagina non si raggiunge mentre la sidebar a comparsa è aperta
            Array.prototype.forEach.call(sb.parentNode.children, function (c) {
                if (c !== sb) { if (open) c.setAttribute("inert", ""); else c.removeAttribute("inert"); }
            });
            // compatta: i testi spariscono (display: none), quindi ogni voce porta il suo nome come aria-label
            sb.querySelectorAll(SIDETIP).forEach(function (a) {
                if (collapsed && !drawer) {
                    if (!a.hasAttribute("aria-label") && !a.hasAttribute("aria-labelledby")) {
                        var label = sideLabel(a);
                        if (label) { a.setAttribute("aria-label", label); a.setAttribute("data-kit-autolabel", ""); }
                    }
                } else if (a.hasAttribute("data-kit-autolabel")) {
                    a.removeAttribute("aria-label");
                    a.removeAttribute("data-kit-autolabel");
                }
            });
            if (!collapsed || drawer) sideTipHide();
            document.querySelectorAll("[data-kit-sidebar-toggle]").forEach(function (b) {
                var target = sideBar(b.getAttribute("data-kit-sidebar-toggle"));
                if (target !== sb) return;
                b.setAttribute("aria-expanded", String(drawer ? open : !collapsed));
            });
        });
    }

    /* Sidebar compatta: il nome di ogni voce compare subito accanto all'icona (mouse e tastiera). È un elemento fuori dalla
       sidebar, in position: fixed, perché il corpo della sidebar scorre e taglierebbe un tooltip in CSS. */
    var SIDETIP = ".kit-side-link, .kit-side-user, .kit-side-tools .kit-btn, .kit-sidebar-head .kit-brand";
    var sideTipEl = null, sideTipFor = null;

    function sideLabel(el) {
        var tx = el.querySelector(".kit-side-text, .kit-side-user-text > :first-child");
        var label = tx ? tx.textContent.trim() : (el.getAttribute("aria-label") || el.getAttribute("data-kit-label") || el.getAttribute("title") || "").trim();
        var badge = el.querySelector(".kit-badge");
        if (tx && badge && badge.textContent.trim()) label += " (" + badge.textContent.trim() + ")";
        return label;
    }
    function sideTipHide() {
        if (sideTipEl) { sideTipEl.classList.remove("is-on"); sideTipEl.hidden = true; }
        if (sideTipFor && sideTipFor.hasAttribute("data-kit-title")) {   // il title nativo tolto per non avere due suggerimenti
            sideTipFor.setAttribute("title", sideTipFor.getAttribute("data-kit-title"));
            sideTipFor.removeAttribute("data-kit-title");
        }
        sideTipFor = null;
    }
    function sideTipShow(el) {
        var sb = el.closest(".kit-sidebar");
        if (!sb || root.getAttribute("data-kit-sidebar") !== "collapsed" || sideDrawer(sb)) return;
        if (el.closest(".kit-pop") || el.getAttribute("aria-expanded") === "true") return;
        var label = sideLabel(el);
        if (!label) return;
        if (sideTipFor === el) return;
        sideTipHide();
        sideTipFor = el;
        if (el.hasAttribute("title")) { el.setAttribute("data-kit-title", el.getAttribute("title")); el.removeAttribute("title"); }
        if (!sideTipEl) {
            sideTipEl = mkEl("div", "kit-side-tip");
            sideTipEl.setAttribute("role", "tooltip");
            document.body.appendChild(sideTipEl);
        }
        sideTipEl.textContent = label;
        sideTipEl.hidden = false;
        var r = el.getBoundingClientRect();
        sideTipEl.style.left = Math.round(r.right) + "px";      // lo spazio verso l'icona è il bordo trasparente del suggerimento
        sideTipEl.style.top = Math.round(r.top + r.height / 2) + "px";
        void sideTipEl.offsetWidth;                 // fa partire la dissolvenza
        sideTipEl.classList.add("is-on");
    }
    document.addEventListener("mouseover", function (e) {
        var t = e.target instanceof Element ? e.target.closest(SIDETIP) : null;
        if (t && t.closest(".kit-sidebar")) sideTipShow(t); else if (sideTipFor) sideTipHide();
    });
    document.addEventListener("focusin", function (e) {
        var t = e.target instanceof Element ? e.target.closest(SIDETIP) : null;
        if (t && t.closest(".kit-sidebar") && t.matches(":focus-visible")) sideTipShow(t); else if (sideTipFor) sideTipHide();
    });
    document.addEventListener("focusout", function () { if (sideTipFor) sideTipHide(); });
    document.addEventListener("mouseleave", function () { if (sideTipFor) sideTipHide(); });
    document.addEventListener("click", function () { if (sideTipFor) sideTipHide(); });
    document.addEventListener("scroll", function () { if (sideTipFor) sideTipHide(); }, true);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sideTipFor) sideTipHide(); });

    function sideNotify(sb) {
        sb.dispatchEvent(new CustomEvent("kit:sidebar", { bubbles: true, detail: { collapsed: sidebar.get() === "collapsed", open: sb.classList.contains("is-open") } }));
    }

    var sidebar = {
        get: function () { return root.getAttribute("data-kit-sidebar") === "collapsed" ? "collapsed" : "expanded"; },
        set: function (v) {
            v = v === "collapsed" ? "collapsed" : "expanded";
            root.setAttribute("data-kit-sidebar", v);
            try { localStorage.setItem(SIDEKEY, v); } catch (e) { /* storage non disponibile: vale solo per questa pagina */ }
            sideSync();
            var sb = sideBar();
            if (sb) sideNotify(sb);
        },
        toggle: function () { sidebar.set(sidebar.get() === "collapsed" ? "expanded" : "collapsed"); },
        // Sidebar a comparsa. open(opener) ricorda chi l'ha aperta per riportargli il focus.
        open: function (sel, opener) {
            var sb = sideBar(sel);
            if (!sb || !sideDrawer(sb) || sb.classList.contains("is-open")) return;
            sideOpener = opener || document.activeElement;
            sb.classList.add("is-open");
            sideSync();
            sb.tabIndex = -1;
            sb.focus({ preventScroll: true });
            sideNotify(sb);
        },
        close: function (sel) {
            var sb = sideBar(sel);
            if (!sb || !sb.classList.contains("is-open")) return;
            sb.classList.remove("is-open");
            sideSync();
            if (sideOpener && sideOpener.isConnected && sideOpener.focus) sideOpener.focus({ preventScroll: true });
            sideOpener = null;
            sideNotify(sb);
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
        try { localStorage.removeItem(SIDEKEY); } catch (e) { /* storage non disponibile */ }
        root.setAttribute("data-kit-sidebar", authoredSide);
        sideSync();
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
        if (btn) {
            btn.setAttribute("aria-expanded", String(open));
            if (!open) btn.removeAttribute("aria-activedescendant");
        }
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
        // nel combobox il focus resta nel campo: la voce attiva si segnala con aria-activedescendant
        if (openPop && openPop.btn && openPop.btn.getAttribute("role") === "combobox" && list[i].id) openPop.btn.setAttribute("aria-activedescendant", list[i].id);
    }

    function chooseOption(opt) {
        var pop = opt.closest(".kit-pop");
        var ns = selByWrap.get(opt.closest("[data-kit-native]"));
        if (ns) { nativeChoose(ns, opt); return; }
        var cb = opt.closest("[data-kit-combo]");
        if (cb) { comboChoose(cb, opt); closePop(true); return; }
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

    /* ---------- Combobox: campo di testo con elenco di suggerimenti ----------
       <div class="kit-combo" data-kit-combo><input class="kit-input"></div>
       Le voci si danno con Kit.combo(el, { items }) oppure come .kit-opt dentro un .kit-pop già scritto nell'HTML. */
    var comboState = new WeakMap();
    var comboUid = 0;

    function normItem(x) {
        if (x !== null && typeof x === "object") {
            var label = x.label != null ? String(x.label) : String(x.value);
            return { value: x.value != null ? String(x.value) : label, label: label, hint: x.hint ? String(x.hint) : "" };
        }
        return { value: String(x), label: String(x), hint: "" };
    }

    function comboRender(st) {
        var q = st.input.value.trim().toLowerCase();
        var src = typeof st.items === "function" ? st.items(q) : st.items;
        var all = (src || []).map(normItem);
        var hit = (q && st.filter) ? all.filter(function (i) { return (i.label + " " + i.hint + " " + i.value).toLowerCase().indexOf(q) >= 0; }) : all;
        st.pop.textContent = "";
        hit.slice(0, st.max).forEach(function (i, n) {
            var o = mkEl("div", "kit-opt");
            o.id = st.id + "-" + n;
            o.setAttribute("role", "option");
            o.setAttribute("aria-selected", String(i.value === st.input.value));
            o.dataset.value = i.value;
            var box = mkEl("span", "kit-opt-text");
            box.appendChild(mkEl("b", "", i.label));
            if (i.hint) box.appendChild(mkEl("small", "", i.hint));
            o.appendChild(box);
            st.pop.appendChild(o);
        });
        if (hit.length > st.max) st.pop.appendChild(mkEl("div", "kit-pop-empty", st.more.replace("{n}", String(hit.length - st.max))));
        if (!hit.length && st.empty) st.pop.appendChild(mkEl("div", "kit-pop-empty", st.empty));
        var first = st.pop.querySelector(".kit-opt");
        if (first && st.autoActive) first.classList.add("is-active");
        return st.pop.childNodes.length > 0;
    }

    function comboOpen(st) {
        if (!comboRender(st)) { if (!st.pop.hidden) closePop(false); return; }
        if (st.pop.hidden) { closePop(false); setPop(st.pop, st.input, true); }
        var a = st.pop.querySelector(".kit-opt.is-active");
        if (a) st.input.setAttribute("aria-activedescendant", a.id); else st.input.removeAttribute("aria-activedescendant");
    }

    function comboChoose(wrap, opt) {
        var st = comboState.get(wrap);
        if (!st) return;
        var b = opt.querySelector(".kit-opt-text b");
        st.choosing = true;
        st.input.value = opt.dataset.value || "";
        // l'evento "input" fa sapere a chi ascolta il campo che il valore è cambiato
        st.input.dispatchEvent(new Event("input", { bubbles: true }));
        st.choosing = false;
        wrap.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: { value: st.input.value, label: (b || opt).textContent.trim() } }));
    }

    function combo(target, opts) {
        var wrap = typeof target === "string" ? document.querySelector(target) : target;
        if (!wrap) return null;
        if (wrap.matches("input")) {
            var inp0 = wrap;
            wrap = mkEl("div", "kit-combo");
            inp0.parentNode.insertBefore(wrap, inp0);
            wrap.appendChild(inp0);
        }
        opts = opts || {};
        var st = comboState.get(wrap);
        if (st) {
            if (opts.items) st.items = opts.items;
            return st.api;
        }
        wrap.classList.add("kit-combo");
        wrap.setAttribute("data-kit-combo", "");
        var d = wrap.dataset;
        var input = wrap.querySelector("input");
        var pop = wrap.querySelector(".kit-pop");
        if (!input) return null;
        var items = opts.items;
        if (!items && pop) {
            items = Array.prototype.map.call(pop.querySelectorAll(".kit-opt"), function (o) {
                var b = o.querySelector("b"), s = o.querySelector("small");
                var label = (b || o).textContent.trim();
                return { value: o.dataset.value || label, label: label, hint: s ? s.textContent.trim() : "" };
            });
        }
        if (!pop) { pop = mkEl("div", "kit-pop"); wrap.appendChild(pop); }
        pop.hidden = true;
        pop.setAttribute("role", "listbox");
        var id = "kit-combo-" + (++comboUid);
        pop.id = pop.id || id + "-list";
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-controls", pop.id);
        input.setAttribute("autocomplete", "off");
        var chev = wrap.querySelector(".kit-combo-btn");
        if (!chev) {
            chev = mkEl("button", "kit-combo-btn");
            chev.type = "button";
            chev.tabIndex = -1;
            chev.setAttribute("aria-label", opts.buttonLabel || d.kitComboLabel || "Mostra l'elenco");
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "kit-icon");
            var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttribute("href", "#i-chev");
            svg.appendChild(use);
            chev.appendChild(svg);
            wrap.insertBefore(chev, pop);
        }
        st = {
            input: input, pop: pop, id: id, items: items || [], choosing: false,
            max: opts.max || parseInt(d.kitComboMax, 10) || 50,
            filter: opts.filter !== false,
            autoActive: opts.autoActive !== false,
            empty: opts.empty !== undefined ? opts.empty : (d.kitComboEmpty || "Nessun risultato"),
            more: opts.more || d.kitComboMore || "Altri {n} risultati: continua a scrivere per restringere"
        };
        st.api = {
            setItems: function (list) { st.items = list; if (!pop.hidden) comboOpen(st); },
            open: function () { input.focus(); comboOpen(st); },
            close: function () { if (!pop.hidden) closePop(false); }
        };
        comboState.set(wrap, st);

        input.addEventListener("input", function () { if (!st.choosing) comboOpen(st); });
        input.addEventListener("keydown", function (e) {
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && pop.hidden) {
                e.preventDefault();
                e.stopPropagation();   // altrimenti la freccia varrebbe due volte (apre e sposta)
                comboOpen(st);
            }
        });
        chev.addEventListener("mousedown", function (e) { e.preventDefault(); });
        chev.addEventListener("click", function () {
            if (!pop.hidden) closePop(false);
            else { input.focus(); comboOpen(st); }
        });
        // il mouse sulle voci non deve togliere il focus al campo
        pop.addEventListener("mousedown", function (e) { e.preventDefault(); });
        wrap.addEventListener("focusout", function (e) {
            if (!wrap.contains(e.relatedTarget) && openPop && openPop.pop === pop) closePop(false);
        });
        return st.api;
    }

    /* ---------- Select nativo: <select data-kit-select> con il menu del kit ----------
       Il <select> resta la fonte dei dati (valore, form, required, 'change'); il kit gli mette accanto bottone e menu.
       Gruppi (<optgroup>), sottotesto (data-kit-hint) e, oltre 20 voci, un campo di ricerca nel menu.
       Dopo aver cambiato a mano value, voci o disabled: api.sync(). Kit.select(el, { search, empty, placeholder }) fa lo stesso da JavaScript. */
    var selByWrap = new WeakMap();
    var selByNative = new WeakMap();
    var selUid = 0;

    function mkIcon(name, cls) {
        var svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("class", cls || "kit-icon");
        svg.setAttribute("aria-hidden", "true");
        var use = document.createElementNS(SVG_NS, "use");
        use.setAttribute("href", "#i-" + name);
        svg.appendChild(use);
        return svg;
    }

    function nativeItems(sel) {
        var out = [];
        function one(o, off) {
            if (o.hidden) return;
            out.push({ value: o.value, label: o.textContent.trim(), short: o.getAttribute("data-kit-short") || "", hint: o.getAttribute("data-kit-hint") || "", disabled: off || o.disabled });
        }
        Array.prototype.forEach.call(sel.children, function (c) {
            if (c.tagName === "OPTGROUP") {
                out.push({ group: c.label });
                Array.prototype.forEach.call(c.children, function (o) { one(o, c.disabled); });
            } else if (c.tagName === "OPTION") one(c, false);
        });
        return out;
    }

    function nativeSync(st) {
        var o = st.sel.selectedOptions[0];
        var t = o ? (o.getAttribute("data-kit-short") || o.textContent.trim()) : "";
        st.value.textContent = t;
        st.btn.classList.toggle("is-empty", !o || o.value === "");
        st.btn.disabled = st.sel.disabled;
    }

    function nativeList(st) {
        var q = st.q.trim().toLowerCase(), cur = st.sel.value, head = null, shown = 0, n = 0;
        st.list.textContent = "";
        nativeItems(st.sel).forEach(function (x) {
            if (x.group !== undefined) { head = x.group; return; }
            if (q && (x.label + " " + x.hint).toLowerCase().indexOf(q) < 0) return;
            if (head !== null) { st.list.appendChild(mkEl("div", "kit-pop-group", head)); head = null; }
            var on = x.value === cur;
            var o = mkEl("div", "kit-opt" + (on ? " is-on" : ""));
            o.id = st.id + "-" + (n++);
            o.setAttribute("role", "option");
            o.setAttribute("aria-selected", String(on));
            if (x.disabled) o.setAttribute("aria-disabled", "true");
            o.dataset.value = x.value;
            var box = mkEl("span", "kit-opt-text");
            box.appendChild(mkEl("b", "", x.label));
            if (x.hint) box.appendChild(mkEl("small", "", x.hint));
            o.appendChild(box);
            o.appendChild(mkIcon("check", "kit-icon kit-opt-check"));
            st.list.appendChild(o);
            shown++;
        });
        if (!shown) st.list.appendChild(mkEl("div", "kit-pop-empty", st.empty));
        var a = st.list.querySelector(".kit-opt.is-on:not([aria-disabled='true'])") || st.list.querySelector(".kit-opt:not([aria-disabled='true'])");
        if (a) { a.classList.add("is-active"); if (!q) a.scrollIntoView({ block: "nearest" }); }
    }

    function nativeOpen(st) {
        closePop(false);
        st.q = "";
        var count = nativeItems(st.sel).filter(function (x) { return x.group === undefined; }).length;
        var withSearch = st.search === true || (typeof st.search === "number" && count > st.search);
        st.pop.textContent = "";
        st.input = null;
        if (withSearch) {
            var box = mkEl("div", "kit-pop-search");
            var inp = mkEl("input", "kit-input");
            inp.type = "search";
            inp.placeholder = st.placeholder;
            inp.setAttribute("autocomplete", "off");
            inp.setAttribute("aria-label", st.placeholder.replace(/…$/, ""));
            inp.addEventListener("input", function () { st.q = inp.value; nativeList(st); });
            box.appendChild(inp);
            st.pop.appendChild(box);
            st.input = inp;
        }
        st.list = mkEl("div", "kit-pop-list");
        st.list.setAttribute("role", "listbox");
        st.pop.appendChild(st.list);
        nativeList(st);
        st.pop.classList.remove("kit-pop-right");
        setPop(st.pop, st.btn, true);
        if (st.pop.getBoundingClientRect().right > window.innerWidth - 8) st.pop.classList.add("kit-pop-right");
        st.pop.tabIndex = -1;
        (st.input || st.pop).focus({ preventScroll: true });
        st.pop.scrollIntoView({ block: "nearest" });
    }

    function nativeChoose(st, opt) {
        var v = opt.dataset.value || "";
        var changed = st.sel.value !== v;
        st.sel.value = v;
        nativeSync(st);
        closePop(true);
        if (!changed) return;
        st.sel.dispatchEvent(new Event("change", { bubbles: true }));
        var o = st.sel.selectedOptions[0];
        st.wrap.dispatchEvent(new CustomEvent("kit:change", { bubbles: true, detail: { value: v, label: o ? o.textContent.trim() : "" } }));
    }

    function nativeSelect(target, opts) {
        var sel = typeof target === "string" ? document.querySelector(target) : target;
        if (!sel || sel.tagName !== "SELECT") return null;
        var old = selByNative.get(sel);
        if (old) return old.api;
        opts = opts || {};
        var d = sel.dataset;
        var search = opts.search !== undefined ? opts.search : (d.kitSearch !== undefined ? (d.kitSearch === "off" ? false : d.kitSearch === "" ? true : parseInt(d.kitSearch, 10)) : 20);
        var wrap = mkEl("div", "kit-select");
        wrap.setAttribute("data-kit-select", "");
        wrap.setAttribute("data-kit-native", "");
        sel.parentNode.insertBefore(wrap, sel);
        wrap.appendChild(sel);
        sel.removeAttribute("data-kit-select");
        sel.classList.add("kit-sr");
        sel.tabIndex = -1;
        sel.setAttribute("aria-hidden", "true");
        var id = "kit-sel-" + (++selUid);
        var btn = mkEl("button", "kit-select-btn");
        btn.type = "button";
        btn.setAttribute("aria-haspopup", "listbox");
        btn.setAttribute("aria-expanded", "false");
        var value = mkEl("span", "kit-select-value");
        value.id = id + "-v";
        btn.appendChild(value);
        btn.appendChild(mkIcon("chev"));
        var lab = sel.labels && sel.labels[0];
        if (sel.getAttribute("aria-label")) btn.setAttribute("aria-label", sel.getAttribute("aria-label"));
        else if (lab) { lab.id = lab.id || id + "-l"; btn.setAttribute("aria-labelledby", lab.id + " " + value.id); }
        var pop = mkEl("div", "kit-pop");
        pop.hidden = true;
        wrap.appendChild(btn);
        wrap.appendChild(pop);
        var st = {
            sel: sel, wrap: wrap, btn: btn, value: value, pop: pop, id: id, q: "", input: null, list: null, search: search,
            empty: opts.empty !== undefined ? opts.empty : (d.kitEmpty || "Nessun risultato"),
            placeholder: opts.placeholder || d.kitPlaceholder || "Cerca…"
        };
        st.api = {
            sync: function () { nativeSync(st); if (!pop.hidden) nativeList(st); },
            open: function () { if (pop.hidden && !btn.disabled) nativeOpen(st); },
            close: function () { if (!pop.hidden) closePop(false); }
        };
        selByWrap.set(wrap, st);
        selByNative.set(sel, st);
        nativeSync(st);

        btn.addEventListener("keydown", function (e) {
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && pop.hidden) {
                e.preventDefault();
                e.stopPropagation();   // altrimenti la freccia varrebbe due volte (apre e sposta)
                nativeOpen(st);
            }
        });
        // il mouse sulle voci non deve togliere il focus al menu (il campo di ricerca invece lo riceve)
        pop.addEventListener("mousedown", function (e) { if (!(e.target instanceof Element && e.target.closest("input"))) e.preventDefault(); });
        wrap.addEventListener("focusout", function (e) {
            if (!wrap.contains(e.relatedTarget) && openPop && openPop.pop === pop) closePop(false);
        });
        sel.addEventListener("focus", function () { btn.focus(); });   // un <label for> o focus() sul select vanno al bottone
        sel.addEventListener("change", function () { nativeSync(st); });
        if (sel.form) sel.form.addEventListener("reset", function () { setTimeout(function () { st.api.sync(); }, 0); });
        if (window.MutationObserver) new MutationObserver(function () { st.api.sync(); }).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "label", "hidden", "data-kit-hint", "data-kit-short"], characterData: true });
        return st.api;
    }

    /* ---------- Grafici: barre, linee, ciambella, sparkline ----------
       Kit.barChart(el, { data: [{ label, group, values: [..] }], series: [{ name, color }], stacked, format, onSelect, ... })
       Kit.lineChart(el, { stesse opzioni; values può contenere null (buco), area, zero, markers })
       Kit.donut(el, { data: [{ label, value, color }], centerValue, centerLabel, format, onSelect })
       Kit.sparkline(el, { values, type: "line" | "bar", color, area })
       Disegnano un SVG (senza innerHTML), seguono il tema e la dimensione del testo. */
    var SVG_NS = "http://www.w3.org/2000/svg";
    var charts = new WeakMap();

    function svgEl(name, attrs, text) {
        var e = document.createElementNS(SVG_NS, name);
        for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
        if (text != null) e.textContent = text;
        return e;
    }

    function niceTop(max) {
        var e = Math.pow(10, Math.floor(Math.log10(max))), f = max / e;
        return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
    }

    function compactNumber(v) {
        var nf = new Intl.NumberFormat(root.lang || undefined, { maximumFractionDigits: 2 });
        var a = Math.abs(v);
        return a >= 1e6 ? nf.format(v / 1e6) + " M" : a >= 1e3 ? nf.format(v / 1e3) + " k" : nf.format(v);
    }

    function colorOf(s, i) { return s.color || "var(--kit-c" + (i % 4 + 1) + ")"; }

    function resolveEl(el) { return typeof el === "string" ? document.querySelector(el) : el; }

    /* Il ciclo di vita è uguale per tutti: un grafico per elemento, richiamare la funzione lo aggiorna. */
    function mountChart(el, opts, build) {
        var prev = charts.get(el);
        if (prev) { prev.update(opts); return prev; }
        var o = {};
        var inst = build(el, o);
        var api = {
            update: function (next) {
                if (next) for (var k in next) o[k] = next[k];
                inst.draw(true);
            },
            destroy: function () {
                if (inst.destroy) inst.destroy();
                charts.delete(el);
                el.textContent = "";
                el.className = el.className.replace(/\bkit-(chart-click|chart|donut|spark)\b/g, "").trim();
            }
        };
        charts.set(el, api);
        api.update(opts || {});
        return api;
    }

    function cartesian(el, opts, kind) {
        el = resolveEl(el);
        if (!el) return null;
        return mountChart(el, opts, function (el, o) {
            var scrollEnd = true, lastW = 0;
            var legend = mkEl("div", "kit-legend");
            var scroller = mkEl("div", "kit-chart-scroll");
            el.classList.add("kit-chart");
            el.textContent = "";
            el.appendChild(legend);
            el.appendChild(scroller);
            var isLine = kind === "line";

            function draw(fresh) {
                if (fresh) scrollEnd = o.scrollEnd !== false;
                var data = o.data || [];
                var series = o.series && o.series.length ? o.series : [{ name: o.name || "Totale" }];
                var fmt = o.format || function (v) { return new Intl.NumberFormat(root.lang || undefined).format(v); };
                var axisFmt = o.axisFormat || compactNumber;
                var u = (parseFloat(getComputedStyle(el).fontSize) || 14) / 14;
                var L = Math.round(58 * u), R = Math.round((isLine ? 14 : 6) * u), T = Math.round(10 * u), B = Math.round(34 * u);
                var H = Math.round((o.height || 260) * u), ph = H - B - T, n = data.length;
                var avail = Math.max(scroller.clientWidth, 300);
                var slot = Math.max((o.minSlot || 34) * u, (avail - L - R) / Math.max(n, 1));
                var W = Math.max(avail, Math.ceil(L + R + slot * n));
                var ns = series.length;
                var stacked = !isLine && o.stacked === true && ns > 1;
                var interactive = typeof o.onSelect === "function";

                legend.textContent = "";
                legend.hidden = !(o.legend === true || (o.legend !== false && ns > 1));
                series.forEach(function (s, i) {
                    var sp = mkEl("span", "");
                    var sw = mkEl("i", "");
                    sw.style.background = colorOf(s, i);
                    sp.appendChild(sw);
                    sp.appendChild(document.createTextNode(s.name || ""));
                    legend.appendChild(sp);
                });
                if (o.legendNote) legend.appendChild(mkEl("span", "", o.legendNote));

                scroller.textContent = "";
                el.classList.toggle("kit-chart-click", interactive);
                if (!n) { scroller.appendChild(mkEl("div", "kit-pop-empty", o.empty || "Nessun dato")); return; }

                // Scala verticale. Barre: da 0 a un valore tondo. Linee: dal minimo al massimo (con margine), a meno di zero:true.
                var ticks = o.ticks || 4, lo = 0, hi, step;
                var vmin = Infinity, vmax = 0;
                data.forEach(function (d) {
                    var sum = 0;
                    series.forEach(function (s, j) {
                        var v = d.values[j];
                        if (v == null) return;
                        if (v < vmin) vmin = v;
                        if (stacked) sum += Math.max(0, v); else if (v > vmax) vmax = v;
                    });
                    if (stacked && sum > vmax) vmax = sum;
                });
                if (!isFinite(vmin)) vmin = 0;
                if (isLine && o.zero !== true && o.min == null) {
                    lo = vmin; hi = vmax;
                    if (hi - lo < 1e-9) { lo -= Math.abs(lo) * .05 || 1; hi += Math.abs(hi) * .05 || 1; }
                    else { var pad = (hi - lo) * .12; lo -= pad; hi += pad; }
                    step = niceTop((hi - lo) / ticks);
                    lo = Math.floor(lo / step) * step;
                    ticks = Math.max(1, Math.ceil((hi - lo) / step - 1e-9));
                    hi = lo + step * ticks;
                } else {
                    lo = o.min != null ? o.min : 0;
                    hi = o.max || niceTop(Math.max(1, vmax));
                    step = (hi - lo) / ticks;
                }
                var Y = function (v) { return T + ph - (v - lo) / (hi - lo) * ph; };
                var X = function (i) { return L + i * slot + slot / 2; };

                var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: interactive ? "group" : "img", "aria-label": o.label || (isLine ? "Grafico a linee" : "Grafico a barre") });
                for (var t = 0; t <= ticks; t++) {
                    var gy = Y(lo + step * t);
                    svg.appendChild(svgEl("line", { "class": "kit-chart-grid", x1: L, x2: W - R, y1: gy, y2: gy }));
                    svg.appendChild(svgEl("text", { "class": "kit-chart-axis", x: L - 8, y: gy + 4, "text-anchor": "end" }, axisFmt(lo + step * t)));
                }
                // etichette sotto l'asse
                data.forEach(function (d, i) {
                    svg.appendChild(svgEl("text", { "class": "kit-chart-label", x: X(i), y: T + ph + 14 * u, "text-anchor": "middle" }, d.label));
                    if (d.group && (i === 0 || d.group !== data[i - 1].group)) {
                        svg.appendChild(svgEl("text", { "class": "kit-chart-group", x: L + i * slot + 4, y: H - 3 * u }, d.group));
                    }
                });

                function tip(d, s, j, v) {
                    return d.label + (d.group ? " " + d.group : "") + (ns > 1 ? " · " + (s.name || "") : "") + ": " + fmt(v);
                }
                function mark(node, d, s, j, v, i, cls) {
                    var text = tip(d, s, j, v);
                    node.setAttribute("class", cls);
                    node.setAttribute("data-i", i);
                    node.setAttribute("data-s", j);
                    node.appendChild(svgEl("title", {}, text));
                    if (interactive) { node.setAttribute("tabindex", "0"); node.setAttribute("role", "button"); node.setAttribute("aria-label", text); }
                    svg.appendChild(node);
                }

                if (!isLine) {
                    var bw = Math.min(slot - 8, 64 * u);
                    data.forEach(function (d, i) {
                        var x0 = L + i * slot + (slot - bw) / 2, w1 = stacked ? bw : bw / ns, acc = 0;
                        series.forEach(function (s, j) {
                            var v = Math.max(0, d.values[j] || 0);
                            var h = Math.max(v ? 1 : 0, v / (hi - lo) * ph);
                            var y = stacked ? T + ph - (acc + v) / (hi - lo) * ph : T + ph - h;
                            acc += v;
                            mark(svgEl("rect", { x: stacked ? x0 : x0 + j * w1, y: y, width: Math.max(1, w1 - (ns > 1 && !stacked ? 1 : 0)), height: h, rx: stacked ? 0 : 2, fill: colorOf(s, j) }), d, s, j, v, i, "kit-chart-bar");
                        });
                    });
                } else {
                    series.forEach(function (s, j) {
                        var col = colorOf(s, j), segs = [], cur = [];
                        data.forEach(function (d, i) {
                            var v = d.values[j];
                            if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push([X(i), Y(v)]);
                        });
                        if (cur.length) segs.push(cur);
                        segs.forEach(function (sg) {
                            if (sg.length < 2) return;
                            var pts = sg.map(function (p, k) { return (k ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
                            if (o.area) svg.appendChild(svgEl("path", { "class": "kit-chart-area", fill: col, d: pts + " L" + sg[sg.length - 1][0] + " " + Y(lo) + " L" + sg[0][0] + " " + Y(lo) + " Z" }));
                            svg.appendChild(svgEl("path", { "class": "kit-chart-line", stroke: col, d: pts }));
                        });
                        // punti: cerchio, quadrato, triangolo… così le serie si distinguono anche senza colore
                        if (o.markers !== false) data.forEach(function (d, i) {
                            var v = d.values[j];
                            if (v == null) return;
                            var x = X(i), y = Y(v), m = j % 3, node;
                            if (m === 0) node = svgEl("circle", { cx: x, cy: y, r: 4.5 * u, fill: col });
                            else if (m === 1) node = svgEl("rect", { x: x - 4 * u, y: y - 4 * u, width: 8 * u, height: 8 * u, fill: col });
                            else node = svgEl("polygon", { points: x + "," + (y - 5 * u) + " " + (x + 5 * u) + "," + (y + 4 * u) + " " + (x - 5 * u) + "," + (y + 4 * u), fill: col });
                            mark(node, d, s, j, v, i, "kit-chart-pt");
                        });
                    });
                }
                scroller.appendChild(svg);
                if (scrollEnd && W > avail) scroller.scrollLeft = scroller.scrollWidth;
            }

            function pick(target) {
                var r = target instanceof Element && target.closest(".kit-chart-bar, .kit-chart-pt");
                if (!r || typeof o.onSelect !== "function") return;
                var i = +r.getAttribute("data-i"), s = +r.getAttribute("data-s");
                o.onSelect(o.data[i], i, s);
                el.dispatchEvent(new CustomEvent("kit:select", { bubbles: true, detail: { index: i, series: s, item: o.data[i] } }));
            }
            scroller.addEventListener("click", function (e) { pick(e.target); });
            scroller.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e.target); }
            });

            var ro = typeof ResizeObserver === "function" ? new ResizeObserver(function () {
                var w = el.clientWidth;
                if (w && w !== lastW) { lastW = w; scrollEnd = false; draw(false); }
            }) : null;
            if (ro) ro.observe(el);
            function onFs() { scrollEnd = false; draw(false); }
            root.addEventListener("kit:fs", onFs);
            return { draw: draw, destroy: function () { if (ro) ro.disconnect(); root.removeEventListener("kit:fs", onFs); } };
        });
    }

    function barChart(el, opts) { return cartesian(el, opts, "bar"); }
    function lineChart(el, opts) { return cartesian(el, opts, "line"); }

    function donut(el, opts) {
        el = resolveEl(el);
        if (!el) return null;
        return mountChart(el, opts, function (el, o) {
            el.classList.add("kit-donut");
            function draw() {
                var data = (o.data || []).filter(function (d) { return d.value > 0; });
                var fmt = o.format || function (v) { return new Intl.NumberFormat(root.lang || undefined).format(v); };
                var total = data.reduce(function (a, d) { return a + d.value; }, 0);
                var interactive = typeof o.onSelect === "function";
                el.textContent = "";
                el.classList.toggle("kit-chart-click", interactive);
                if (!total) { el.appendChild(mkEl("div", "kit-pop-empty", o.empty || "Nessun dato")); return; }
                var pct = new Intl.NumberFormat(root.lang || undefined, { style: "percent", maximumFractionDigits: 1 });
                var r = 40, w = o.thickness || 16, C = 2 * Math.PI * r, acc = 0;
                var svg = svgEl("svg", { "class": "kit-donut-svg", viewBox: "0 0 100 100", role: "img", "aria-label": o.label || "Grafico a ciambella" });
                var legend = mkEl("div", "kit-donut-legend");
                data.forEach(function (d, i) {
                    var col = d.color || "var(--kit-c" + (i % 4 + 1) + ")";
                    var len = d.value / total * C, gap = data.length > 1 ? Math.min(1.2, len * .3) : 0;
                    var text = d.label + ": " + fmt(d.value) + " (" + pct.format(d.value / total) + ")";
                    var seg = svgEl("circle", { "class": "kit-donut-seg", cx: 50, cy: 50, r: r, fill: "none", stroke: col, "stroke-width": w,
                        "stroke-dasharray": (len - gap) + " " + (C - len + gap), "stroke-dashoffset": -acc, transform: "rotate(-90 50 50)", "data-i": i });
                    seg.appendChild(svgEl("title", {}, text));
                    svg.appendChild(seg);
                    acc += len;
                    var row = mkEl(interactive ? "button" : "div", "kit-donut-row");
                    if (interactive) { row.type = "button"; row.setAttribute("data-i", i); }
                    var sw = mkEl("i", ""); sw.style.background = col;
                    row.appendChild(sw);
                    row.appendChild(mkEl("span", "kit-donut-name", d.label));
                    row.appendChild(mkEl("b", "", fmt(d.value)));
                    row.appendChild(mkEl("small", "", pct.format(d.value / total)));
                    legend.appendChild(row);
                });
                var cv = o.centerValue != null ? o.centerValue : fmt(total);
                svg.appendChild(svgEl("text", { "class": "kit-donut-value", x: 50, y: o.centerLabel === "" ? 54 : 50, "text-anchor": "middle" }, String(cv)));
                if (o.centerLabel !== "") svg.appendChild(svgEl("text", { "class": "kit-donut-label", x: 50, y: 61, "text-anchor": "middle" }, o.centerLabel || "Totale"));
                el.appendChild(svg);
                if (o.legend !== false) el.appendChild(legend);
                var dd = data;
                el.onclick = function (e) {
                    var t = e.target instanceof Element && e.target.closest("[data-i]");
                    if (!t || !interactive) return;
                    var i = +t.getAttribute("data-i");
                    o.onSelect(dd[i], i);
                    el.dispatchEvent(new CustomEvent("kit:select", { bubbles: true, detail: { index: i, item: dd[i] } }));
                };
            }
            return { draw: draw };
        });
    }

    function sparkline(el, opts) {
        el = resolveEl(el);
        if (!el) return null;
        return mountChart(el, opts, function (el, o) {
            el.classList.add("kit-spark");
            function draw() {
                var vals = (o.values || []).filter(function (v) { return v != null; });
                var type = o.type === "bar" ? "bar" : "line";
                el.textContent = "";
                if (!vals.length) return;
                var W = 100, H = 30, pad = 2;
                var lo = type === "bar" ? Math.min(0, Math.min.apply(null, vals)) : Math.min.apply(null, vals);
                var hi = Math.max.apply(null, vals);
                if (hi - lo < 1e-9) { hi = lo + 1; }
                var col = o.color || "var(--kit-c1)";
                var Y = function (v) { return H - pad - (v - lo) / (hi - lo) * (H - 2 * pad); };
                var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": o.label || "Andamento" });
                var n = vals.length;
                if (type === "bar") {
                    var bw = W / n;
                    vals.forEach(function (v, i) {
                        var y = Y(Math.max(v, 0)), y0 = Y(Math.min(0, lo) < 0 ? 0 : lo);
                        svg.appendChild(svgEl("rect", { x: i * bw + bw * .15, y: Math.min(y, y0), width: bw * .7, height: Math.max(1, Math.abs(y0 - y)), fill: col }));
                    });
                } else {
                    var pts = vals.map(function (v, i) { return [n === 1 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1), Y(v)]; });
                    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(" ");
                    if (o.area !== false) svg.appendChild(svgEl("path", { "class": "kit-chart-area", fill: col, d: d + " L" + pts[n - 1][0] + " " + H + " L" + pts[0][0] + " " + H + " Z" }));
                    svg.appendChild(svgEl("path", { "class": "kit-chart-line", stroke: col, d: d }));
                }
                el.appendChild(svg);
            }
            return { draw: draw };
        });
    }

    /* ---------- Pannello affiancato (kit-split): aprire, chiudere, tutta larghezza ----------
       Vale anche se is-open è messo a mano; con data-kit-split sul contenitore Esc lo chiude (prima esce da "tutta larghezza"). */
    var SPLIT = ".kit-split, .kit-split-lg";
    var splitOpener = new WeakMap();

    function splitSet(sp, open, full) {
        var was = sp.classList.contains("is-open"), wasFull = sp.classList.contains("is-full");
        if (open === undefined) open = was;
        if (!open) full = false;
        if (full === undefined) full = wasFull;
        sp.classList.toggle("is-open", open);
        sp.classList.toggle("is-full", open && full);
        var panel = sp.querySelector(".kit-split-panel");
        if (open && !was) {
            splitOpener.set(sp, document.activeElement);
            if (panel) { panel.tabIndex = -1; panel.focus({ preventScroll: true }); }
        }
        if (!open && was) {
            var o = splitOpener.get(sp);
            if (o && o.isConnected && o.focus) o.focus({ preventScroll: true });
        }
        if (open !== was || (open && full !== wasFull)) {
            sp.dispatchEvent(new CustomEvent("kit:split", { bubbles: true, detail: { open: open, full: open && full } }));
        }
    }

    function split(target) {
        var sp = typeof target === "string" ? document.querySelector(target) : target;
        if (!sp) return null;
        return {
            open: function () { splitSet(sp, true); },
            close: function () { splitSet(sp, false); },
            full: function (on) { splitSet(sp, true, on !== false); },
            isOpen: function () { return sp.classList.contains("is-open"); },
            isFull: function () { return sp.classList.contains("is-full"); }
        };
    }

    /* ---------- Campo file e zona di rilascio ----------
       <div class="kit-file" data-kit-file><input type="file" accept=".xml" multiple></div>        campo compatto
       <div class="kit-dropzone" data-kit-file><input type="file" multiple> …testo…</div>          zona di rilascio
       Controlla tipo e dimensione, accetta cartelle (data-kit-file-dir o webkitdirectory) e, con data-kit-file-page,
       i file rilasciati in qualsiasi punto della pagina. Evento "kit:files" con { files, items, rejected }. */
    var fileState = new WeakMap();
    var pageFileZone = null, pageDragN = 0, dropVeil = null;

    var FILE_MSG = {
        type: "{name}: tipo di file non accettato ({accept}).",
        size: "{name}: supera i {max} MB.",
        count: "{name}: si può scegliere un solo file.",
        folder: "{name}: le cartelle non sono ammesse."
    };

    function fmtSize(n) {
        if (n < 1024) return n + " B";
        if (n < 1048576) return (n / 1024).toFixed(n < 10240 ? 1 : 0).replace(".", ",") + " kB";
        return (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace(".", ",") + " MB";
    }

    function acceptTest(accept) {
        var toks = (accept || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
        if (!toks.length) return function () { return true; };
        return function (f) {
            var name = f.name.toLowerCase(), type = (f.type || "").toLowerCase();
            return toks.some(function (t) {
                if (t.charAt(0) === ".") return name.slice(-t.length) === t;
                if (t.slice(-2) === "/*") return type.indexOf(t.slice(0, -1)) === 0;
                return type === t;
            });
        };
    }

    // Legge i file di una cartella rilasciata (webkitGetAsEntry), con il loro percorso.
    function readEntry(entry, path) {
        return new Promise(function (resolve) {
            if (!entry) return resolve([]);
            if (entry.isFile) {
                entry.file(function (f) { resolve([{ file: f, path: path + f.name, fromDir: path !== "" }]); }, function () { resolve([]); });
            } else if (entry.isDirectory) {
                var reader = entry.createReader(), out = [];
                (function next() {
                    reader.readEntries(function (batch) {
                        if (!batch.length) {
                            Promise.all(out).then(function (lists) { resolve([].concat.apply([], lists)); });
                            return;
                        }
                        batch.forEach(function (en) { out.push(readEntry(en, path + entry.name + "/")); });
                        next();
                    }, function () { resolve([]); });
                })();
            } else resolve([]);
        });
    }

    function fileUI(wrap, st) {
        var input = st.input, n = st.items.length, name = st.nameEl;
        wrap.classList.toggle("has-files", n > 0);
        if (st.clearBtn) st.clearBtn.hidden = n === 0;
        var text;
        if (!n) text = st.empty;
        else {
            var total = st.items.reduce(function (a, i) { return a + i.file.size; }, 0);
            var dir = st.items[0].path.indexOf("/") > 0 ? st.items[0].path.split("/")[0] : "";
            if (dir) text = dir + " · " + n + " file (" + fmtSize(total) + ")";
            else if (n === 1) text = st.items[0].file.name + " (" + fmtSize(total) + ")";
            else text = n + " file (" + fmtSize(total) + ")";
        }
        name.textContent = text;
        name.title = n > 1 ? st.items.slice(0, 20).map(function (i) { return i.path; }).join("\n") : "";
        st.err.textContent = st.errors.join(" ");
        st.err.hidden = !st.errors.length;
        wrap.classList.toggle("is-invalid", st.errors.length > 0);
        if (st.errors.length) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    }

    function fileApply(wrap, st, found) {
        var ok = [], rejected = [];
        var test = acceptTest(st.input.getAttribute("accept"));
        found.forEach(function (it) {
            var why = null;
            if (it.isDir) { if (!st.dir) why = "folder"; }
            else if (!test(it.file)) why = it.fromDir ? "skip" : "type";   // nelle cartelle i file di altro tipo si ignorano in silenzio
            else if (st.max && it.file.size > st.max * 1048576) why = "size";
            else if (!st.input.multiple && !st.dir && ok.length >= 1) why = "count";
            if (!why) ok.push(it);
            else if (why !== "skip") rejected.push({ file: it.file, path: it.path, reason: why });
        });
        st.errors = rejected.map(function (r) {
            return st.msg[r.reason].replace("{name}", r.path || r.file.name).replace("{accept}", st.input.getAttribute("accept") || "").replace("{max}", String(st.max));
        });
        st.items = ok;
        // il campo del form deve contenere gli stessi file (serve per l'invio normale del form)
        try {
            var dt = new DataTransfer();
            st.items.forEach(function (i) { dt.items.add(i.file); });
            st.input.files = dt.files;
        } catch (e) { /* browser senza DataTransfer: resta la scelta nativa */ }
        fileUI(wrap, st);
        var detail = { files: st.items.map(function (i) { return i.file; }), items: st.items.slice(), rejected: rejected };
        wrap.dispatchEvent(new CustomEvent("kit:files", { bubbles: true, detail: detail }));
        if (typeof st.onFiles === "function") st.onFiles(detail);
    }

    // Un rilascio: i dati del DataTransfer vanno letti subito, prima di qualsiasi attesa.
    function fileDrop(wrap, st, dt) {
        var ents = [];
        var items = dt.items ? Array.prototype.slice.call(dt.items).filter(function (i) { return i.kind === "file"; }) : [];
        items.forEach(function (i) { ents.push(i.webkitGetAsEntry ? i.webkitGetAsEntry() : null); });
        var plain = Array.prototype.slice.call(dt.files || []);
        var jobs;
        if (ents.length && ents.every(Boolean)) {
            jobs = ents.map(function (en) {
                if (en.isDirectory && !st.dir) return Promise.resolve([{ file: { name: en.name, size: 0, type: "" }, path: en.name, isDir: true }]);
                return readEntry(en, "");
            });
        } else jobs = [Promise.resolve(plain.map(function (f) { return { file: f, path: f.name }; }))];
        Promise.all(jobs).then(function (lists) { fileApply(wrap, st, [].concat.apply([], lists)); });
    }

    function fileField(target, opts) {
        var wrap = typeof target === "string" ? document.querySelector(target) : target;
        if (!wrap) return null;
        var st = fileState.get(wrap);
        if (st) return st.api;
        opts = opts || {};
        var input = wrap.querySelector('input[type="file"]');
        if (!input) return null;
        var d = wrap.dataset, zone = wrap.classList.contains("kit-dropzone");
        st = {
            input: input, items: [], errors: [], onFiles: opts.onFiles,
            dir: opts.directory != null ? !!opts.directory : (input.hasAttribute("webkitdirectory") || d.kitFileDir !== undefined),
            max: opts.max != null ? opts.max : (parseFloat(d.kitFileMax) || 0),
            empty: opts.empty || d.kitFileEmpty || (zone ? "" : "Nessun file"),
            msg: Object.assign({}, FILE_MSG, opts.messages || {})
        };
        wrap.classList.add("is-ready");
        if (!input.id) input.id = "kit-file-" + (++comboUid);

        st.nameEl = wrap.querySelector(".kit-file-name") || mkEl("span", "kit-file-name");
        st.err = wrap.querySelector(".kit-file-error") || mkEl("small", "kit-file-error kit-danger");
        st.err.hidden = true;
        st.err.setAttribute("role", "alert");
        if (!zone) {
            var pick = wrap.querySelector(".kit-file-btn");
            if (!pick) {
                pick = mkEl("button", "kit-btn kit-file-btn", opts.button || d.kitFileButton || (st.dir ? "Scegli cartella…" : "Scegli file…"));
                pick.type = "button";
                wrap.insertBefore(pick, input.nextSibling);
            }
            pick.addEventListener("click", function () { input.click(); });
            if (!st.nameEl.parentNode) wrap.insertBefore(st.nameEl, pick.nextSibling);
            st.clearBtn = wrap.querySelector(".kit-file-clear");
            if (!st.clearBtn) {
                st.clearBtn = mkEl("button", "kit-btn kit-btn-ghost kit-btn-icon kit-file-clear");
                st.clearBtn.type = "button";
                st.clearBtn.setAttribute("aria-label", opts.clearLabel || d.kitFileClear || "Rimuovi la scelta");
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                svg.setAttribute("class", "kit-icon");
                use.setAttribute("href", "#i-x");
                svg.appendChild(use);
                st.clearBtn.appendChild(svg);
                wrap.insertBefore(st.clearBtn, st.nameEl.nextSibling);
            }
            st.clearBtn.hidden = true;
            st.clearBtn.addEventListener("click", function () { fileApply(wrap, st, []); });
            wrap.appendChild(st.err);
        } else {
            if (!st.nameEl.parentNode) wrap.appendChild(st.nameEl);
            if (!wrap.contains(st.err)) wrap.appendChild(st.err);
        }
        st.nameEl.textContent = st.empty;

        input.addEventListener("change", function () {
            var list = Array.prototype.slice.call(input.files || []);
            fileApply(wrap, st, list.map(function (f) { return { file: f, path: f.webkitRelativePath || f.name, fromDir: !!f.webkitRelativePath }; }));
        });
        wrap.addEventListener("dragenter", function (e) { if (hasFiles(e)) { e.preventDefault(); wrap.classList.add("is-over"); } });
        wrap.addEventListener("dragover", function (e) { if (hasFiles(e)) { e.preventDefault(); wrap.classList.add("is-over"); } });
        wrap.addEventListener("dragleave", function (e) { if (!wrap.contains(e.relatedTarget)) wrap.classList.remove("is-over"); });
        wrap.addEventListener("drop", function (e) {
            if (!hasFiles(e)) return;
            e.preventDefault();
            e.stopPropagation();   // se c'è anche la zona "di pagina", il rilascio vale una volta sola
            wrap.classList.remove("is-over");
            endPageDrag();
            fileDrop(wrap, st, e.dataTransfer);
        });
        if (d.kitFilePage !== undefined) { pageFileZone = { wrap: wrap, st: st, text: d.kitFilePage || "Rilascia qui per caricare" }; }
        st.api = {
            files: function () { return st.items.map(function (i) { return i.file; }); },
            items: function () { return st.items.slice(); },
            clear: function () { fileApply(wrap, st, []); }
        };
        fileState.set(wrap, st);
        fileUI(wrap, st);
        return st.api;
    }

    function hasFiles(e) {
        var t = e.dataTransfer && e.dataTransfer.types;
        return !!t && Array.prototype.indexOf.call(t, "Files") >= 0;
    }

    function endPageDrag() {
        pageDragN = 0;
        if (dropVeil) dropVeil.classList.remove("is-on");
    }

    /* ---------- Avanzamento a pieno schermo ----------
       var p = Kit.progress("Lettura…", { value: 0.2, onCancel }); p.update("Lettura 40 di 200", 0.4); p.close(); */
    function progressDialog(text, opts) {
        opts = opts || {};
        var dlg = mkEl("dialog", "kit-dialog kit-dialog-sm kit-busy");
        dlg.setAttribute("aria-live", "polite");
        var body = mkEl("div", "kit-card-body kit-stack");
        var label = mkEl("div", "kit-busy-text", text || "");
        var bar = mkEl("div", "kit-progress");
        var fill = mkEl("i", "");
        bar.appendChild(fill);
        body.appendChild(label);
        body.appendChild(bar);
        dlg.appendChild(body);
        var cancelBtn = null;
        if (typeof opts.onCancel === "function") {
            var foot = mkEl("div", "kit-card-foot");
            cancelBtn = mkEl("button", "kit-btn", opts.cancel || "Annulla");
            cancelBtn.type = "button";
            foot.appendChild(cancelBtn);
            dlg.appendChild(foot);
        }
        var closed = false, shown = false, timer = null;
        function setValue(v) {
            if (v == null) { bar.classList.add("kit-progress-indeterminate"); bar.removeAttribute("role"); fill.style.removeProperty("--kit-value"); return; }
            bar.classList.remove("kit-progress-indeterminate");
            var pct = Math.max(0, Math.min(1, v)) * 100;
            fill.style.setProperty("--kit-value", pct + "%");
            bar.setAttribute("role", "progressbar");
            bar.setAttribute("aria-valuenow", String(Math.round(pct)));
            bar.setAttribute("aria-valuemin", "0");
            bar.setAttribute("aria-valuemax", "100");
        }
        function close() {
            if (closed) return;
            closed = true;
            clearTimeout(timer);
            if (shown && dlg.open) dlg.close();
            setTimeout(function () { dlg.remove(); }, 300);
        }
        function cancel() { if (typeof opts.onCancel === "function") opts.onCancel(); close(); }
        function show() {
            if (closed) return;
            document.body.appendChild(dlg);
            dlg.showModal();
            dlg.tabIndex = -1;
            if (!cancelBtn) dlg.focus({ preventScroll: true });
            shown = true;
        }
        // Esc non chiude l'avanzamento, a meno che ci sia un modo per annullare l'operazione.
        dlg.addEventListener("cancel", function (e) { e.preventDefault(); if (cancelBtn) cancel(); });
        if (cancelBtn) cancelBtn.addEventListener("click", cancel);
        setValue(opts.value);
        if (opts.delay > 0) timer = setTimeout(show, opts.delay); else show();
        return {
            update: function (t, v) {
                if (t != null) label.textContent = t;
                if (v !== undefined) setValue(v);
            },
            close: close
        };
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

        var sideBtn = t.closest("[data-kit-sidebar-toggle]");
        if (sideBtn) {
            var sbT = sideBar(sideBtn.getAttribute("data-kit-sidebar-toggle"));
            if (!sbT) return;
            if (!sideDrawer(sbT)) sidebar.toggle();
            else if (sbT.classList.contains("is-open")) sidebar.close();
            else sidebar.open(sideBtn.getAttribute("data-kit-sidebar-toggle"), sideBtn);
            return;
        }
        var sbIn = t.closest(".kit-sidebar");
        if (sbIn) {
            // compatta: la voce con sottovoci espande la sidebar; scelta una pagina, quella a comparsa si chiude
            if (!sideDrawer(sbIn) && sidebar.get() === "collapsed" && t.closest("summary")) sidebar.set("expanded");
            else if (sideDrawer(sbIn) && sbIn.classList.contains("is-open") && t.closest("a[href]")) sidebar.close();
        } else {
            var sbOpen = document.querySelector(".kit-sidebar.is-open");
            if (sbOpen) sidebar.close();            // click fuori (sullo sfondo scuro)
        }
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
            var nst = selByWrap.get(selBtn.closest("[data-kit-select]"));
            if (nst) { if (!nst.pop.hidden) closePop(false); else nativeOpen(nst); return; }
            var p = selBtn.closest("[data-kit-select]").querySelector(".kit-pop");
            if (p) togglePop(selBtn, p);
            return;
        }

        var tab = t.closest("[data-kit-tabs] .kit-tab");
        if (tab) { selectTab(tab.closest("[data-kit-tabs]"), tab); return; }

        var spOpen = t.closest("[data-kit-split-open]");
        if (spOpen) {
            var sp1 = document.querySelector(spOpen.getAttribute("data-kit-split-open"));
            if (sp1) splitSet(sp1, true);
            return;
        }
        var spClose = t.closest("[data-kit-split-close]");
        if (spClose) { var sp2 = spClose.closest(SPLIT); if (sp2) splitSet(sp2, false); return; }
        var spFull = t.closest("[data-kit-split-full]");
        if (spFull) { var sp3 = spFull.closest(SPLIT); if (sp3) splitSet(sp3, true, !sp3.classList.contains("is-full")); return; }
        // Il velo dietro il pannello (quando copre la lista) è il ::after del contenitore: un click lì è un click sul contenitore.
        if (t.matches(SPLIT) && t.hasAttribute("data-kit-split") && t.classList.contains("is-open")) {
            var pn = t.querySelector(".kit-split-panel");
            if (pn && getComputedStyle(pn).position === "fixed") { splitSet(t, false); return; }
        }

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
        // (un click nel campo di un combobox non lo chiude)
        if (openPop && !openPop.pop.contains(t) && !(t.closest("[data-kit-combo]") && t.closest("[data-kit-combo]").contains(openPop.pop))) closePop(false);

        // Click sullo sfondo (::backdrop) di un dialog: lo chiude.
        if (t instanceof HTMLDialogElement && t.classList.contains("kit-dialog") && !t.classList.contains("kit-busy")) {
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
            if (e.key === "Tab" && openPop.pop.querySelector(".kit-pop-search")) closePop(false);
            if (e.key === "ArrowDown") { e.preventDefault(); moveActive(openPop.pop, 1); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); moveActive(openPop.pop, -1); return; }
            // nel campo di un combobox o di ricerca lo spazio è un carattere come gli altri
            if (e.key === "Enter" || (e.key === " " && !(e.target instanceof Element && e.target.closest("[data-kit-combo], .kit-pop-search")))) {
                var a = openPop.pop.querySelector(".kit-opt.is-active");
                // click() attiva la voce come un click vero: partono anche i suoi gestori e i link
                if (a) { e.preventDefault(); a.click(); return; }
            }
        }
        // Esc chiude il pannello affiancato (o lo riporta accanto alla lista, se era a tutta larghezza).
        if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector("dialog[open]") && !(e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]"))) {
            var osp = document.querySelector("[data-kit-split].is-open");
            if (osp && osp.matches(SPLIT)) {
                if (osp.classList.contains("is-full")) splitSet(osp, true, false); else splitSet(osp, false);
                return;
            }
        }
        // Esc chiude la sidebar a comparsa e riporta il focus su chi l'ha aperta.
        if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector("dialog[open]") && document.querySelector(".kit-sidebar.is-open")) {
            sidebar.close();
            return;
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
    /* ---------- Snippet di codice ----------
       <pre class="kit-code" data-kit-code="html|js|css"><code>…</code></pre> colora il codice come in un editor (senza la
       lingua la indovina); data-kit-code-copy aggiunge il bottone «Copia». Un piccolo evidenziatore per HTML, JavaScript e
       CSS: costruisce nodi di testo e <span>, mai HTML, quindi il codice mostrato non viene eseguito. */
    function hlPut(out, cls, text) {
        if (!text) return;
        out.appendChild(cls ? mkEl("span", "kit-hl-" + cls, text) : document.createTextNode(text));
    }

    function hlText(out, text) {   // testo di una pagina: le entità (&amp;, &#8364;) sono evidenziate
        var re = /&#?\w+;/g, last = 0, m;
        while ((m = re.exec(text))) {
            hlPut(out, "", text.slice(last, m.index));
            hlPut(out, "num", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", text.slice(last));
    }

    // Commento a blocco da `from`: arriva fino a "*/" (se non si chiude, fino alla fine). Con indexOf, non con una regex, per restare lineare.
    function hlComment(src, from, out) {
        var end = src.indexOf("*/", from + 2);
        end = end < 0 ? src.length : end + 2;
        hlPut(out, "com", src.slice(from, end));
        return end;
    }

    function hlJs(src, out) {
        var re = /(\/\/[^\n]*|\/\*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\[\s\S]|[^`\\])*`)|(\b\d[\d.]*\b)|\b(var|let|const|function|return|if|else|for|while|do|new|typeof|instanceof|in|of|this|true|false|null|undefined|class|async|await|try|catch|throw|break|continue|switch|case|default|delete|void)\b|\b([A-Z][\w$]*)|([A-Za-z_$][\w$]*)(?=\s*\()/g;
        var last = 0, m;
        while ((m = re.exec(src))) {
            hlPut(out, "", src.slice(last, m.index));
            if (m[0] === "/*") { re.lastIndex = hlComment(src, m.index, out); last = re.lastIndex; continue; }
            hlPut(out, m[1] ? "com" : m[2] ? "str" : m[3] ? "num" : m[4] ? "kw" : m[5] ? "type" : "fn", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", src.slice(last));
    }

    function hlCssValue(src, out) {
        var re = /(\/\*)|("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr|ch)?)|\b(var|calc|color-mix|light-dark|rgba?|hsla?|min|max|clamp)(?=\()|(--[\w-]+)|(!important)/g;
        var last = 0, m;
        while ((m = re.exec(src))) {
            hlPut(out, "", src.slice(last, m.index));
            if (m[1]) { re.lastIndex = hlComment(src, m.index, out); last = re.lastIndex; continue; }
            hlPut(out, m[2] ? "str" : (m[3] || m[4]) ? "num" : m[5] ? "fn" : m[6] ? "attr" : "kw", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", src.slice(last));
    }

    function hlCssSelector(seg, out) {
        var at = seg.match(/^(\s*)(@[\w-]+)([\s\S]*)$/);
        if (at) { hlPut(out, "", at[1]); hlPut(out, "kw", at[2]); hlCssValue(at[3], out); return; }
        var re = /(\.[\w-]+|#[\w-]+)|(::?[\w-]+(?:\([^)]{0,200}\))?)|(\[[^\]]{0,200}\])|([A-Za-z][\w-]*)/g;
        var last = 0, m;
        while ((m = re.exec(seg))) {
            hlPut(out, "", seg.slice(last, m.index));
            hlPut(out, m[2] ? "fn" : m[3] ? "str" : "tag", m[0]);
            last = re.lastIndex;
        }
        hlPut(out, "", seg.slice(last));
    }

    function hlCss(src, out) {
        var re = /(\/\*)|([{};])|([^{};\/]+|\/)/g, m;
        while ((m = re.exec(src))) {
            if (m[1]) re.lastIndex = hlComment(src, m.index, out);
            else if (m[2]) hlPut(out, "punct", m[2]);
            else if (src.charAt(re.lastIndex) === "{") hlCssSelector(m[3], out);
            else {
                var d = m[3].match(/^(\s*)(--?[\w-]+)(\s*:)([\s\S]*)$/);
                if (d) { hlPut(out, "", d[1]); hlPut(out, "attr", d[2]); hlPut(out, "punct", d[3]); hlCssValue(d[4], out); }
                else hlPut(out, "", m[3]);
            }
        }
    }

    function hlAttrs(str, out) {
        var re = /(\s+)([^\s=\/>"']+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'>]+))?|([\s\S])/g, m;
        while ((m = re.exec(str))) {
            if (m[5] !== undefined) { hlPut(out, "", m[5]); continue; }
            hlPut(out, "", m[1]);
            hlPut(out, "attr", m[2]);
            if (m[3]) { hlPut(out, "punct", m[3]); hlPut(out, "str", m[4]); }
        }
    }

    // Fine di un tag: il primo ">" fuori dalle virgolette, oppure -1. Una sola passata: un testo pieno di "<a" senza ">" non diventa quadratico.
    function hlTagEnd(src, from) {
        var q = "", ch;
        for (var i = from; i < src.length; i++) {
            ch = src.charAt(i);
            if (q) { if (ch === q) q = ""; }
            else if (ch === '"' || ch === "'") q = ch;
            else if (ch === ">") return i;
        }
        return -1;
    }

    function hlHtml(src, out) {
        var re = /<(!--|!doctype|\/?[A-Za-z][\w:-]*)/gi;
        var lower = src.toLowerCase(), last = 0, m;
        while ((m = re.exec(src))) {
            var start = m.index, tok = m[1], end;
            if (tok === "!--" || tok.toLowerCase() === "!doctype") {
                end = src.indexOf(tok === "!--" ? "-->" : ">", start + 2);
                end = end < 0 ? src.length : end + (tok === "!--" ? 3 : 1);
                hlText(out, src.slice(last, start));
                hlPut(out, "com", src.slice(start, end));
                last = re.lastIndex = end;
                continue;
            }
            var close = hlTagEnd(src, re.lastIndex);
            if (close < 0) break;   // nessun ">" fino alla fine: il resto è testo
            hlText(out, src.slice(last, start));
            var closing = tok.charAt(0) === "/", name = closing ? tok.slice(1) : tok;
            var attrs = src.slice(re.lastIndex, close), self = attrs.slice(-1) === "/";
            if (self) attrs = attrs.slice(0, -1);
            hlPut(out, "punct", closing ? "</" : "<");
            hlPut(out, "tag", name);
            hlAttrs(attrs, out);
            hlPut(out, "punct", (self ? "/" : "") + ">");
            last = re.lastIndex = close + 1;
            var low = name.toLowerCase();
            if (!closing && !self && (low === "script" || low === "style")) {
                var stop = lower.indexOf("</" + low, last);
                if (stop < 0) stop = src.length;
                (low === "script" ? hlJs : hlCss)(src.slice(last, stop), out);
                last = re.lastIndex = stop;
            }
        }
        hlText(out, src.slice(last));
    }

    function hlDetect(t) {
        t = t.trim();
        if (t.charAt(0) === "<") return "html";
        if (/^(@|:root)/.test(t) || /^[.#\[\w*,\s>+~:-]+\{/.test(t)) return "css";
        return "js";
    }

    var HL_MAX = 100000;   // oltre questa lunghezza il testo resta senza colori: la colorazione non deve poter bloccare la pagina

    // Kit.highlight(testo, "html"|"js"|"css") → frammento di DOM col codice colorato (la lingua, se manca o non è nota, si indovina)
    function highlight(text, lang) {
        var out = document.createDocumentFragment();
        text = String(text);
        if (text.length > HL_MAX) { out.appendChild(document.createTextNode(text)); return out; }
        lang = String(lang || "").toLowerCase();
        if (lang === "javascript") lang = "js";
        if (lang !== "html" && lang !== "js" && lang !== "css") lang = hlDetect(text);
        (lang === "html" ? hlHtml : lang === "css" ? hlCss : hlJs)(text, out);
        return out;
    }

    function copyText(text, done) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
            return;
        }
        var ta = mkEl("textarea"), ok = false;
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        ta.remove();
        done(ok);
    }

    var codeState = new WeakMap();

    // Kit.code(pre, { lang, text, copy, copyLabel, copiedLabel }) → { set(testo, lingua), text() }
    function code(target, opts) {
        var el = typeof target === "string" ? document.querySelector(target) : target;
        if (!el) return null;
        var pre = el.matches("code") && el.parentNode.matches("pre") ? el.parentNode : el;
        var st = codeState.get(pre);
        opts = opts || {};
        if (st) {
            if (opts.text !== undefined || opts.lang) st.api.set(opts.text !== undefined ? opts.text : st.text, opts.lang || st.lang);
            return st.api;
        }
        var c = pre.matches("code") ? pre : pre.querySelector("code");
        if (!c) {
            c = mkEl("code", "", pre.textContent);
            pre.textContent = "";
            pre.appendChild(c);
        }
        st = { text: opts.text !== undefined ? String(opts.text) : c.textContent, lang: opts.lang || pre.getAttribute("data-kit-code") || "" };
        function render() {
            c.textContent = "";
            try { c.appendChild(highlight(st.text, st.lang)); }
            catch (e) { c.textContent = st.text; }   // in caso di errore il codice si mostra senza colori, mai perso
        }
        st.api = {
            set: function (text, lang) { st.text = String(text); if (lang) st.lang = lang; render(); },
            text: function () { return st.text; }
        };
        codeState.set(pre, st);
        render();

        var wantCopy = opts.copy !== undefined ? opts.copy : pre.hasAttribute("data-kit-code-copy");
        if (wantCopy && pre.parentNode) {
            var label = opts.copyLabel || (typeof wantCopy === "string" ? wantCopy : "") || pre.getAttribute("data-kit-code-copy") || "Copia";
            var done = opts.copiedLabel || pre.getAttribute("data-kit-code-copied") || "Copiato";
            var wrap = mkEl("div", "kit-snippet");
            pre.parentNode.insertBefore(wrap, pre);
            wrap.appendChild(pre);
            var btn = mkEl("button", "kit-btn kit-btn-ghost kit-snippet-copy", label);
            btn.type = "button";
            btn.setAttribute("aria-live", "polite");
            btn.addEventListener("click", function () {
                copyText(st.text, function (ok) {
                    btn.textContent = ok ? done : "—";
                    if (ok) pre.dispatchEvent(new CustomEvent("kit:copy", { bubbles: true, detail: { text: st.text } }));
                    setTimeout(function () { btn.textContent = label; }, 1500);
                });
            });
            wrap.appendChild(btn);
        }
        return st.api;
    }

    /* ---------- Tabella: ordinamento, filtro di testo e paginazione ----------
       <table class="kit-table" data-kit-sort data-kit-page="10" data-kit-empty="Nessun risultato">   (ognuno degli attributi è facoltativo)
       <input class="kit-input" data-kit-filter="#tabella">                                          campo di ricerca
       Ordine e filtro lavorano sulle righe del primo <tbody>; il tipo di una colonna (numeri, date, testo) si riconosce dal contenuto
       oppure si scrive su <th data-kit-type="num|date|text">; il valore di una cella può essere diverso dal testo (<td data-kit-value="…">). */
    var tableState = new WeakMap();
    var TBL_LABELS = { empty: "Nessun risultato", of: "di", prev: "Pagina precedente", next: "Pagina successiva", page: "Pagina {n}", nav: "Paginazione" };
    var NUM_RE = /^[+\-]?\s*[€$£]?\s*[+\-]?\d[\d.,\s]*\s*[%€$£]?$/;
    var DATE_DMY = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:[ T,]+(\d{1,2}):(\d{2}))?$/;
    var DATE_YMD = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/;

    function tblText(node, skipSmall) {
        if (node.nodeType === 3) return node.nodeValue;
        if (node.nodeType !== 1 || (skipSmall && node.nodeName === "SMALL")) return "";
        var out = [];
        node.childNodes.forEach(function (n) { out.push(tblText(n, skipSmall)); });
        return out.join(node.nodeName === "SPAN" || node.nodeName === "B" || node.nodeName === "A" ? "" : " ");
    }

    function tblPlain(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

    function tblNumber(s) {
        s = s.replace(/[\s\u00a0]/g, "").replace(/[\u2212\u2013]/g, "-");
        if (!NUM_RE.test(s)) return null;
        var neg = s.indexOf("-") >= 0;
        s = s.replace(/[^\d.,]/g, "");
        var c = s.lastIndexOf(","), d = s.lastIndexOf(".");
        if (c >= 0 && d >= 0) s = c > d ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
        else if (c >= 0) s = s.replace(/\./g, "").replace(",", ".");
        else if (d >= 0 && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
        var n = parseFloat(s);
        return isNaN(n) ? null : (neg ? -n : n);
    }

    function tblDate(s) {
        var m = DATE_DMY.exec(s), y, mo, d;
        if (m) { d = +m[1]; mo = +m[2]; y = +m[3]; }
        else if ((m = DATE_YMD.exec(s))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
        else return null;
        if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
        return Date.UTC(y, mo - 1, d, +(m[4] || 0), +(m[5] || 0));
    }

    function tblEmpty(s) { return s === "" || s === "-" || s === "\u2014" || s === "\u2013"; }

    function tblTable(target, opts) {
        var table = resolveEl(target);
        if (!table || table.nodeName !== "TABLE") return null;
        if (tableState.has(table)) {
            var old = tableState.get(table);
            if (opts) old.configure(opts);
            return old.api;
        }
        var st = { table: table, rows: [], sorts: [], multi: false, query: "", size: 0, page: 1, labels: {}, sortable: false };
        var collator = null, wrap = table.parentNode && table.parentNode.classList.contains("kit-table-wrap") ? table.parentNode : null;
        var emptyRow = null, pager = null, info = null, pages = null;
        Object.keys(TBL_LABELS).forEach(function (k) { st.labels[k] = TBL_LABELS[k]; });

        function body() { return table.tBodies[0]; }
        function heads() { return table.tHead && table.tHead.rows.length ? Array.prototype.slice.call(table.tHead.rows[table.tHead.rows.length - 1].cells) : []; }
        function lab(k, n) { return String(st.labels[k]).replace("{n}", n); }

        function collect() {
            var b = body();
            st.rows = [];
            if (!b) return;
            Array.prototype.forEach.call(b.rows, function (tr, i) {
                if (tr.classList.contains("kit-table-empty")) return;
                if (tr.__kitIdx === undefined) tr.__kitIdx = i;
                st.rows.push(tr);
            });
            st.rows.forEach(function (tr, i) { tr.__kitIdx = i; tr.__kitText = null; });
        }

        function cellValue(tr, col) {
            var td = tr.cells[col];
            if (!td) return "";
            var v = td.getAttribute("data-kit-value");
            return (v !== null ? v : tblText(td, true)).replace(/\s+/g, " ").trim();
        }

        function colType(col) {
            var th = heads()[col], t = th && th.getAttribute("data-kit-type");
            if (t === "num" || t === "date" || t === "text") return t;
            var vals = st.rows.map(function (tr) { return cellValue(tr, col); }).filter(function (v) { return !tblEmpty(v); });
            if (!vals.length) return "text";
            if (vals.every(function (v) { return tblNumber(v) !== null; })) return "num";
            if (vals.every(function (v) { return tblDate(v) !== null; })) return "date";
            return "text";
        }

        function sortRows(list) {
            if (!st.sorts.length) return list.slice().sort(function (a, b) { return a.__kitIdx - b.__kitIdx; });
            if (!collator) collator = new Intl.Collator(root.lang || "it", { numeric: true, sensitivity: "base" });
            var crit = st.sorts.map(function (c) { return { col: c.col, type: colType(c.col), dir: c.dir === "descending" ? -1 : 1 }; });
            var keyed = list.map(function (tr) {
                return { tr: tr, keys: crit.map(function (c) {
                    var raw = cellValue(tr, c.col);
                    return tblEmpty(raw) ? null : c.type === "num" ? tblNumber(raw) : c.type === "date" ? tblDate(raw) : raw;
                }) };
            });
            keyed.sort(function (a, b) {
                for (var n = 0; n < crit.length; n++) {
                    var x = a.keys[n], y = b.keys[n];
                    if (x === null || y === null) { if (x !== y) return x === null ? 1 : -1; continue; }
                    var r = crit[n].type === "text" ? collator.compare(x, y) : x - y;
                    if (r) return r * crit[n].dir;
                }
                return a.tr.__kitIdx - b.tr.__kitIdx;
            });
            return keyed.map(function (k) { return k.tr; });
        }

        function matches(tr, words) {
            if (!words.length) return true;
            if (tr.__kitText == null) tr.__kitText = tblPlain(tblText(tr, false).replace(/\s+/g, " "));
            return words.every(function (w) { return tr.__kitText.indexOf(w) >= 0; });
        }

        function ensurePager() {
            if (pager || !st.size) return;
            pager = mkEl("nav", "kit-pagination");
            pager.setAttribute("aria-label", st.labels.nav);
            info = mkEl("p", "kit-pagination-info");
            info.setAttribute("aria-live", "polite");
            pages = mkEl("div", "kit-pagination-pages");
            pager.appendChild(info);
            pager.appendChild(pages);
            (wrap || table).insertAdjacentElement("afterend", pager);
            pager.addEventListener("click", function (e) {
                var b = e.target instanceof Element && e.target.closest("button[data-p]");
                if (!b || b.disabled) return;
                goPage(+b.getAttribute("data-p"));
            });
        }

        function pageBtn(n, text, label, current, disabled) {
            var b = mkEl("button", "kit-btn kit-btn-ghost", text);
            b.type = "button";
            b.setAttribute("data-p", n);
            b.setAttribute("aria-label", label);
            if (current) { b.setAttribute("aria-current", "page"); b.classList.remove("kit-btn-ghost"); }
            if (disabled) b.disabled = true;
            return b;
        }

        function drawPager(total, from, to, nPages) {
            var hadFocus = pager.contains(document.activeElement), want = hadFocus ? document.activeElement.getAttribute("data-p") : null;
            info.textContent = total ? from + "\u2013" + to + " " + st.labels.of + " " + total : "0 " + st.labels.of + " " + st.rows.length;
            pages.textContent = "";
            pages.hidden = nPages <= 1;
            if (nPages <= 1) return;
            var cur = st.page;
            var pb = pageBtn(cur - 1, "\u2039", lab("prev"), false, cur === 1);
            pb.classList.add("kit-btn-icon");
            pages.appendChild(pb);
            var shown = [], last = 0;
            for (var p = 1; p <= nPages; p++) if (p === 1 || p === nPages || Math.abs(p - cur) <= 1 || (cur <= 3 && p <= 4) || (cur >= nPages - 2 && p >= nPages - 3)) shown.push(p);
            shown.forEach(function (p) {
                if (last && p - last > 1) { var gap = mkEl("span", "kit-pagination-gap", "\u2026"); gap.setAttribute("aria-hidden", "true"); pages.appendChild(gap); }
                pages.appendChild(pageBtn(p, String(p), lab("page", p), p === cur, false));
                last = p;
            });
            var nb = pageBtn(cur + 1, "\u203a", lab("next"), false, cur === nPages);
            nb.classList.add("kit-btn-icon");
            pages.appendChild(nb);
            if (want !== null) {
                var f = pages.querySelector('button[data-p="' + want + '"]:not(:disabled)') || pages.querySelector('[aria-current="page"]');
                if (f) f.focus({ preventScroll: true });
            }
        }

        // Ridisegna: ordine, filtro, pagina. Gli eventi partono dai metodi che cambiano lo stato, non da qui.
        function render() {
            var b = body();
            if (!b) return;
            var words = tblPlain(st.query).split(/\s+/).filter(Boolean);
            var ordered = sortRows(st.rows);
            ordered.forEach(function (tr) { b.appendChild(tr); });
            var hit = ordered.filter(function (tr) { return matches(tr, words); });
            var nPages = st.size ? Math.max(1, Math.ceil(hit.length / st.size)) : 1;
            st.page = Math.min(Math.max(1, st.page), nPages);
            var from = st.size ? (st.page - 1) * st.size : 0, to = st.size ? Math.min(hit.length, from + st.size) : hit.length;
            var vis = hit.slice(from, to), set = new Set(vis);
            st.rows.forEach(function (tr) { tr.hidden = !set.has(tr); tr.classList.remove("is-last"); });
            if (vis.length) vis[vis.length - 1].classList.add("is-last");
            if (!emptyRow) {
                emptyRow = mkEl("tr", "kit-table-empty");
                emptyRow.appendChild(mkEl("td"));
            }
            emptyRow.firstChild.colSpan = Math.max(1, heads().length || (st.rows[0] ? st.rows[0].cells.length : 1));
            emptyRow.firstChild.textContent = st.labels.empty;
            if (!vis.length && !emptyRow.parentNode) b.appendChild(emptyRow);
            if (vis.length && emptyRow.parentNode) b.removeChild(emptyRow);
            if (!vis.length) emptyRow.classList.add("is-last"); else emptyRow.classList.remove("is-last");
            ensurePager();
            if (pager) drawPager(hit.length, from + 1, to, nPages);
            st.count = hit.length;
            st.pages = nPages;
        }

        function syncHeads() {
            heads().forEach(function (th, i) {
                if (!st.sortable || th.hasAttribute("data-kit-nosort")) return;
                var pos = -1;
                st.sorts.forEach(function (c, n) { if (c.col === i) pos = n; });
                th.setAttribute("aria-sort", pos >= 0 ? st.sorts[pos].dir : "none");
                if (th.__kitN) {
                    th.__kitN.textContent = pos >= 0 && st.sorts.length > 1 ? String(pos + 1) : "";
                    th.__kitN.hidden = th.__kitN.textContent === "";
                }
            });
        }

        function setupHeads() {
            heads().forEach(function (th, i) {
                if (th.hasAttribute("data-kit-nosort")) { th.removeAttribute("aria-sort"); return; }
                var cur = th.getAttribute("aria-sort");
                if ((cur === "ascending" || cur === "descending") && (st.multi || !st.sorts.length) && !st.sorts.some(function (c) { return c.col === i; })) st.sorts.push({ col: i, dir: cur });
                if (!th.querySelector(".kit-sort-btn")) {
                    var btn = mkEl("button", "kit-sort-btn");
                    btn.type = "button";
                    while (th.firstChild) btn.appendChild(th.firstChild);
                    var n = mkEl("span", "kit-sort-n");
                    n.hidden = true;
                    n.setAttribute("aria-hidden", "true");
                    btn.appendChild(n);
                    th.appendChild(btn);
                    th.__kitN = n;
                }
                th.setAttribute("aria-sort", cur === "ascending" || cur === "descending" ? cur : "none");
                th.__kitCol = i;
            });
        }

        function fire(name, detail) { table.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); }
        function sortDetail() {
            var c = st.sorts[0];
            return { column: c ? c.col : -1, direction: c ? c.dir : "none", criteria: st.sorts.map(function (c) { return { column: c.col, direction: c.dir }; }) };
        }

        // sortBy(col, dir) = una sola colonna; sortBy([[col, dir], ...]) = più colonne (solo con data-kit-sort="multi")
        function sortBy(col, dir) {
            var list = Array.isArray(col) ? col : [[col, dir]];
            st.sorts = [];
            list.forEach(function (c) {
                var cc = Array.isArray(c) ? c[0] : c.column, dd = Array.isArray(c) ? c[1] : c.direction;
                if (dd === undefined && !Array.isArray(col)) dd = "ascending";
                if (dd !== "ascending" && dd !== "descending") return;
                if (!(cc >= 0) || st.sorts.some(function (x) { return x.col === cc; })) return;
                if (st.sorts.length && !st.multi) return;
                st.sorts.push({ col: cc, dir: dd });
            });
            st.page = 1;
            syncHeads();
            render();
            fire("kit:sort", sortDetail());
        }

        // Clic su un'intestazione. Con Shift o Ctrl/⌘ (e data-kit-sort="multi") la colonna si aggiunge, si inverte o si toglie
        // dall'elenco; senza, diventa l'unico criterio (e, se lo era già, passa a decrescente, poi a nessuno).
        function headClick(col, add) {
            var cur = null;
            st.sorts.forEach(function (c) { if (c.col === col) cur = c; });
            var next = !cur ? "ascending" : cur.dir === "ascending" ? "descending" : "none";
            if (add && st.multi) {
                var list = st.sorts.filter(function (c) { return c.col !== col; }).map(function (c) { return [c.col, c.dir]; });
                if (next !== "none") {
                    if (cur) list.splice(st.sorts.indexOf(cur), 0, [col, next]); else list.push([col, next]);
                }
                sortBy(list);
            } else {
                if (st.sorts.length > 1) next = "ascending";
                sortBy(next === "none" ? [] : [[col, next]]);
            }
        }

        function setFilter(q) {
            q = q == null ? "" : String(q);
            if (q === st.query) return;
            st.query = q;
            st.page = 1;
            render();
            fire("kit:filter", { query: q, count: st.count });
        }

        function goPage(n) {
            var before = st.page;
            st.page = Math.max(1, Math.round(+n) || 1);
            render();
            if (st.page !== before) fire("kit:page", { page: st.page, pages: st.pages, size: st.size, total: st.count });
        }

        function setSize(n) {
            st.size = Math.max(0, Math.round(+n) || 0);
            st.page = 1;
            if (!st.size && pager) { pager.remove(); pager = info = pages = null; }
            render();
        }

        function configure(o) {
            if (o.labels) Object.keys(o.labels).forEach(function (k) { st.labels[k] = o.labels[k]; });
            if (o.empty != null) st.labels.empty = o.empty;
            if (o.sort !== undefined && (!!o.sort !== st.sortable || (o.sort === "multi") !== st.multi)) {
                st.multi = o.sort === "multi";
                st.sortable = !!o.sort;
                if (st.sortable) setupHeads();
                syncHeads();
            }
            if (o.size !== undefined) st.size = Math.max(0, Math.round(+o.size) || 0);
            if (o.filter !== undefined) st.query = String(o.filter);
            if (o.page !== undefined) st.page = Math.max(1, Math.round(+o.page) || 1);
            if (pager) pager.setAttribute("aria-label", st.labels.nav);
            render();
        }

        var api = {
            sort: function (col, dir) { sortBy(col, dir); },
            filter: function (q) { setFilter(q); },
            page: function (n) { if (n === undefined) return st.page; goPage(n); },
            pageSize: function (n) { if (n === undefined) return st.size; setSize(n); },
            refresh: function () { collect(); render(); },
            state: function () { return { sort: sortDetail(), query: st.query, page: st.page, pages: st.pages, size: st.size, total: st.rows.length, count: st.count }; }
        };
        st.api = api;
        st.configure = configure;
        tableState.set(table, st);

        table.addEventListener("click", function (e) {
            var th = e.target instanceof Element && e.target.closest("th");
            if (!th || !st.sortable || th.__kitCol === undefined || th.parentNode.parentNode !== table.tHead || th.hasAttribute("data-kit-nosort")) return;
            headClick(th.__kitCol, e.shiftKey || e.ctrlKey || e.metaKey);
        });

        collect();
        var o = opts || {};
        if (o.sort === undefined) o.sort = table.hasAttribute("data-kit-sort") ? (table.getAttribute("data-kit-sort") === "multi" ? "multi" : true) : false;
        if (o.size === undefined && table.hasAttribute("data-kit-page")) o.size = table.getAttribute("data-kit-page");
        if (o.empty === undefined && table.hasAttribute("data-kit-empty")) o.empty = table.getAttribute("data-kit-empty");
        configure(o);
        return api;
    }

    function tblPaginate(target, size) {
        var table = resolveEl(target);
        return tblTable(table, { size: size == null ? 10 : size });
    }

    function tblFilterInput(input) {
        if (input.__kitFilter) return;
        var table = resolveEl(input.getAttribute("data-kit-filter"));
        var api = table && tblTable(table);
        if (!api) return;
        input.__kitFilter = true;
        if (table.id && !input.hasAttribute("aria-controls")) input.setAttribute("aria-controls", table.id);
        if (input.value) api.filter(input.value);
        input.addEventListener("input", function () { api.filter(input.value); });
    }

    function init(scope) {
        scope = scope || document;
        scope.querySelectorAll("table[data-kit-sort], table[data-kit-page]").forEach(function (t) { tblTable(t); });
        scope.querySelectorAll("[data-kit-filter]").forEach(function (i) { tblFilterInput(i); });
        scope.querySelectorAll("select[data-kit-select]").forEach(function (s) { nativeSelect(s); });
        scope.querySelectorAll("[data-kit-select]:not(select):not([data-kit-native])").forEach(function (sel) {
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
        scope.querySelectorAll("[data-kit-combo]").forEach(function (c) { combo(c); });
        scope.querySelectorAll("[data-kit-file]").forEach(function (c) { fileField(c); });
        scope.querySelectorAll("[data-kit-code]").forEach(function (c) { code(c); });
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
        scope.querySelectorAll("[data-kit-sidebar-toggle]").forEach(function (b) {
            var sel = b.getAttribute("data-kit-sidebar-toggle");
            var sb = sideBar(sel);
            if (sb && sb.id && !b.hasAttribute("aria-controls")) b.setAttribute("aria-controls", sb.id);
        });
        sideSync();
        scope.querySelectorAll("[data-kit-theme-set]").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-kit-theme-set") === theme.get()));
        });
    }

    // Rilascio di file in qualsiasi punto della pagina (zona con data-kit-file-page).
    document.addEventListener("dragenter", function (e) {
        if (!pageFileZone || !hasFiles(e)) return;
        e.preventDefault();
        pageDragN++;
        if (!dropVeil) {
            dropVeil = mkEl("div", "kit-drop-veil");
            dropVeil.setAttribute("aria-hidden", "true");
            document.body.appendChild(dropVeil);
        }
        dropVeil.textContent = pageFileZone.text;
        dropVeil.classList.add("is-on");
    });
    document.addEventListener("dragover", function (e) { if (pageFileZone && hasFiles(e)) e.preventDefault(); });
    document.addEventListener("dragleave", function () { if (pageFileZone && --pageDragN <= 0) endPageDrag(); });
    document.addEventListener("drop", function (e) {
        if (!pageFileZone || !hasFiles(e)) return;
        e.preventDefault();
        endPageDrag();
        if (pageFileZone.wrap.isConnected) fileDrop(pageFileZone.wrap, pageFileZone.st, e.dataTransfer);
    });

    // Applica subito il tema salvato (evita il lampo se lo script è nel <head>).
    var saved = readStored();
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

    // Idem per la dimensione del testo.
    var savedFs = readFs();
    if (savedFs) root.setAttribute("data-kit-fs", savedFs);

    // Idem per la larghezza: la scelta dell'utente vince su quella scritta nell'HTML.
    var savedLayout = readLayout();
    if (savedLayout) root.setAttribute("data-layout", savedLayout);

    // Idem per la sidebar compatta o espansa.
    var savedSide = readSide();
    if (savedSide) root.setAttribute("data-kit-sidebar", savedSide);
    window.addEventListener("resize", sideSync);

    // htmx: ogni frammento inserito da htmx lancia "htmx:load"; lo si inizializza (una sola volta per contenitore, anche se i
    // nodi inseriti sono tanti). init() si può ripetere senza duplicare niente, e parte dal contenitore perché il nodo stesso
    // (per esempio una tabella sostituita con outerHTML) non rientra nelle ricerche che fa su ciò che contiene.
    var htmxQueue = null;
    document.addEventListener("htmx:load", function (e) {
        var t = e.target;
        if (!(t instanceof Element) || t === document.body || t === root) return;
        var scope = t.parentNode instanceof Element ? t.parentNode : t;
        if (!htmxQueue) {
            htmxQueue = new Set();
            Promise.resolve().then(function () {
                var list = htmxQueue;
                htmxQueue = null;
                list.forEach(function (el) { if (el.isConnected) init(el); });
            });
        }
        htmxQueue.add(scope);
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
    else init();

    window.Kit = { theme: theme, layout: layout, sidebar: sidebar, fontSize: fontSize, reset: reset, toast: toast, undo: undo, confirm: confirmDialog, split: split, file: fileField, progress: progressDialog, combo: combo, select: nativeSelect, code: code, highlight: highlight, barChart: barChart, lineChart: lineChart, donut: donut, sparkline: sparkline, table: tblTable, paginate: tblPaginate, init: init };
})();
