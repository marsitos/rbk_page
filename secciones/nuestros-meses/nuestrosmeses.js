const $ = id => document.getElementById(id);
const sc = $("sc"), side = $("side");
let seen = [];
try { seen = JSON.parse(localStorage.getItem("seismeses_seen") || "[]"); } catch (e) {}

// ----- Construir secciones: intro + meses + cierre -----
const secs = [];
function addSec(cls, html) { const s = document.createElement("section"); s.className = "sec " + cls; s.innerHTML = html; sc.appendChild(s); secs.push(s); return s; }
addSec("intro on", '<span style="letter-spacing:.2em;opacity:.6;font-size:.8rem"></span><h1>Nuestros meses</h1>' +
  '<p>Un mes por pantalla. Desliza hacia abajo y entra a cada historia.</p><button class="scrollhint" aria-label="Bajar">↓</button>');
MONTHS.forEach((o, i) => {
  addSec("msec", '<div class="mcard" style="--h:' + o.h + '"><div class="deco"></div><span class="pill">' + o.cat + '</span><span class="num">0' + (i + 1) + ' / 06</span>' +
    '<div class="mname">' + o.m + '</div><div class="year">' + o.y + '</div><h3>' + o.t + '</h3><p>' + o.s + '</p>' +
    '<button class="enter" data-i="' + i + '"><span>Abrir historia</span><i>→</i></button></div>');
  const d = document.createElement("b"); d.title = o.m + " " + o.y; d.onclick = () => goMonth(i); side.appendChild(d);
});
addSec("outro", '<div class="big">Y hoy, seis meses de conocernos, lleno de alegrias y momentos bonitos, lleno de un futuro juntos.</div><button class="again">↑ volver al inicio</button>');
const dots = [...side.children];

function goSec(el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); }
function goMonth(i, flash) {
  const el = secs[i + 1]; goSec(el);
  if (flash) { const c = el.querySelector(".mcard"); c.classList.remove("flash"); void c.offsetWidth; setTimeout(() => c.classList.add("flash"), 350); }
}
sc.querySelector(".scrollhint").onclick = () => goSec(secs[1]);
sc.querySelector(".again").onclick = () => goSec(secs[0]);

// ----- Mes activo mientras haces scroll -----
let cur = 0;
// ----- Fondo con foto que cambia con el mes (transición suave entre dos capas) -----
document.documentElement.style.setProperty("--bgop", BG_OPACITY);
const layers = [$("bgA"), $("bgB")];
let flip = false, lastCur = -1;
function setBg(i) {
  const o = MONTHS[i];
  if (!o || !o.bg) { layers.forEach(l => l.classList.remove("show")); return; }
  const src = FOLDER + o.bg, im = new Image();
  im.onload = () => {
    if (cur - 1 !== i) return; // ya cambió de mes mientras cargaba
    flip = !flip;
    const on = layers[+flip], off = layers[+!flip];
    on.style.backgroundImage = 'url("' + src + '")';
    on.classList.add("show"); off.classList.remove("show");
  };
  im.onerror = () => { console.warn("No se encontró el fondo " + src); layers.forEach(l => l.classList.remove("show")); };
  im.src = src;
}

function paint() {
  if (cur !== lastCur) { lastCur = cur; setBg(cur - 1); }
  secs.forEach((s, k) => s.classList.toggle("on", k === cur));
  dots.forEach((d, k) => { d.classList.toggle("on", k === cur - 1); d.classList.toggle("seen", seen.includes(k)); });
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cur = secs.indexOf(e.target); paint(); } }), { root: sc, threshold: .6 });
secs.forEach(s => io.observe(s));
sc.addEventListener("click", e => { const b = e.target.closest(".enter"); if (b) openStory(+b.dataset.i); });

