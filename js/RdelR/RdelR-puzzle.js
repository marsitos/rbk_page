// ===== Puzzle del planeta (solo computador) =====
// Paso 1: arrastrar para alinear los anillos con la Vía Láctea.
// Paso 2: mantener el clic sobre el planeta para cargar su núcleo.
// Paso 3: repetir en orden la secuencia de luces; al acertar la última, el planeta se abre y se entra a Interior.html.
(function () {
  const CONFIG = {
    destino: "Interior.html",          // página que se abre al completar el puzzle
    objetivoGrados: -25,               // inclinación de los anillos que "encaja" (paralela a la franja de la Vía Láctea)
    tolerancia: 3,                   // margen de error en grados
    segundosCarga: 2.4,                // cuánto hay que mantener el clic
    angulosOrbes: [180, -120, -60, 0], // posición de las 4 luces alrededor del planeta (grados)
    segundosPista: 6,                  // si no hace nada en este tiempo, aparece una pista
    pistas: [
      "Los anillos buscan seguir el camino de la galaxia, alinealos con la vía…",
      "Algo duerme en el centro. Mantén presionado.",
      "Sigue la luz… y repítela."
    ]
  };
  const BASE = -18; // inclinación natural de los anillos (la misma de RdelR-planeta.js)

  const planet = document.querySelector(".fx-planet");
  if (!planet) return;
  const par = planet.querySelector(".fx-par");
  const sphere = planet.querySelector(".fx-sphere");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e; };

  // ----- Piezas visuales -----
  const core = el("div", "fx-core");
  sphere.appendChild(core);

  const orbsBox = el("div", "fx-orbs");
  par.appendChild(orbsBox);
  const orbs = CONFIG.angulosOrbes.map((deg, i) => {
    const o = el("div", "fx-orb"), a = deg * Math.PI / 180;
    o.style.setProperty("--ox", Math.cos(a).toFixed(3));
    o.style.setProperty("--oy", Math.sin(a).toFixed(3));
    o.dataset.i = i;
    orbsBox.appendChild(o);
    return o;
  });

  const stepsBox = el("div", "fx-steps");
  const dots = [0, 1, 2].map(() => { const d = el("span", "fx-dot"); stepsBox.appendChild(d); return d; });
  planet.appendChild(stepsBox);
  const hint = el("p", "fx-hint");
  planet.appendChild(hint);

  // ----- Estado -----
  let paso = 0, terminado = false;
  let bias = 0, drag = null;            // paso 1
  let prog = 0, cargando = false, loopOn = false, tPrev = 0; // paso 2
  let seq = [], k = 0, reproduciendo = false;                // paso 3
  let idle;

  FX.rzWobble = 3; // el vaivén del mouse en los anillos se reduce mientras dura el puzzle

  const geo = e => {
    const r = sphere.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return { d: Math.hypot(e.clientX - cx, e.clientY - cy), R: r.width / 2, cx, cy };
  };
  const error = () => Math.abs(BASE + bias - CONFIG.objetivoGrados);
  const marcar = i => dots[i].classList.add("on");
  const destello = () => { planet.classList.remove("flash"); void planet.offsetWidth; planet.classList.add("flash"); };

  function pista() {
    hint.classList.remove("on");
    clearTimeout(idle);
    if (terminado) return;
    idle = setTimeout(() => { hint.textContent = CONFIG.pistas[paso]; hint.classList.add("on"); }, CONFIG.segundosPista * 1000);
  }

  // ----- Paso 1: alinear los anillos arrastrando -----
  document.addEventListener("pointerdown", e => {
    if (e.button !== 0 || terminado) return;
    const g = geo(e);
    if (paso === 0 && g.d < g.R * 1.6) {
      drag = { x: e.clientX, b: bias };
      document.body.classList.add("fx-dragging");
      e.preventDefault(); pista();
    } else if (paso === 1 && g.d < g.R * 0.9) {
      cargando = true; arrancarCarga();
      e.preventDefault(); pista();
    }
  });

  document.addEventListener("pointermove", e => {
    if (terminado) return;
    if (drag) {
      bias = clamp(drag.b + (e.clientX - drag.x) * 0.12, -45, 45);
      FX.ringBias = bias; FX.wake();
      planet.classList.toggle("near", error() <= CONFIG.tolerancia);
      return;
    }
    // El cursor cambia al pasar sobre la parte que se puede usar
    const g = geo(e);
    document.body.classList.toggle("fx-over-grab", paso === 0 && g.d < g.R * 1.6);
    document.body.classList.toggle("fx-over-hold", paso === 1 && g.d < g.R * 0.9);
  }, { passive: true });

  function soltar() {
    cargando = false;
    if (!drag) return;
    drag = null;
    document.body.classList.remove("fx-dragging");
    if (paso === 0 && error() <= CONFIG.tolerancia) {
      bias = CONFIG.objetivoGrados - BASE; FX.ringBias = bias; FX.wake(); // encaja
      planet.classList.remove("near");
      paso = 1; marcar(0); destello(); pista();
    }
  }
  document.addEventListener("pointerup", soltar);
  document.addEventListener("pointercancel", soltar);

  // ----- Paso 2: mantener el clic para cargar el núcleo -----
  function arrancarCarga() { if (!loopOn) { loopOn = true; tPrev = 0; requestAnimationFrame(cargaLoop); } }

  function cargaLoop(ts) {
    const dt = tPrev ? ts - tPrev : 16; tPrev = ts;
    if (paso > 1) { prog = 1; core.style.setProperty("--p", 1); loopOn = false; return; }
    prog = clamp(prog + (cargando ? dt / (CONFIG.segundosCarga * 1000) : -dt / 900), 0, 1);
    core.style.setProperty("--p", prog);
    planet.classList.toggle("charging", cargando && prog < 1);
    if (prog >= 1) { cargando = false; planet.classList.remove("charging"); paso = 2; marcar(1); destello(); iniciarOrbes(); pista(); }
    if (cargando || prog > 0) requestAnimationFrame(cargaLoop); else { loopOn = false; tPrev = 0; }
  }

  // ----- Paso 3: repetir la secuencia de luces -----
  function iniciarOrbes() {
    const orden = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    seq = orden; k = 0;
    orbsBox.classList.add("on");
    setTimeout(reproducir, 1100);
  }

  function reproducir() {
    reproduciendo = true;
    orbs.forEach(o => o.classList.remove("lit"));
    let i = 0;
    (function siguiente() {
      if (i >= seq.length) { reproduciendo = false; return; }
      const o = orbs[seq[i]];
      o.classList.add("flash");
      setTimeout(() => { o.classList.remove("flash"); i++; setTimeout(siguiente, 260); }, 620);
    })();
  }

  orbsBox.addEventListener("click", e => {
    const o = e.target.closest(".fx-orb");
    if (!o || paso !== 2 || reproduciendo || terminado) return;
    pista();
    if (Number(o.dataset.i) === seq[k]) {
      o.classList.add("lit"); k++;
      if (k === seq.length) { terminado = true; marcar(2); hint.classList.remove("on"); setTimeout(sumergirse, 600); }
    } else {
      // Error: las luces tiemblan y la secuencia se vuelve a mostrar
      orbs.forEach(x => x.classList.add("bad"));
      setTimeout(() => orbs.forEach(x => x.classList.remove("bad")), 550);
      k = 0; reproduciendo = true;
      setTimeout(reproducir, 1000);
    }
  });

  // ----- Transición: entrar al planeta -----
  function sumergirse() {
    const r = sphere.getBoundingClientRect();
    const S = r.width, cx = r.left + S / 2, cy = r.top + S / 2;
    const ov = el("div", "fx-dive");
    ov.style.cssText = "left:" + (cx - S / 2) + "px;top:" + (cy - S / 2) + "px;width:" + S + "px;height:" + S + "px;";
    ov.style.setProperty("--k", Math.hypot(innerWidth, innerHeight) * 2.2 / S);
    ov.appendChild(el("div", "fx-dive-fill"));
    document.body.appendChild(ov);
    document.body.classList.add("fx-diving");
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("go")));
    setTimeout(() => ov.classList.add("solid"), 1750);
    setTimeout(() => { location.href = CONFIG.destino; }, 2300);
  }

  // ----- Inicio (con RdelR.html?paso=2 o ?paso=3 se puede saltar a un paso, útil para probar) -----
  const salto = clamp(Number(new URLSearchParams(location.search).get("paso")) - 1 || 0, 0, 2);
  if (salto >= 1) { bias = CONFIG.objetivoGrados - BASE; FX.ringBias = bias; paso = 1; marcar(0); }
  if (salto >= 2) { prog = 1; core.style.setProperty("--p", 1); paso = 2; marcar(1); iniciarOrbes(); }
  FX.wake();
  pista();
})();
