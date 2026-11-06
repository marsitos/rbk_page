// ===== Planeta con anillos (#BA55D3): la luz, la inclinación y el brillo siguen al mouse =====
(function () {
  const capa = document.createElement("div");
  capa.className = "fx-planet-layer";
  capa.setAttribute("aria-hidden", "true");
  capa.innerHTML =
    '<div class="fx-planet"><div class="fx-par">' +
      '<div class="fx-ring fx-ring-back"></div>' +
      '<div class="fx-sphere"></div>' +
      '<div class="fx-ring fx-ring-front"></div>' +
    '</div></div>';
  document.querySelector(".galaxy-bg").appendChild(capa);

  const planet = capa.querySelector(".fx-planet");
  const par = capa.querySelector(".fx-par");
  const sphere = capa.querySelector(".fx-sphere");
  const rings = capa.querySelectorAll(".fx-ring");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const cur = { lx: 34, ly: 30, tx: 0, ty: 0, rx: 74, rz: -18 };

  // El centro del planeta se mide solo al cargar y al cambiar el tamaño de la ventana
  // (antes se medía en cada cuadro, lo que obligaba al navegador a recalcular el diseño todo el tiempo).
  let cx = 0, cy = 0, S = 0;
  function medir() {
    S = planet.offsetWidth;
    cx = planet.offsetLeft + S / 2;
    cy = planet.offsetTop + planet.offsetHeight / 2;
  }
  medir();
  addEventListener("resize", () => { medir(); FX.wake(); });

  FX.tick.push(() => {
    const dx = FX.px - cx, dy = FX.py - (cy - scrollY);
    const nx = FX.px / innerWidth - 0.5, ny = FX.py / innerHeight - 0.5;

    const meta = {
      lx: 50 + clamp(dx / 450, -1, 1) * 38,   // la luz se acerca al cursor
      ly: 50 + clamp(dy / 450, -1, 1) * 38,
      tx: nx * 22, ty: ny * 16,                // el planeta se desplaza un poco
      rx: 74 - ny * 10,                        // los anillos se inclinan
      rz: -18 + nx * (FX.rzWobble ?? 14) + (FX.ringBias || 0)  // el puzzle puede reducir el vaivén y sumar su propio giro
    };
    let mueve = false;
    for (const k in meta) {
      const d = meta[k] - cur[k];
      if (Math.abs(d) > 0.02) mueve = true;
      cur[k] += d * 0.08;
    }
    sphere.style.setProperty("--lx", cur.lx + "%");
    sphere.style.setProperty("--ly", cur.ly + "%");
    const giro = "rotateZ(" + cur.rz + "deg) rotateX(" + cur.rx + "deg)";
    rings[0].style.transform = rings[1].style.transform = giro;
    par.style.transform = "translate(" + cur.tx + "px," + cur.ty + "px)";

    // Al pasar el cursor sobre el planeta, brilla más
    planet.classList.toggle("hot", Math.hypot(dx, dy) < S * 0.9);
    return mueve;
  });
})();