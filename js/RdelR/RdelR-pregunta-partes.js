/**
 * La última estrella, por partes:
 *   1) la estrella fugaz (icono)  →  clic  →  2) la frase (intro)  →  clic  →  3) la pregunta (título y botones).
 * No modifica RdelR-pregunta.js: solo envuelve window.abrirPregunta. Cargar DESPUÉS de ese archivo.
 * Los textos siguen saliendo de PREGUNTA (RdelR-data.js).
 */
(() => {
  "use strict";

  const CONFIG = {
    // null = cada parte avanza con un clic.
    // Un número (ej. 8) = la pregunta aparece sola tantos segundos después de mostrar la frase.
    segundosHastaPregunta: null
  };

  const question = document.getElementById("question");
  const icon = document.getElementById("qIcon");
  const intro = document.getElementById("qIntro");
  const title = document.getElementById("qTitle");
  const msg = document.getElementById("noMsg");
  const buttons = question && question.querySelector(".q-btns");
  const abrirOriginal = window.abrirPregunta;
  if (!question || !icon || !intro || !title || !buttons || typeof abrirOriginal !== "function") return;

  // Indicador para seguir leyendo (aparece junto a la frase)
  const siguiente = document.createElement("button");
  siguiente.type = "button";
  siguiente.className = "q-next";
  siguiente.setAttribute("aria-label", "Continuar");
  siguiente.textContent = "⌄";
  intro.after(siguiente);

  let paso = 3, temporizador = 0;

  function mostrarParte(n) {
    paso = n;
    question.dataset.paso = n;
    clearTimeout(temporizador);

    intro.hidden = n < 2;
    siguiente.hidden = n !== 2;
    title.hidden = buttons.hidden = msg.hidden = n < 3;

    // Lo que acaba de aparecer entra con un fundido suave
    const nuevos = n === 2 ? [intro, siguiente] : n === 3 ? [title, buttons] : [];
    nuevos.forEach(el => { el.classList.remove("q-aparece"); void el.offsetWidth; el.classList.add("q-aparece"); });

    // Solo la estrella se puede activar con teclado mientras es la única parte visible
    icon.tabIndex = n === 1 ? 0 : -1;
    if (n === 1) { icon.setAttribute("role", "button"); icon.setAttribute("aria-label", "Seguir"); }

    if (n === 2 && typeof CONFIG.segundosHastaPregunta === "number") {
      temporizador = setTimeout(() => mostrarParte(3), CONFIG.segundosHastaPregunta * 1000);
    }
  }

  const avanzar = () => { if (paso < 3) mostrarParte(paso + 1); };

  // Un clic en cualquier parte de la pregunta avanza (salvo en los botones Sí/No, que aparecen al final)
  question.addEventListener("click", e => {
    if (e.target.closest(".q-btns")) return;
    avanzar();
  });
  icon.addEventListener("keydown", e => {
    if (paso === 1 && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); avanzar(); }
  });

  // Cada vez que se abre la pregunta, empieza otra vez desde la estrella
  window.abrirPregunta = function () {
    mostrarParte(1);
    return abrirOriginal.apply(this, arguments);
  };
})();
