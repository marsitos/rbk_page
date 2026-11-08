// ===== Interior: estrellas, mariposas y girasoles que abren recuerdos =====
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const movil = innerWidth < 600;
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ----- Estrellas (pocas y livianas) -----
  const cielo = $("cielo");
  for (let i = 0; i < (movil ? 30 : 60); i++) {
    const s = document.createElement("i"), t = rnd(2, 6), tam = rnd(1, 3.2);
    s.style.cssText = "left:" + rnd(0, 100) + "%;top:" + rnd(0, 72) + "%;width:" + tam + "px;height:" + tam + "px";
    s.style.setProperty("--t", t + "s");
    s.style.setProperty("--dl", -rnd(0, t) + "s");
    s.style.setProperty("--p", rnd(0.3, 0.9).toFixed(2));
    cielo.appendChild(s);
  }

  // ----- Mariposas -----
  const ALAS = '<svg viewBox="0 0 40 30" aria-hidden="true"><path class="ala-i" d="M20 15C14 2 2 3 4 14c1 7 10 8 16 1z"/><path class="ala-d" d="M20 15C26 2 38 3 36 14c-1 7-10 8-16 1z"/></svg>';
  const COLORES = ["#E9B0F2", "#FCD34D", "#BA55D3", "#C4B5FD"];
  const cajaMar = $("mariposas");
  for (let i = 0; i < (movil ? 3 : 5); i++) {
    const m = document.createElement("div");
    m.className = "mariposa";
    m.innerHTML = ALAS;
    m.style.setProperty("--x", rnd(8, 88) + "%");
    m.style.setProperty("--y", rnd(38, 78) + "%");
    m.style.setProperty("--t", rnd(9, 16) + "s");
    m.style.setProperty("--dl", -rnd(0, 12) + "s");
    m.style.setProperty("--c", COLORES[i % COLORES.length]);
    cajaMar.appendChild(m);
  }

  // ----- Girasol: se dibuja una vez y se reutiliza (SVG) -----
  let petalos = "";
  for (let k = 0; k < 14; k++) petalos += '<ellipse cx="50" cy="20" rx="8.5" ry="19" fill="#F59E0B" transform="rotate(' + (k * 360 / 14) + ' 50 50)"/>';
  for (let k = 0; k < 14; k++) petalos += '<ellipse cx="50" cy="23" rx="8" ry="16" fill="#FCD34D" transform="rotate(' + (k * 360 / 14 + 12.8) + ' 50 50)"/>';
  document.body.insertAdjacentHTML("afterbegin",
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="girasol" viewBox="0 0 100 230">' +
    '<path d="M50 98C48 140 53 180 50 230" stroke="#3f7d3a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 160C28 150 20 165 18 178C34 182 46 174 50 160z" fill="#4f9a47"/>' +
    '<path d="M51 185C72 172 82 186 84 198C68 202 54 196 51 185z" fill="#4f9a47"/>' +
    petalos +
    '<circle cx="50" cy="50" r="17" fill="#5b3a1e"/><circle cx="50" cy="50" r="11" fill="#3f2814"/>' +
    '<circle cx="45" cy="45" r="2" fill="#7a5230"/><circle cx="55" cy="47" r="2" fill="#7a5230"/><circle cx="50" cy="56" r="2" fill="#7a5230"/>' +
    '</symbol></svg>');

  // ----- Campo de girasoles (uno por recuerdo) -----
  const campo = $("campo");
  const ESCALAS = [1, 0.82, 1.12, 0.9, 1.05, 0.86, 1];   // alturas distintas para que no se vea uniforme
  const BAJOS   = [0, 1.5, 0, 2.2, 0.6, 1.8, 0.3];        // profundidad (% desde abajo)
  const n = RECUERDOS.length;
  const visitados = new Set();

  RECUERDOS.forEach((r, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "giras";
    b.setAttribute("aria-label", "Recuerdo: " + r.titulo);
    b.style.setProperty("--x", (7 + (i + 0.5) / n * 86) + "%");
    b.style.setProperty("--s", ESCALAS[i % ESCALAS.length]);
    b.style.setProperty("--b", BAJOS[i % BAJOS.length] + "vh");
    b.style.setProperty("--dl", -i * 0.9 + "s");
    b.innerHTML = '<svg viewBox="0 0 100 230" aria-hidden="true"><use href="#girasol"/></svg>';
    b.addEventListener("click", () => abrir(i, b));
    campo.appendChild(b);
  });

  // ----- Textos de la cabecera -----
  $("instruccion").textContent = INSTRUCCION;
  const progreso = $("progreso");
  const actualizar = () => { progreso.textContent = visitados.size + " / " + n; };
  actualizar();

  // ----- Recuerdo abierto -----
  const memoria = $("memoria"), foto = $("foto"), polaroid = $("polaroid");
  let origen = null;

  function abrir(i, boton) {
    const r = RECUERDOS[i];
    origen = boton;
    $("mTitulo").textContent = r.titulo;
    $("mTexto").textContent = r.texto;
    polaroid.hidden = !r.foto;                       // sin foto: solo texto
    foto.onerror = () => { polaroid.hidden = true; };  // foto que no existe: se omite
    if (r.foto) foto.src = FOTOS_DIR + r.foto;
    memoria.inert = false;
    memoria.classList.add("abierta");
    $("cerrar").focus();
    boton.classList.add("vista");
    visitados.add(i);
    actualizar();
  }

  function cerrar() {
    if (!memoria.classList.contains("abierta")) return;
    if (origen) origen.focus();                      // el foco vuelve al girasol antes de ocultar la ventana
    memoria.classList.remove("abierta");
    memoria.inert = true;
    if (visitados.size === n) {
      const f = $("final");
      f.textContent = FINAL_TEXTO;
      f.hidden = false;
    }
  }

  $("cerrar").addEventListener("click", cerrar);
  memoria.addEventListener("click", e => { if (e.target === memoria) cerrar(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });
})();
