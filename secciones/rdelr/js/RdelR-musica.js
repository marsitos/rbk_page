// ===== Música suave de fondo para RdelR =====
// Empieza con el primer toque o tecla (los navegadores no dejan sonar antes), con fundido de entrada.
// Aparece un botón ♪ para silenciarla. Se pausa sola si la pestaña queda oculta.
(function () {
  const CONFIG = {
    archivo: "../../../assets/audios/galaxy.mp3", // misma canción de antes (ruta relativa a la página)
    volumen: 0.17,                   // 0 a 1 (antes sonaba a 0.7)
    fundidoMs: 3000                  // duración del fundido de entrada
  };

  const audio = new Audio(CONFIG.archivo);
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0;

  let sonando = false, fallo = false, boton = null, fundido = null;
  audio.addEventListener("error", () => { fallo = true; if (boton) boton.remove(); });

  function crearBoton() {
    boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = "♪";
    boton.setAttribute("aria-label", "Silenciar o activar la música");
    boton.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:120;width:38px;height:38px;border-radius:50%;" +
      "border:1px solid rgba(255,255,255,.3);background:rgba(11,8,16,.55);color:#fff;font-size:1rem;cursor:pointer;";
    boton.addEventListener("click", e => {
      e.stopPropagation();
      audio.muted = !audio.muted;
      boton.textContent = audio.muted ? "✕" : "♪";
    });
    document.body.appendChild(boton);
  }

  function iniciar() {
    if (sonando || fallo) return;
    audio.play().then(() => {
      sonando = true;
      quitarEscuchas();
      crearBoton();
      const paso = CONFIG.volumen / (CONFIG.fundidoMs / 100);
      fundido = setInterval(() => {
        audio.volume = Math.min(CONFIG.volumen, audio.volume + paso);
        if (audio.volume >= CONFIG.volumen) clearInterval(fundido);
      }, 100);
    }).catch(() => { /* aún sin permiso: se reintenta en la próxima interacción */ });
  }

  const eventos = ["pointerup", "keydown"];
  const quitarEscuchas = () => eventos.forEach(e => document.removeEventListener(e, iniciar));
  eventos.forEach(e => document.addEventListener(e, iniciar));

  document.addEventListener("visibilitychange", () => {
    if (!sonando) return;
    if (document.hidden) audio.pause(); else audio.play().catch(() => {});
  });
})();
