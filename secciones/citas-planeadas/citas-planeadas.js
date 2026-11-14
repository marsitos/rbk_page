// Dibuja las tarjetas a partir de CITAS (citas-data.js) y calcula el progreso.

(function () {
  const lista = document.getElementById("lista");
  const readout = document.getElementById("progressReadout");
  if (!lista || typeof CITAS === "undefined") return;

  function crearTarjeta(cita, i) {
    const item = document.createElement("div");
    item.className = "item" + (cita.hecha ? " done" : "");
    item.dataset.id = cita.id;
    item.style.animationDelay = (0.05 + Math.min(i * 0.1, 1.2)).toFixed(2) + "s";

    const numero = document.createElement("span");
    numero.className = "item-number";
    numero.textContent = String(i + 1).padStart(2, "0");

    const marca = document.createElement("span");
    marca.className = "item-mark";

    const cuerpo = document.createElement("div");
    cuerpo.className = "item-body";
    const h3 = document.createElement("h3");
    h3.textContent = cita.titulo;
    const p = document.createElement("p");
    p.textContent = cita.texto;
    cuerpo.append(h3, p);

    item.append(numero, marca, cuerpo);
    return item;
  }

  function actualizarProgreso() {
    if (!readout || !CITAS.length) return;
    const total = CITAS.length;
    const hechas = CITAS.filter(c => c.hecha).length;

    readout.textContent = hechas === 0
      ? `0 de ${total} hechas, por ahora`
      : hechas === total
        ? `las ${total} hechas — hora de agregar más`
        : `${hechas} de ${total} hechas`;
  }

  CITAS.forEach((cita, i) => lista.appendChild(crearTarjeta(cita, i)));
  actualizarProgreso();
})();
