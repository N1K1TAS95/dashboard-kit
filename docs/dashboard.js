// Only for the example dashboard: the "Period" control is a segmented with graphics only.
document.getElementById("periodo").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); });
    Kit.toast("Periodo: " + b.textContent);
});
