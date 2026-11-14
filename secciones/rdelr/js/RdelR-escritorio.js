// ===== Efectos solo para computador =====
// Carga la Vía Láctea y el planeta únicamente si el dispositivo tiene mouse real,
// pantalla grande y no pidió reducir animaciones. En celular no se descarga nada más.
(function () {
  const params = new URLSearchParams(location.search);
  const esEscritorio =
    matchMedia("(hover: hover) and (pointer: fine)").matches &&
    innerWidth >= 1024 &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;

  // RdelR.html?fx=0 desactiva los efectos (para comparar o probar)
  if (!esEscritorio || params.get("fx") === "0") return;

  const base = document.currentScript.src;
  const ruta = rel => new URL(rel, base).href;

  // Estado compartido del mouse + un solo ciclo de animación que se duerme cuando todo está quieto
  const FX = (window.FX = { px: innerWidth / 2, py: innerHeight / 2, tick: [], running: false });
  function loop() {
    let sigue = false;
    for (const f of FX.tick) if (f()) sigue = true;
    if (sigue) requestAnimationFrame(loop); else FX.running = false;
  }
  FX.wake = () => { if (!FX.running) { FX.running = true; requestAnimationFrame(loop); } };
  addEventListener("pointermove", e => { FX.px = e.clientX; FX.py = e.clientY; FX.moved = true; FX.wake(); }, { passive: true });
  addEventListener("scroll", FX.wake, { passive: true });

  const cargarScript = src => new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = ruta(src); s.onload = ok; s.onerror = fail;
    document.body.appendChild(s);
  });

  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = ruta("../css/RdelR-escritorio.css");
  css.onload = () => {
    document.body.classList.add("fx-desktop");
    const css2 = document.createElement("link");
    css2.rel = "stylesheet";
    css2.href = ruta("../css/RdelR-puzzle.css");
    document.head.appendChild(css2);
    cargarScript("RdelR-viaLactea.js")
      .then(() => cargarScript("RdelR-planeta.js"))
      .then(() => cargarScript("RdelR-viaje.js"))
      .then(() => cargarScript("RdelR-puzzle.js"))
      .then(() => {
        // El título espera a que termine la entrada: se reinicia su animación con retraso
        const h1 = document.querySelector(".galaxy-content h1");
        if (h1) {
          h1.style.animation = "none"; void h1.offsetWidth;
          h1.style.animation = ""; h1.style.animationDelay = "1.9s";
        }
        FX.wake();
      })
      .catch(() => {}); // si algo falla, la página queda como estaba
  };
  document.head.appendChild(css);
})();