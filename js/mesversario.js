// ===== Mesversario: cada día 13 aparece un aviso especial bajo el contador =====
// Usa COUNTER_START de script.js, así que debe cargarse DESPUÉS de script.js.
(function () {
    "use strict";
    const ahora = new Date();
    if (typeof COUNTER_START === "undefined" || ahora.getDate() !== COUNTER_START.getDate()) return;

    const meses = (ahora.getFullYear() - COUNTER_START.getFullYear()) * 12 + (ahora.getMonth() - COUNTER_START.getMonth());
    if (meses < 1) return;

    let texto;
    if (meses % 12 === 0) {
        const a = meses / 12;
        texto = "Hoy cumplimos " + (a === 1 ? "un año" : a + " años");
    } else {
        texto = "Hoy cumplimos " + (meses === 1 ? "un mes" : meses + " meses");
    }

    const grid = document.getElementById("counterGrid");
    if (!grid) return;
    const p = document.createElement("p");
    p.className = "mesversario";
    p.textContent = "✦ " + texto + " ✦";
    grid.after(p);
})();
