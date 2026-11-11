/**
 * Descenso: al hacer scroll, la galaxia queda atrás y se "cae" hasta un campo de pasto,
 * de noche, con un telescopio. Todo se controla con el progreso del scroll (0 a 1).
 * Al tocar el telescopio se acerca el ocular y se abre el visor (RdelR-telescopio.js).
 */
(() => {
  "use strict";

  const CONFIG = {
    inicioVh: 0.9,        // el descenso empieza cuando el título ya subió un 10 % de la pantalla
    estrellas: 260,
    caida: 1.7,           // pantallas que suben las estrellas más cercanas durante todo el descenso
    estela: 1.1,          // largo de la estela de las estrellas según la velocidad del scroll
    estelaMax: 90,        // px
    luciernagas: 14,
    demoraZoom: 750       // ms del acercamiento al ocular antes de abrir el visor
  };

  const $ = id => document.getElementById(id);
  const section = $("descent"), stage = $("descentStage"), canvas = $("dsStars");
  const btn = $("dsTelescope"), eye = $("dsEyepiece"), cue = $("dsCue"), scrollCue = $("scrollCue");
  if (!section || !stage || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const salidaCubica = t => 1 - Math.pow(1 - t, 3);

  // ----- Textos (vienen de RdelR-data.js) -----
  if (typeof TELESCOPIO !== "undefined") {
    if (scrollCue) scrollCue.textContent = TELESCOPIO.pistaScroll;
    if (cue) cue.textContent = TELESCOPIO.pistaTelescopio;
  }

  // ----- Terreno: tres lomas y briznas de pasto en la más cercana -----
  const cresta = (x, base, amp, f1, f2, fase) =>
    base + amp * Math.sin(x * f1 + fase) + amp * 0.5 * Math.sin(x * f2 + fase * 2);

  function loma(base, amp, f1, f2, fase) {
    let d = "M0,300 L0," + cresta(0, base, amp, f1, f2, fase).toFixed(1);
    for (let x = 10; x <= 1000; x += 10) d += " L" + x + "," + cresta(x, base, amp, f1, f2, fase).toFixed(1);
    return d + " L1000,300 Z";
  }

  function pasto(base, amp, f1, f2, fase) {
    let d = "";
    for (let x = 0; x <= 1000; x += 5) {
      const y = cresta(x, base, amp, f1, f2, fase), alto = 7 + Math.random() * 16, ladeo = (Math.random() - 0.5) * 8;
      d += `M${x},${(y + 3).toFixed(1)} L${(x + ladeo).toFixed(1)},${(y - alto).toFixed(1)} L${x + 3.5},${(y + 3).toFixed(1)} Z `;
    }
    return d;
  }

  function construirTerreno() {
    const set = (id, d) => { const el = $(id); if (el) el.setAttribute("d", d); };
    set("hillFar", loma(110, 22, 0.006, 0.013, 0.4));
    set("hillMid", loma(130, 20, 0.008, 0.017, 2.1));
    set("hillNear", loma(150, 16, 0.010, 0.021, 4.3));
    set("hillBlades", pasto(150, 16, 0.010, 0.021, 4.3));
  }

  function construirLuciernagas() {
    const box = $("dsFireflies");
    if (!box) return;
    for (let i = 0; i < CONFIG.luciernagas; i++) {
      const f = document.createElement("span");
      f.className = "ff";
      f.style.left = Math.random() * 100 + "%";
      f.style.top = 20 + Math.random() * 75 + "%";
      f.style.setProperty("--t", 7 + Math.random() * 6 + "s");
      f.style.setProperty("--b", 2.5 + Math.random() * 3 + "s");
      f.style.setProperty("--dl", -Math.random() * 8 + "s");
      f.style.setProperty("--dx", (Math.random() - 0.5) * 70 + "px");
      f.style.setProperty("--dy", (Math.random() - 0.5) * 50 + "px");
      box.appendChild(f);
    }
  }

  // ----- Estrellas que caen (canvas propio, solo se dibuja cuando hay movimiento) -----
  const COLORES = ["#ffffff", "#ffffff", "#c8b9ff", "#e9b0f2", "#ffe2c8"];
  const estrellas = Array.from({ length: CONFIG.estrellas }, () => ({
    x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.3,
    d: 0.12 + Math.random() * 0.88, a: 0.35 + Math.random() * 0.65,
    c: COLORES[(Math.random() * COLORES.length) | 0]
  }));
  let W = 0, H = 0;

  function dimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dibujar(caida, velocidad) {
    ctx.clearRect(0, 0, W, H);
    for (const s of estrellas) {
      const x = s.x * W, y = (((s.y - caida * s.d) % 1) + 1) % 1 * H;
      const largo = reducir ? 0 : Math.min(velocidad * s.d * CONFIG.estela, CONFIG.estelaMax);
      ctx.globalAlpha = s.a;
      if (largo > 2) {
        ctx.strokeStyle = s.c; ctx.lineWidth = s.r;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + largo); ctx.stroke();
      } else {
        ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ----- Progreso del scroll -----
  let ini = 0, fin = 1, pendiente = false, caidaPrev = 0, velocidad = 0, listoAntes = false;

  function medir() {
    const top = section.getBoundingClientRect().top + window.scrollY;
    ini = top - innerHeight * CONFIG.inicioVh;
    fin = top + section.offsetHeight - innerHeight;
  }

  function actualizar() {
    pendiente = false;
    const p = clamp((window.scrollY - ini) / Math.max(fin - ini, 1), 0, 1);

    stage.style.setProperty("--sky", suave(0, 0.28, p).toFixed(3));      // la noche tapa la galaxia
    stage.style.setProperty("--ground", suave(0.38, 0.96, p).toFixed(3)); // el suelo sube
    stage.style.setProperty("--tel", suave(0.6, 1, p).toFixed(3));        // aparece el telescopio
    stage.classList.toggle("on", p > 0.002);

    const listo = p > 0.985;
    if (listo !== listoAntes) {
      listoAntes = listo;
      stage.classList.toggle("ready", listo);
      btn.disabled = !listo;
    }

    const caida = salidaCubica(p) * CONFIG.caida;
    velocidad = Math.max(Math.abs(caida - caidaPrev) * H, velocidad * 0.85);
    caidaPrev = caida;
    if (p > 0.002) dibujar(caida, velocidad);
    if (velocidad > 0.4) pedir(); else velocidad = 0;
  }

  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }

  // ----- Tocar el telescopio: se acerca el ocular y se abre el visor -----
  btn.addEventListener("click", () => {
    if (!stage.classList.contains("ready") || stage.classList.contains("zooming")) return;
    const r = (eye || btn).getBoundingClientRect();
    stage.style.setProperty("--zx", r.left + r.width / 2 + "px");
    stage.style.setProperty("--zy", r.top + r.height / 2 + "px");
    stage.classList.add("zooming");
    setTimeout(() => { if (window.Telescopio) Telescopio.abrir(); }, reducir ? 0 : CONFIG.demoraZoom);
  });

  document.addEventListener("telescopio:cerrado", () => stage.classList.remove("zooming"));

  // ----- Inicio -----
  construirTerreno();
  construirLuciernagas();
  dimensionar(); medir(); pedir();
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", () => { dimensionar(); medir(); pedir(); });
  window.addEventListener("load", () => { medir(); pedir(); });
})();
