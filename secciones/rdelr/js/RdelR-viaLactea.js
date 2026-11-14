// ===== Vía Láctea: franja de nebulosa + estrellas con profundidad y brillo cerca del mouse =====
(function () {
  const scene = document.createElement("div");
  scene.className = "fx-scene";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = '<div class="fx-mw-glow"></div><canvas class="fx-mw-dim"></canvas>';
  document.getElementById("stars").before(scene); // queda detrás de las estrellas normales

  const glow = scene.querySelector(".fx-mw-glow");
  const dim = scene.querySelector(".fx-mw-dim");

  // Lienzo pequeño que acompaña al cursor
  const R = 230;
  const cursor = document.createElement("canvas");
  cursor.className = "fx-mw-cursor";
  cursor.width = cursor.height = R * 2;
  scene.after(cursor);
  const cctx = cursor.getContext("2d");

  const ANGULO = -25 * Math.PI / 180;
  const COLORES = ["255,255,255", "200,185,255", "255,215,235", "230,170,245"];
  const N = 1700;
  const xs = new Float32Array(N), ys = new Float32Array(N), rs = new Float32Array(N), as = new Float32Array(N);
  const cs = new Uint8Array(N);

  // Las estrellas de la franja se dibujan una sola vez
  function crear() {
    const W = innerWidth + 80, H = innerHeight + 80;
    dim.width = W; dim.height = H;
    const d = dim.getContext("2d");
    const cos = Math.cos(ANGULO), sin = Math.sin(ANGULO);
    const L = Math.hypot(W, H) * 1.05, sigma = Math.min(W, H) * 0.09;
    const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 0.577;

    for (let i = 0; i < N; i++) {
      const t = (Math.random() - 0.5) * L;
      const n = gauss() * sigma * (1 - 0.45 * Math.abs(t) / (L / 2)); // la franja se adelgaza en los extremos
      xs[i] = W / 2 + t * cos - n * sin;
      ys[i] = H / 2 + t * sin + n * cos;
      rs[i] = Math.random() < 0.08 ? 1.1 + Math.random() * 0.7 : 0.35 + Math.random() * 0.6;
      as[i] = 0.25 + Math.random() * 0.45;
      cs[i] = (Math.random() * COLORES.length) | 0;
      d.fillStyle = "rgba(" + COLORES[cs[i]] + "," + as[i] + ")";
      d.beginPath(); d.arc(xs[i], ys[i], rs[i], 0, 6.2832); d.fill();
    }
  }
  crear();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { crear(); FX.wake(); }, 250); });
  document.documentElement.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });

  const t0 = performance.now();
  const pos = { x: 0, y: 0 };

  FX.tick.push(() => {
    const tx = -(FX.px / innerWidth - 0.5) * 44;
    const ty = -(FX.py / innerHeight - 0.5) * 30;
    const dx = tx - pos.x, dy = ty - pos.y;
    pos.x += dx * 0.06; pos.y += dy * 0.06;
    dim.style.transform = "translate(" + pos.x + "px," + pos.y + "px)";
    glow.style.transform = "translate(" + pos.x * 1.3 + "px," + pos.y * 1.3 + "px) rotate(-25deg)";

    // Estrellas que brillan cerca del cursor (solo se recorren las ~1700 y se dibujan las que caen en el círculo)
    const activo = FX.moved && performance.now() - t0 > 3600;
    cursor.style.opacity = activo ? "1" : "0";
    if (activo) {
      cursor.style.transform = "translate(" + (FX.px - R) + "px," + (FX.py - R) + "px)";
      cctx.clearRect(0, 0, R * 2, R * 2);
      const ox = pos.x - 40, oy = pos.y - 40; // dónde está la capa tenue en pantalla
      for (let i = 0; i < N; i++) {
        const ddx = xs[i] + ox - FX.px, ddy = ys[i] + oy - FX.py;
        if (ddx > R || ddx < -R || ddy > R || ddy < -R) continue;
        const dist = Math.hypot(ddx, ddy);
        if (dist >= R) continue;
        const f = 1 - dist / R;
        cctx.fillStyle = "rgba(" + COLORES[cs[i]] + "," + Math.min(1, as[i] * (0.7 + 1.8 * f * f)) + ")";
        cctx.beginPath(); cctx.arc(ddx + R, ddy + R, rs[i] * (1.3 + 0.9 * f), 0, 6.2832); cctx.fill();
      }
    }
    return Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;
  });
})();