// ----- Buscador -----
const q = $("q"), res = $("res"), clr = $("clr");
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const index = MONTHS.map(o => norm([o.m, o.y, o.cat, o.t, o.s, ...o.pages.map(p => p.txt)].join(" ")));
let found = [], fi = -1;
function search() {
  const t = norm(q.value).trim().split(/\s+/).filter(Boolean);
  clr.style.display = q.value ? "block" : "none";
  fi = -1;
  if (!t.length) { res.style.display = "none"; found = []; return; }
  found = MONTHS.map((_, i) => i).filter(i => t.every(w => index[i].includes(w)));
  res.innerHTML = found.length
    ? found.map((i, k) => '<button data-k="' + k + '"><b>' + MONTHS[i].m + " " + MONTHS[i].y + "</b><small>" + MONTHS[i].cat + " · " + MONTHS[i].t + "</small></button>").join("")
    : '<div class="none">Ningún mes coincide ♡</div>';
  res.style.display = "block";
}
function pick(k) {
  if (!found[k] && found[k] !== 0) return;
  goMonth(found[k], true); res.style.display = "none"; q.blur();
}
q.addEventListener("input", search);
q.addEventListener("focus", search);
q.addEventListener("keydown", e => {
  const bs = [...res.querySelectorAll("button")];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault(); if (!bs.length) return;
    fi = (fi + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length;
    bs.forEach((b, k) => b.classList.toggle("f", k === fi));
  } else if (e.key === "Enter") { e.preventDefault(); pick(fi >= 0 ? fi : 0); }
  else if (e.key === "Escape") { res.style.display = "none"; q.blur(); }
});
res.addEventListener("click", e => { const b = e.target.closest("button"); if (b) pick(+b.dataset.k); });
clr.onclick = () => { q.value = ""; search(); q.focus(); };
document.addEventListener("click", e => { if (!e.target.closest(".search")) res.style.display = "none"; });

// ----- Menú de historia: se abre como una carta -----
const story = $("story"), sbody = $("sbody"), bars = $("bars"), sbox = $("sbox");
let si = 0, sp = 0;

// Ajustes: cuánto dura cada página (según el largo del texto) y los tiempos de apertura de la carta (ms)
const STORY = { baseMs: 3800, perChar: 45, minMs: 4500, maxMs: 12000, openMs: [500, 1300] };
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
story.querySelector(".hint").textContent = "toca para avanzar · mantén para pausar · Esc para cerrar";

// Sobre con sello (se dibuja con CSS; el color sale del tono del mes)
const env = document.createElement("div");
env.className = "env"; env.setAttribute("aria-hidden", "true");
env.innerHTML = '<div class="env-body"></div><div class="env-l"></div><div class="env-r"></div><div class="env-b"></div><div class="env-flap"></div><div class="env-seal">♥</div>';
story.insertBefore(env, sbox);

let opening = false, openTimers = [], paused = false, swallow = false, holdTimer = 0;
const clearOpen = () => { openTimers.forEach(clearTimeout); openTimers = []; };
function setPaused(v) { paused = v; sbox.classList.toggle("paused", v); }

function finishOpen() {          // el sobre ya se abrió: empieza la lectura
  clearOpen();
  if (!opening) return;
  opening = false;
  env.classList.add("broke");
  story.classList.remove("opening"); story.classList.add("opened");
  render();
}

function openStory(i) {
  si = i; sp = 0; clearOpen(); setPaused(false);
  story.style.setProperty("--h", MONTHS[i].h);
  sbox.style.setProperty("--h", MONTHS[i].h);
  bars.innerHTML = MONTHS[i].pages.map(() => "<span></span>").join("");
  sbody.innerHTML = "";
  env.classList.remove("broke");
  story.classList.add("show"); story.setAttribute("aria-hidden", "false");
  opening = true;
  if (reduceMotion) { finishOpen(); return; }
  story.classList.remove("opened"); story.classList.add("opening");
  openTimers.push(setTimeout(() => env.classList.add("broke"), STORY.openMs[0]), setTimeout(finishOpen, STORY.openMs[1]));
}

// ----- Diseño de cada página: polaroid, foto completa o frase (se puede forzar con "layout" en meses-data.js) -----
function layoutOf(o, k) {
  const p = o.pages[k];
  if (p.layout) return p.layout;
  if (!p.img) return "quote";
  return o.pages.slice(0, k).filter(x => x.img).length % 2 === 0 ? "polaroid" : "full";
}

const pageMs = p => Math.min(STORY.maxMs, Math.max(STORY.minMs, STORY.baseMs + String(p.txt).replace(/<[^>]*>/g, "").length * STORY.perChar));

// El texto aparece palabra por palabra (si trae HTML, se muestra tal cual)
function revealText(txt) {
  if (/[<&]/.test(txt)) return txt;
  const words = String(txt).split(/\s+/).filter(Boolean), gap = Math.min(0.07, 1.9 / Math.max(words.length, 1));
  return words.map((w, k) => '<span class="w" style="animation-delay:' + (0.25 + k * gap).toFixed(2) + 's">' + w + "</span>").join(" ");
}

