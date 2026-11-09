// Solo per la dashboard di esempio: il controllo "Periodo" è un segmented di sola grafica.
document.getElementById("periodo").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); });
    Kit.toast("Periodo: " + b.textContent);
});
