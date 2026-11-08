// ===== Viaje galáctico: transición al entrar en el planeta =====
// El fondo se desenfoca, aparecen estrellas que se estiran y salen disparadas desde el planeta
// (como un salto a velocidad luz), una luz lo inunda todo y se abre la nueva página.
window.FXViaje = (function () {
  const DURACION = 2.7;              // segundos hasta que se abre la página
  const COLORES = ["255,255,255", "255,255,255", "200,185,255", "233,176,242", "186,85,211"];

  function iniciar(cx, cy, alTerminar) {
    const W = innerWidth, H = innerHeight;
    const maxR = Math.hypot(W, H);

    // Capa que desenfoca el fondo, el lienzo del viaje y el destello final
    const blur = Object.assign(document.createElement("div"), { className: "fx-warp-blur" });
    const cv = Object.assign(document.createElement("canvas"), { className: "fx-warp", width: W, height: H });
    const flash = Object.assign(document.createElement("div"), { className: "fx-warp-flash" });
    document.body.append(blur, cv, flash);
    const ctx = cv.getContext("2d");
    requestAnimationFrame(() => requestAnimationFrame(() => blur.classList.add("on")));

    // Estrellas del túnel
    const N = 320;
    const nueva = (lejos) => ({
      a: Math.random() * 6.2832,
      r: lejos ? Math.random() * maxR * 0.5 : 4 + Math.random() * 30,
      s: 0.5 + Math.random() * 0.9,                       // velocidad propia
      w: 0.6 + Math.random() * 1.3,                       // grosor
      c: COLORES[(Math.random() * COLORES.length) | 0]
    });
    const stars = Array.from({ length: N }, () => nueva(true));

    const t0 = performance.now();
    let prev = t0, terminado = false;

    function cuadro(now) {
      const t = (now - t0) / 1000;
      const dt = Math.min((now - prev) / 1000, 0.05); prev = now;
      const k = Math.min(t / (DURACION - 0.6), 1);
      const aceleracion = 0.15 + 7 * k * k * k;           // empieza lento y se dispara
      // El centro del viaje pasa del planeta al centro de la pantalla
      const e = Math.min(t / 1.4, 1), ease = e * e * (3 - 2 * e);
      const ox = cx + (W / 2 - cx) * ease, oy = cy + (H / 2 - cy) * ease;

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      for (const s of stars) {
        const rPrev = s.r;
        s.r += (s.r * 1.6 + 30) * aceleracion * s.s * dt;
        if (s.r > maxR) { Object.assign(s, nueva(false)); continue; }
        const estela = Math.min(s.r - rPrev + s.r * 0.05 * aceleracion, s.r);
        const alfa = Math.min(1, s.r / 90) * (0.35 + 0.65 * Math.min(1, k * 2));
        const cos = Math.cos(s.a), sin = Math.sin(s.a);
        ctx.strokeStyle = "rgba(" + s.c + "," + alfa + ")";
        ctx.lineWidth = s.w * (0.6 + s.r / maxR * 1.6);
        ctx.beginPath();
        ctx.moveTo(ox + cos * (s.r - estela), oy + sin * (s.r - estela));
        ctx.lineTo(ox + cos * s.r, oy + sin * s.r);
        ctx.stroke();
      }

      // Resplandor del núcleo que crece hasta inundar la pantalla
      const g = Math.max(0, (t - 1.3) / (DURACION - 1.3));
      const radio = 60 + g * g * maxR * 1.1;
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radio);
      grad.addColorStop(0, "rgba(255,240,255," + Math.min(1, 0.25 + g * 1.2) + ")");
      grad.addColorStop(0.35, "rgba(233,176,242," + Math.min(0.9, 0.12 + g) + ")");
      grad.addColorStop(1, "rgba(186,85,211,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (t > DURACION - 0.55) flash.classList.add("on"); // se funde con el color de la nueva página
      if (t >= DURACION) {
        if (!terminado) { terminado = true; if (alTerminar) alTerminar(); }
        return;
      }
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
  }

  return { iniciar };
})();
