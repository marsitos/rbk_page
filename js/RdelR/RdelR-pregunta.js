// ===== Última estrella: la pregunta, el "No" que se escapa y el registro del "Sí" =====
(function () {
  const modal = document.querySelector(".text-modal");
  const modalText = document.getElementById("star-text");
  const closeBtn = document.getElementById("closeText");
  const question = document.getElementById("question");
  const answer = document.getElementById("answer");
  const yes = document.getElementById("yes");
  const no = document.getElementById("no");
  const msg = document.getElementById("noMsg");
  const KEY = RESPUESTA.clave; // solo se usa si momento-si.js no está cargado
  const ms = () => window.MomentoSi; // se consulta al usarlo (no al cargar), así no importa el orden de los scripts

  // Borra el "sí" guardado en este dispositivo
  function olvidar() {
    if (ms() && ms().clear) ms().clear();
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  // Modo prueba (RESPUESTA.modoPrueba en RdelR-data.js) o abrir RdelR.html?reset
  if (RESPUESTA.modoPrueba || new URLSearchParams(location.search).has("reset")) olvidar();

  document.getElementById("qIcon").textContent = PREGUNTA.icono;
  document.getElementById("qIntro").textContent = PREGUNTA.intro;
  document.getElementById("qTitle").textContent = PREGUNTA.titulo;

  function guardado() {
    if (ms()) { const d = ms().load(); return d ? d.getTime() : null; }
    try { return Number(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
  }

  // La llama la quinta estrella
  window.abrirPregunta = function () {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    modalText.hidden = true;
    closeBtn.hidden = true; // no hay cómo cerrarla sin responder
    const ts = guardado();
    if (ts) mostrarRespuesta(ts); else question.hidden = false;
  };

  // ----- "Sí": registra la hora exacta y abre la interfaz final -----
  const formato = new Intl.DateTimeFormat("es-EC", { dateStyle: "full", timeStyle: "medium" });

  function mostrarRespuesta(ts) {
    question.hidden = true;
    no.hidden = true;
    document.getElementById("aEyebrow").textContent = RESPUESTA.eyebrow;
    document.getElementById("aTitle").textContent = RESPUESTA.titulo;
    document.getElementById("aTime").textContent = RESPUESTA.etiquetaHora + " " + formato.format(new Date(ts));
    document.getElementById("aWords").textContent = RESPUESTA.palabras;
    const cta = document.getElementById("aCta");
    cta.textContent = RESPUESTA.cta;
    cta.href = RESPUESTA.ctaHref + "?sf=" + ts; // NuestraFecha arranca el contador desde este instante
    answer.hidden = false;
  }

  function lluvia() {
    for (let i = 0; i < 32; i++) {
      const s = document.createElement("span");
      s.className = "rain-i";
      s.textContent = RESPUESTA.emojis[i % RESPUESTA.emojis.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = (16 + Math.random() * 22) + "px";
      s.style.setProperty("--t", (3 + Math.random() * 3) + "s");
      s.style.animationDelay = Math.random() * 1.5 + "s";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 8000);
    }
  }

  yes.addEventListener("click", () => {
    const ts = Date.now();
    if (ms()) ms().save(new Date(ts));
    else { try { localStorage.setItem(KEY, String(ts)); } catch (e) {} }
    mostrarRespuesta(ts);
    lluvia();
  });

  // ----- "No": salta a otro lugar cada vez que intenta tocarlo -----
  let fleeing = false, tries = 0, lastMove = 0;

  function dodge(e) {
    const now = Date.now();
    if (now - lastMove < 180) return; // no cuenta dos veces el mismo intento
    lastMove = now;

    if (!fleeing) {
      const r = no.getBoundingClientRect();
      const spacer = document.createElement("span"); // hueco para que el "Sí" no se mueva
      spacer.style.cssText = "display:inline-block;width:" + r.width + "px;height:" + r.height + "px";
      no.parentNode.insertBefore(spacer, no);
      no.style.left = r.left + "px";
      no.style.top = r.top + "px";
      document.body.appendChild(no); // fuera del modal (que tiene filtros) para que "fixed" funcione bien
      no.classList.add("fleeing");
      void no.offsetWidth;
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
      if (lejosPuntero && libreDelSi) { best = { x, y }; break; }
      if (!best) best = { x, y };
    }
    no.style.left = best.x + "px";
    no.style.top = best.y + "px";

    msg.textContent = PREGUNTA.noMensajes[Math.min(tries, PREGUNTA.noMensajes.length - 1)];
    tries++;
    yes.style.setProperty("--grow", Math.min(1.5, 1 + tries * 0.06)); // el "Sí" crece un poquito
  }

  no.addEventListener("pointerenter", dodge);
  no.addEventListener("pointerdown", e => { e.preventDefault(); dodge(e); });
  no.addEventListener("touchstart", e => { e.preventDefault(); dodge(e.touches[0]); }, { passive: false });
  no.addEventListener("focus", () => { dodge(); no.blur(); });
  no.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); dodge(e); });
  window.addEventListener("resize", () => { if (fleeing && !no.hidden) dodge(); });
})();