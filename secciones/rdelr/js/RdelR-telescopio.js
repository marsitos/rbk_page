/**
 * Visor del telescopio: arrastrar para mirar el cielo, tocar las luces que aparecen,
 * viajar hasta cada párrafo y, con la última luz, llegar a la pregunta.
 * Depende de: RdelR-data.js (VIRGO_TEXTOS, TELESCOPIO), RdelR-cielo.js y, para el viaje, RdelR-viaje.js.
 * La pregunta final la abre window.abrirPregunta (RdelR-pregunta.js).
 */
window.Telescopio = (() => {
  "use strict";

  const CONFIG = {
    ganancia: 1,          // unidades que se mueve el cielo por cada diámetro de lente arrastrado
    friccion: 3.2,        // qué tan rápido se frena el cielo al soltar
    umbralToque: 10,      // px: menos que esto es un toque; más, un arrastre
    duracionToque: 450,   // ms máximos de un toque
    duracionViaje: 1.8,   // segundos del viaje de una estrella a su párrafo
    fps: 30,
    pasoTeclado: 0.1
  };

  const $ = id => document.getElementById(id);
  const scope = $("scope"), wrap = $("scopeWrap"), lens = $("scopeLens"), canvas = $("scopeCanvas");
  const hint = $("scopeHint"), help = $("scopeHelp"), dotsBox = $("scopeDots"), closeBtn = $("scopeClose");
  const modal = document.querySelector(".text-modal"), modalText = $("star-text"), closeText = $("closeText");
  if (!scope || !lens || !canvas || !window.Cielo) return { abrir() {}, cerrar() {}, estado: () => null };

  const textos = typeof VIRGO_TEXTOS !== "undefined" ? VIRGO_TEXTOS : [];
  const ajustes = Object.assign(
    { pistaArrastrar: "", salir: "✕ salir", segundosPista: 6 },
    typeof TELESCOPIO !== "undefined" ? TELESCOPIO : {}
  );
  const total = textos.length + 1;               // los párrafos + la pregunta
  const cielo = Cielo.crear(canvas, { total });
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ----- Estado -----
  const encontradas = new Set();
  let abierto = false, bloqueado = false, yaArrastro = false;
  let D = 320, ultimoFrame = 0, ultimoProgreso = 0;
  let arrastrando = false, inicio = null, ultimo = null, movido = 0, vx = 0, vy = 0;

  // ----- Interfaz -----
  closeBtn.textContent = ajustes.salir;
  help.textContent = ajustes.pistaArrastrar;
  const puntos = Array.from({ length: total }, () => {
    const d = document.createElement("span");
    d.className = "dot";
    dotsBox.appendChild(d);
    return d;
  });
  const pintarPuntos = () => puntos.forEach((d, i) => d.classList.toggle("on", i < encontradas.size));

  function dimensionar() {
    D = Math.round(clamp(Math.min(innerWidth * 0.92, innerHeight * 0.72, 780), 240, 780));
    wrap.style.setProperty("--D", D + "px");
    cielo.ajustar(D);
    cielo.dibujar(performance.now() / 1000);
  }

  // Coordenadas del puntero dentro del lente (corrige la escala mientras el visor se está abriendo)
  function local(clientX, clientY) {
    const r = lens.getBoundingClientRect(), k = D / (r.width || D);
    return { x: (clientX - r.left) * k, y: (clientY - r.top) * k, r, k };
  }

  // ----- Abrir y cerrar -----
  function abrir() {
    if (abierto) return;
    abierto = true;
    dimensionar();
    scope.classList.add("open");
    scope.setAttribute("aria-hidden", "false");
    document.body.classList.add("scope-open");
    help.classList.toggle("off", yaArrastro);
    ultimoProgreso = performance.now();
    ultimoFrame = 0;
    requestAnimationFrame(cuadro);
    closeBtn.focus({ preventScroll: true });
  }

  function cerrar() {
    if (!abierto || bloqueado) return;
    abierto = false;
    scope.classList.remove("open");
    scope.setAttribute("aria-hidden", "true");
    document.body.classList.remove("scope-open");
    ocultarPista();
    document.dispatchEvent(new CustomEvent("telescopio:cerrado"));
  }

  // ----- Animación -----
  function cuadro(ahora) {
    if (!abierto) return;
    requestAnimationFrame(cuadro);
    if (bloqueado) return;                          // hay un viaje o un texto encima: no gastar batería
    if (ahora - ultimoFrame < 1000 / CONFIG.fps) return;
    const dt = ultimoFrame ? Math.min((ahora - ultimoFrame) / 1000, 0.1) : 0.033;
    ultimoFrame = ahora;

    if (!arrastrando && (Math.abs(vx) > 0.003 || Math.abs(vy) > 0.003)) { // el cielo sigue un poco al soltar
      cielo.mover(vx * dt, vy * dt);
      const f = Math.exp(-CONFIG.friccion * dt);
      vx *= f; vy *= f;
    }
    actualizarPista(ahora);
    cielo.dibujar(ahora / 1000);
  }

  // ----- Indicación discreta: tras N segundos sin encontrar una luz -----
  function ocultarPista() { hint.classList.remove("on"); }

  function actualizarPista(ahora) {
    if (encontradas.size >= total || ahora - ultimoProgreso < ajustes.segundosPista * 1000) { ocultarPista(); return; }
    const c = cielo.masCercana();
    if (!c || c.alcance > 0.3) { ocultarPista(); return; } // ya hay una luz a la vista: no hace falta
    const ang = Math.atan2(c.dy, c.dx), radio = D / 2 * 0.9;
    hint.style.transform =
      `translate(${D / 2 + Math.cos(ang) * radio}px, ${D / 2 + Math.sin(ang) * radio}px) translate(-50%, -50%) rotate(${ang}rad)`;
    hint.classList.add("on");
  }

  // ----- Arrastrar y tocar -----
  lens.addEventListener("pointerdown", e => {
    if (bloqueado || e.button > 0) return;
    lens.setPointerCapture(e.pointerId);
    arrastrando = true; movido = 0; vx = vy = 0;
    inicio = ultimo = { x: e.clientX, y: e.clientY, t: performance.now() };
    lens.classList.add("arrastrando");
  });

  lens.addEventListener("pointermove", e => {
    if (!arrastrando) { // en computador, el cursor avisa cuando hay una luz que se puede tocar
      const p = local(e.clientX, e.clientY);
      lens.classList.toggle("sobre", !bloqueado && cielo.estrellaEn(p.x, p.y) >= 0);
      return;
    }
    const ahora = performance.now(), dx = e.clientX - ultimo.x, dy = e.clientY - ultimo.y;
    const k = CONFIG.ganancia / (lens.getBoundingClientRect().width || D); // unidades por px arrastrado
    cielo.mover(-dx * k, -dy * k);
    const dt = (ahora - ultimo.t) / 1000;
    if (dt > 0) { vx += (-dx * k / dt - vx) * 0.5; vy += (-dy * k / dt - vy) * 0.5; }
    movido += Math.hypot(dx, dy);
    ultimo = { x: e.clientX, y: e.clientY, t: ahora };
    if (movido > 40 && !yaArrastro) { yaArrastro = true; help.classList.add("off"); }
  });

  function soltar(e) {
    if (!arrastrando) return;
    arrastrando = false;
    lens.classList.remove("arrastrando");
    const corto = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) < CONFIG.umbralToque &&
                  performance.now() - inicio.t < CONFIG.duracionToque;
    if (corto) { vx = vy = 0; tocar(e.clientX, e.clientY); }
    else if (performance.now() - ultimo.t > 90) { vx = vy = 0; } // se quedó quieto antes de soltar
  }
  lens.addEventListener("pointerup", soltar);
  lens.addEventListener("pointercancel", () => { arrastrando = false; lens.classList.remove("arrastrando"); });

  function tocar(clientX, clientY) {
    const p = local(clientX, clientY), i = cielo.estrellaEn(p.x, p.y);
    if (i >= 0) activar(i);
  }

  // ----- Una luz encontrada: viaje y párrafo -----
  // El párrafo depende de CUÁNTAS llevas, no de cuál tocaste: siempre salen en el mismo orden.
  function activar(i) {
    if (bloqueado) return;
    bloqueado = true; vx = vy = 0;
    const pos = cielo.posicion(i), r = lens.getBoundingClientRect();
    cielo.encontrar(i);
    encontradas.add(i);
    pintarPuntos(); ocultarPista();
    cielo.dibujar(performance.now() / 1000);
    const orden = encontradas.size - 1;
    const llegar = () => mostrar(orden);
    if (reducir || !window.FXViaje) llegar();
    else FXViaje.iniciar(r.left + pos.x * r.width / D, r.top + pos.y * r.height / D, llegar,
                         { duracion: CONFIG.duracionViaje, quitar: true });
  }

  function mostrar(orden) {
    if (orden < textos.length) {
      modalText.textContent = textos[orden];
      modalText.hidden = false;
      closeText.hidden = false;
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      closeText.focus({ preventScroll: true });
    } else if (typeof window.abrirPregunta === "function") {
      window.abrirPregunta();                      // la última luz: la pregunta
    }
  }

  closeText.addEventListener("click", () => {      // cerrar un párrafo: de vuelta al cielo
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    bloqueado = false;
    ultimoProgreso = performance.now();
    if (abierto) closeBtn.focus({ preventScroll: true });
  });

  closeBtn.addEventListener("click", cerrar);

  // ----- Teclado (para quien no usa mouse ni pantalla táctil) -----
  document.addEventListener("keydown", e => {
    if (!abierto || bloqueado) return;
    const m = CONFIG.pasoTeclado;
    if (e.key === "Escape") cerrar();
    else if (e.key === "ArrowLeft") cielo.mover(-m, 0);
    else if (e.key === "ArrowRight") cielo.mover(m, 0);
    else if (e.key === "ArrowUp") cielo.mover(0, -m);
    else if (e.key === "ArrowDown") cielo.mover(0, m);
    else if (e.key === "Enter" || e.key === " ") {
      const i = cielo.estrellaEn(D / 2, D / 2);
      if (i >= 0) { e.preventDefault(); activar(i); }
    } else return;
    if (e.key.startsWith("Arrow")) { e.preventDefault(); yaArrastro = true; help.classList.add("off"); }
  });

  window.addEventListener("resize", () => { if (abierto) dimensionar(); });

  return Object.freeze({
    abrir, cerrar,
    estado: () => Object.assign(cielo.estado(), {
      abierto, bloqueado, encontradas: encontradas.size, total, pista: hint.classList.contains("on")
    })
  });
})();
