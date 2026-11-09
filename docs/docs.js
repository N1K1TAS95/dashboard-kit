// Solo per la pagina di documentazione: piccole interazioni di esempio.
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
