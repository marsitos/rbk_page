/**
 * Cielo del telescopio: genera y dibuja lo que se ve por el visor.
 * Todo se mide en "unidades": 1 unidad = el diámetro del lente. Así el cielo se siente igual
 * de grande en celular y en computador. No toca el DOM (solo dibuja en el canvas que recibe).
 */
window.Cielo = (() => {
  "use strict";

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const MARGEN = 0.5; // el lente mide 1 unidad: la cámara nunca se sale del cielo

  // Generador con semilla: el cielo es el mismo cada vez que se abre el telescopio.
  function semilla(n) {
    return () => {
      n = (n + 0x6D2B79F5) | 0;
      let t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ===== AJUSTES DEL CIELO (posiciones en unidades; edítalos con confianza) =====
  const AJUSTES = {
    mundo: { w: 3.4, h: 2.8 },
    inicio: { x: 1.7, y: 1.4 },
    // Dónde están las luces especiales (las que se pueden tocar). Si hay más párrafos que
    // posiciones, el resto se genera solo. Mantenlas a ~1 unidad una de otra.
    especiales: [[2.3, 1.85], [0.9, 1.0], [2.6, 0.7], [0.7, 2.2], [1.5, 0.5]],
    constelacion: { x: 1.55, y: 2.3, ancho: 0.8 },
    nebulosas: [
      { x: 1.2, y: 0.95, r: 0.55, c: "186,85,211", a: 0.2 },
      { x: 2.3, y: 1.15, r: 0.5, c: "233,120,170", a: 0.15 },
      { x: 0.95, y: 1.95, r: 0.6, c: "90,110,255", a: 0.17 },
      { x: 2.55, y: 2.3, r: 0.45, c: "245,158,11", a: 0.11 }
    ],
    planeta: { x: 1.3, y: 1.45, r: 0.07 },
    galaxia: { x: 2.85, y: 1.6, r: 0.2 }
  };

  // La constelación de Virgo (la misma del dibujo original, en sus coordenadas 900×500)
  const VIRGO = {
    centro: [508, 280], ancho: 657,
    lineas: [[747,60,810,60],[810,60,837,175],[837,175,747,225],[747,225,657,275],[657,275,567,225],
             [567,225,450,300],[450,300,333,275],[333,275,180,300],[567,225,486,150],[657,275,567,350],
             [450,300,540,450],[567,350,540,450],[540,450,360,500],[360,500,315,425],[315,425,207,440]],
    principales: [[747,60],[747,225],[567,350],[360,500],[207,440]],
    decorativas: [[810,60],[837,175],[657,275],[567,225],[486,150],[450,300],[540,450],[315,425],[333,275],[180,300]]
  };

  const PALETA = ["255,255,255", "255,255,255", "255,255,255", "200,185,255", "255,226,200", "233,176,242"];

  function crear(canvas, opciones) {
    const total = (opciones && opciones.total) || AJUSTES.especiales.length;
    const rnd = semilla(7);
    const ctx = canvas.getContext("2d");
    const cam = { x: AJUSTES.inicio.x, y: AJUSTES.inicio.y };
    let D = 320, dpr = 1;

    // ----- Luces especiales -----
    const posiciones = AJUSTES.especiales.slice(0, total);
    for (let intento = 0; posiciones.length < total && intento < 400; intento++) {
      const x = 0.7 + rnd() * (AJUSTES.mundo.w - 1.4), y = 0.6 + rnd() * (AJUSTES.mundo.h - 1.2);
      if (posiciones.every(p => Math.hypot(p[0] - x, p[1] - y) > 0.95)) posiciones.push([x, y]);
    }
    const especiales = posiciones.map(([x, y]) => ({ x, y, found: false, ph: rnd() * TAU }));

    // ----- Estrellas de fondo, en 3 capas con distinta profundidad -----
    const capas = [
      { f: 0.5, n: 230, r: [0.35, 0.9], a: [0.25, 0.6] },
      { f: 0.8, n: 170, r: [0.45, 1.2], a: [0.35, 0.8] },
      { f: 1.0, n: 150, r: [0.55, 1.7], a: [0.45, 1.0] }
    ].map(capa => {
      const x0 = MARGEN * capa.f - 0.6, x1 = (AJUSTES.mundo.w - MARGEN) * capa.f + 0.6;
      const y0 = MARGEN * capa.f - 0.6, y1 = (AJUSTES.mundo.h - MARGEN) * capa.f + 0.6;
      const estrellas = Array.from({ length: capa.n }, () => ({
        x: x0 + rnd() * (x1 - x0), y: y0 + rnd() * (y1 - y0),
        r: capa.r[0] + rnd() * (capa.r[1] - capa.r[0]),
        a: capa.a[0] + rnd() * (capa.a[1] - capa.a[0]),
        c: PALETA[(rnd() * PALETA.length) | 0], v: 0.6 + rnd() * 1.8, ph: rnd() * TAU
      }));
      return { f: capa.f, estrellas };
    });

    // ----- Utilidades -----
    const aPantalla = (wx, wy, f = 1) => [(wx - cam.x * f) * D + D / 2, (wy - cam.y * f) * D + D / 2];
    const alcanceDe = s => s.found ? 0 : suave(0.55, 0.22, Math.hypot(s.x - cam.x, s.y - cam.y));

    // ----- Dibujo -----
    function dibujarEstrellas(capa, t, sc) {
      for (const s of capa.estrellas) {
        const [sx, sy] = aPantalla(s.x, s.y, capa.f);
        if (sx < -4 || sy < -4 || sx > D + 4 || sy > D + 4) continue;
        const a = s.a * (0.72 + 0.28 * Math.sin(t * s.v + s.ph));
        ctx.fillStyle = `rgba(${s.c},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(sx, sy, s.r * sc, 0, TAU); ctx.fill();
        if (s.r > 1.35) {
          ctx.fillStyle = `rgba(${s.c},${(a * 0.12).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(sx, sy, s.r * sc * 3.2, 0, TAU); ctx.fill();
        }
      }
    }

    function dibujarNebulosas() {
      for (const n of AJUSTES.nebulosas) {
        const [sx, sy] = aPantalla(n.x, n.y), r = n.r * D;
        if (sx + r < 0 || sy + r < 0 || sx - r > D || sy - r > D) continue;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, `rgba(${n.c},${n.a})`); g.addColorStop(1, `rgba(${n.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
    }

    function dibujarGalaxia() {
      const G = AJUSTES.galaxia, [sx, sy] = aPantalla(G.x, G.y), r = G.r * D;
      if (sx + r < 0 || sy + r < 0 || sx - r > D || sy - r > D) return;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(0.6); ctx.scale(1, 0.38);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, "rgba(255,240,255,.85)"); g.addColorStop(0.18, "rgba(233,176,242,.45)");
      g.addColorStop(0.6, "rgba(120,90,220,.18)"); g.addColorStop(1, "rgba(90,70,200,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.restore();
    }

    function dibujarPlaneta() {
      const P = AJUSTES.planeta, [sx, sy] = aPantalla(P.x, P.y), r = P.r * D;
      if (sx + r * 3 < 0 || sy + r * 3 < 0 || sx - r * 3 > D || sy - r * 3 > D) return;
      ctx.save(); ctx.translate(sx, sy);
      const anillo = mitad => {
        ctx.save(); ctx.rotate(-0.35); ctx.scale(1, 0.32);
        ctx.strokeStyle = "rgba(233,176,242,.6)"; ctx.lineWidth = r * 0.34;
        ctx.beginPath(); ctx.arc(0, 0, r * 2, mitad ? 0 : Math.PI, mitad ? Math.PI : TAU); ctx.stroke();
        ctx.restore();
      };
      anillo(false);
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
      g.addColorStop(0, "#E9B0F2"); g.addColorStop(0.55, "#8a3da0"); g.addColorStop(1, "#2B0F36");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      anillo(true);
      ctx.restore();
    }

    function dibujarConstelacion(sc) {
      const C = AJUSTES.constelacion, [ox, oy] = aPantalla(C.x, C.y);
      if (Math.abs(ox - D / 2) > D * 1.3 || Math.abs(oy - D / 2) > D * 1.3) return;
      const k = C.ancho * D / VIRGO.ancho;
      const P = (x, y) => [ox + (x - VIRGO.centro[0]) * k, oy + (y - VIRGO.centro[1]) * k];
      ctx.strokeStyle = "rgba(255,255,255,.34)"; ctx.lineWidth = Math.max(1, sc);
      ctx.beginPath();
      for (const [x1, y1, x2, y2] of VIRGO.lineas) {
        const a = P(x1, y1), b = P(x2, y2); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.75)";
      for (const [x, y] of VIRGO.decorativas) { const p = P(x, y); ctx.beginPath(); ctx.arc(p[0], p[1], 1.6 * sc, 0, TAU); ctx.fill(); }
      for (const [x, y] of VIRGO.principales) {
        const p = P(x, y);
        ctx.fillStyle = "rgba(255,255,255,.10)"; ctx.beginPath(); ctx.arc(p[0], p[1], 4.5 * sc, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(p[0], p[1], 2 * sc, 0, TAU); ctx.fill();
      }
    }

    function dibujarEspecial(s, t, sc) {
      const [sx, sy] = aPantalla(s.x, s.y);
      if (sx < -60 || sy < -60 || sx > D + 60 || sy > D + 60) return;
      if (s.found) { // ya visitada: queda encendida, tranquila y dorada
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16 * sc);
        g.addColorStop(0, "rgba(252,211,77,.55)"); g.addColorStop(1, "rgba(252,211,77,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 16 * sc, 0, TAU); ctx.fill();
        ctx.fillStyle = "rgba(255,244,214,.95)"; ctx.beginPath(); ctx.arc(sx, sy, 2.4 * sc, 0, TAU); ctx.fill();
        return;
      }
      const al = alcanceDe(s), pulso = 0.85 + 0.15 * Math.sin(t * 2.4 + s.ph);
      if (al > 0.01) {
        const R = (6 + al * 36 * pulso) * sc;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
        g.addColorStop(0, `rgba(255,246,255,${(0.75 * al).toFixed(3)})`);
        g.addColorStop(0.35, `rgba(233,176,242,${(0.42 * al).toFixed(3)})`);
        g.addColorStop(1, "rgba(186,85,211,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.beginPath(); ctx.arc(sx, sy, (1.4 + al * 2.8) * sc, 0, TAU); ctx.fill();
      if (al > 0.35) { // destello de cuatro puntas
        const L = (8 + al * 26) * sc * pulso;
        ctx.strokeStyle = `rgba(255,240,255,${(al * 0.8).toFixed(3)})`; ctx.lineWidth = Math.max(1, sc * 0.9);
        ctx.beginPath(); ctx.moveTo(sx - L, sy); ctx.lineTo(sx + L, sy); ctx.moveTo(sx, sy - L); ctx.lineTo(sx, sy + L); ctx.stroke();
      }
    }

    function dibujar(t) {
      const sc = clamp(D / 340, 0.85, 1.7);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fondo = ctx.createRadialGradient(D / 2, D / 2, 0, D / 2, D / 2, D * 0.72);
      fondo.addColorStop(0, "#0b1033"); fondo.addColorStop(1, "#02030a");
      ctx.fillStyle = fondo; ctx.fillRect(0, 0, D, D);
      dibujarNebulosas();
      dibujarEstrellas(capas[0], t, sc); dibujarEstrellas(capas[1], t, sc);
      dibujarGalaxia(); dibujarPlaneta();
      dibujarEstrellas(capas[2], t, sc);
      dibujarConstelacion(sc);
      for (const s of especiales) dibujarEspecial(s, t, sc);
    }

    // ----- Interfaz para el visor -----
    return {
      ajustar(lado) {
        D = lado; dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = canvas.height = Math.round(D * dpr);
      },
      mover(dx, dy) {
        cam.x = clamp(cam.x + dx, MARGEN, AJUSTES.mundo.w - MARGEN);
        cam.y = clamp(cam.y + dy, MARGEN, AJUSTES.mundo.h - MARGEN);
      },
      dibujar,
      encontrar(i) { if (especiales[i]) especiales[i].found = true; },
      // Posición de una luz en el lente (px locales)
      posicion(i) { const [x, y] = aPantalla(especiales[i].x, especiales[i].y); return { x, y }; },
      // Índice de la luz que está bajo (px,py) del lente, o -1. Solo se pueden tocar las ya reveladas.
      estrellaEn(px, py) {
        let mejor = -1, dMin = Math.max(30, D * 0.1);
        especiales.forEach((s, i) => {
          if (s.found || alcanceDe(s) < 0.3) return;
          const [sx, sy] = aPantalla(s.x, s.y), d = Math.hypot(sx - px, sy - py);
          if (d <= dMin) { dMin = d; mejor = i; }
        });
        return mejor;
      },
      // La luz sin encontrar más cercana al centro del lente (para la indicación)
      masCercana() {
        let mejor = null;
        especiales.forEach((s, i) => {
          if (s.found) return;
          const dx = s.x - cam.x, dy = s.y - cam.y, d = Math.hypot(dx, dy);
          if (!mejor || d < mejor.d) mejor = { i, dx, dy, d, alcance: alcanceDe(s) };
        });
        return mejor;
      },
      estado() {
        return { cam: { x: cam.x, y: cam.y }, D, estrellas: especiales.map(e => ({ x: e.x, y: e.y, encontrada: e.found })) };
      }
    };
  }

  return Object.freeze({ crear });
})();
