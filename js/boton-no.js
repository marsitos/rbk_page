// ===== Botón "No" que se escapa =====
// Cada vez que se intenta tocar, salta a otro lugar de la pantalla (lejos del puntero y del "Sí").
(function () {
  const no = document.getElementById("no");
  const yes = document.getElementById("yes");
  const msg = document.getElementById("noMsg");
  let fleeing = false, spacer = null, tries = 0, lastMove = 0;

  function dodge(e) {
    const now = Date.now();
    if (now - lastMove < 180) return; // evita contar dos veces el mismo intento
    lastMove = now;

    // Primera vez: el botón pasa a posición fija, dejando un hueco para que el "Sí" no se mueva
    if (!fleeing) {
      const r = no.getBoundingClientRect();
      spacer = document.createElement("span");
      spacer.style.cssText = "display:inline-block;width:" + r.width + "px;height:" + r.height + "px";
      no.parentNode.insertBefore(spacer, no);
      no.style.left = r.left + "px";
      no.style.top = r.top + "px";
      document.body.appendChild(no); // fuera de contenedores con animación, para que "fixed" funcione bien
      no.classList.add("fleeing");
      void no.offsetWidth; // fuerza el reflujo para que la animación parta del lugar original
      fleeing = true;
    }

    const bw = no.offsetWidth, bh = no.offsetHeight, m = 12;
    const yr = yes.getBoundingClientRect();
    const px = e && e.clientX != null ? e.clientX : -9999;
    const py = e && e.clientY != null ? e.clientY : -9999;
    let best = null;
    for (let k = 0; k < 50; k++) {
      const x = m + Math.random() * (innerWidth - bw - 2 * m);
      const y = m + Math.random() * (innerHeight - bh - 2 * m);
      const lejosPuntero = Math.hypot(x + bw / 2 - px, y + bh / 2 - py) > 140;
      const libreDelSi = x > yr.right + 24 || x + bw < yr.left - 24 || y > yr.bottom + 24 || y + bh < yr.top - 24;
      const libreDeMute = !(x + bw > innerWidth - 70 && y + bh > innerHeight - 70);
      if (lejosPuntero && libreDelSi && libreDeMute) { best = { x, y }; break; }
      if (!best) best = { x, y };
    }
    no.style.left = best.x + "px";
    no.style.top = best.y + "px";

    // Mensaje y el "Sí" crece un poquito en cada intento
    msg.textContent = NO_MENSAJES[Math.min(tries, NO_MENSAJES.length - 1)];
    tries++;
    yes.style.setProperty("--grow", Math.min(1.5, 1 + tries * 0.06));
  }

  // Todas las formas de intentar tocarlo: mouse, dedo, teclado
  no.addEventListener("pointerenter", dodge);
  no.addEventListener("pointerdown", e => { e.preventDefault(); dodge(e); });
  no.addEventListener("touchstart", e => { e.preventDefault(); dodge(e.touches[0]); }, { passive: false });
  no.addEventListener("focus", () => { dodge(); no.blur(); });
  no.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); dodge(e); });

  // Si cambia el tamaño de la ventana, que no quede fuera de pantalla
  window.addEventListener("resize", () => { if (fleeing) dodge(); });
})();