function render() {
  const o = MONTHS[si], p = o.pages[sp], last = sp === o.pages.length - 1, lay = layoutOf(o, sp);

  // Barras: las anteriores llenas y la actual se llena sola (al terminar pasa a la siguiente página)
  [...bars.children].forEach((b, k) => { b.className = k < sp ? "done" : ""; });
  void bars.offsetWidth;
  const cur = bars.children[sp];
  cur.style.setProperty("--dur", pageMs(p) + "ms");
  cur.classList.add("cur");

  sbody.className = "sbody lay-" + lay;
  sbody.dataset.n = "0" + (si + 1);
  sbody.style.animation = "none"; void sbody.offsetWidth; sbody.style.animation = "";
  sbody.innerHTML = "<small>" + o.m + " " + o.y + " · " + o.cat + "</small>" +
    (p.img ? '<img alt="" src="' + FOLDER + p.img + '" onerror="this.parentNode.classList.add(\'nofoto\');this.remove()">' : "") +
    "<p>" + revealText(p.txt) + "</p>" +
    (last ? '<button class="cta" id="cta">' + (si < MONTHS.length - 1 ? "Siguiente mes ↓" : "Y hoy, seis meses ♡") + "</button>" : "");
  if (last) {
    if (!seen.includes(si)) { seen.push(si); try { localStorage.setItem("seismeses_seen", JSON.stringify(seen)); } catch (e) {} paint(); updateHeart(); }
    $("cta").onclick = () => { closeStory(); goSec(secs[si + 2]); };
  }
}

function step(d) { if (opening) return; const n = sp + d; if (n < 0 || n >= MONTHS[si].pages.length) return; sp = n; render(); }
function closeStory() { clearOpen(); opening = false; setPaused(false); story.classList.remove("show", "opening", "opened"); story.setAttribute("aria-hidden", "true"); }

// La barra actual terminó: pasa sola a la siguiente página (en la última se queda esperando el botón)
bars.addEventListener("animationend", e => { if (e.animationName === "barFill" && sp < MONTHS[si].pages.length - 1) step(1); });

// Mantener el dedo (o el clic) pausa; un toque corto avanza o retrocede
[$("tl"), $("tr")].forEach(b => {
  b.addEventListener("pointerdown", () => { swallow = false; clearTimeout(holdTimer); holdTimer = setTimeout(() => { setPaused(true); swallow = true; }, 230); });
  const soltar = () => { clearTimeout(holdTimer); if (paused) setPaused(false); };
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, soltar));
});
$("tr").onclick = () => { if (swallow) { swallow = false; return; } step(1); };
$("tl").onclick = () => { if (swallow) { swallow = false; return; } step(-1); };
$("sx").onclick = closeStory;
document.addEventListener("visibilitychange", () => { if (document.hidden && story.classList.contains("show")) setPaused(true); else if (!document.hidden) setPaused(false); });
story.addEventListener("click", e => { if (opening) { finishOpen(); return; } if (e.target === story) closeStory(); });

// ----- Cierre: seis luces que se unen y forman un corazón -----
const HEART = [[50, 34], [27, 20], [16, 46], [50, 84], [84, 46], [73, 20]].slice(0, MONTHS.length);
const outro = secs[secs.length - 1];
(function buildHeart() {
  const box = document.createElement("div");
  box.className = "mheart";
  box.innerHTML = '<svg viewBox="0 0 100 94" aria-hidden="true"><polygon class="hl" pathLength="1" points="' + HEART.map(p => p.join(",")).join(" ") + '"/>' +
    HEART.map(p => '<circle class="hd" cx="' + p[0] + '" cy="' + p[1] + '" r="3.2"/>').join("") + '</svg><p class="hmsg"></p>';
  outro.insertBefore(box, outro.firstChild);
})();
function updateHeart() {
  outro.querySelectorAll(".hd").forEach((d, k) => d.classList.toggle("on", seen.includes(k)));
  const faltan = MONTHS.length - MONTHS.filter((_, k) => seen.includes(k)).length;
  outro.classList.toggle("complete", faltan === 0);
  outro.querySelector(".hmsg").textContent = faltan === 0 ? "" : faltan === 1 ? "te falta 1 historia por abrir" : "te faltan " + faltan + " historias por abrir";
}
updateHeart();
document.addEventListener("keydown", e => {
  if (story.classList.contains("show")) {
    if (e.key === "Escape") closeStory();
    if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
  } else if (document.activeElement !== q) {
    if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); goSec(secs[Math.min(secs.length - 1, cur + 1)]); }
    if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); goSec(secs[Math.max(0, cur - 1)]); }
  }
});

// ----- Corazones flotando de fondo -----
const hb = $("hearts");
for (let k = 0; k < 14; k++) {
  const h = document.createElement("i");
  h.textContent = "♡";
  h.style.left = Math.random() * 100 + "%";
  h.style.fontSize = (10 + Math.random() * 18) + "px";
  h.style.animationDuration = (14 + Math.random() * 18) + "s";
  h.style.animationDelay = (-Math.random() * 30) + "s";
  hb.appendChild(h);
}
paint();