// ===== Pantalla que aparece después de decir "Sí" =====
function mostrarRespuesta() {
  const R = RESPUESTA;
  document.getElementById("no").hidden = true; // el "No" ya cumplió su broma
  const fx = (el, d) => { el.classList.add("fx"); el.style.setProperty("--d", d + "s"); };
  let d = 0.5;

  const eyebrow = document.getElementById("dEyebrow");
  const title = document.getElementById("dTitle");
  eyebrow.textContent = R.eyebrow; fx(eyebrow, d);
  title.textContent = R.title; fx(title, d += 0.9);
  fx(document.getElementById("dLine"), d += 0.8);

  // Frases una tras otra
  const lines = document.getElementById("dLines");
  lines.innerHTML = "";
  R.lines.forEach((txt, i) => {
    const p = document.createElement("p");
    p.className = i === 0 ? "big" : "lead";
    p.textContent = txt;
    fx(p, d += 1.8);
    lines.appendChild(p);
  });

  // Fotos como polaroids (las que no existan se omiten)
  const polas = document.getElementById("dPhotos");
  polas.innerHTML = "";
  R.photos.forEach((f, i) => {
    const w = document.createElement("div");
    w.className = "pola";
    w.style.setProperty("--r", (i % 2 ? 1 : -1) * (2 + Math.random() * 3) + "deg");
    const im = new Image();
    im.alt = "";
    im.onerror = () => w.remove();
    im.src = FOTOS_DIR + f;
    w.appendChild(im);
    fx(w, d += 0.7);
    polas.appendChild(w);
  });

  // Carta (opcional) y botón final
  const cartaBtn = document.getElementById("dLetter");
  if (R.letter && R.letter.text) {
    cartaBtn.textContent = R.letter.button || "Leer mi carta";
    cartaBtn.hidden = false;
    fx(cartaBtn, d += 0.8);
    document.getElementById("letterText").textContent = R.letter.text;
  }
  const cta = document.getElementById("dCta");
  cta.textContent = R.cta;
  cta.href = R.ctaHref;
  fx(cta, d += 0.8);

  if (typeof burst === "function") { burst(60); setTimeout(() => burst(40), 3500); }
}

// Carta: abrir y cerrar
(function () {
  const overlay = document.getElementById("letter");
  const open = () => { overlay.hidden = false; };
  const close = () => { overlay.hidden = true; };
  document.getElementById("dLetter").addEventListener("click", open);
  document.getElementById("letterClose").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
})();
