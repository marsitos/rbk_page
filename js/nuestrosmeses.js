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

// ----- Menú de historia -----
const story = $("story"), sbody = $("sbody"), bars = $("bars"), sbox = $("sbox");
let si = 0, sp = 0;
function openStory(i) {
  si = i; sp = 0;
  sbox.style.setProperty("--h", MONTHS[i].h);
  bars.innerHTML = MONTHS[i].pages.map(() => "<span></span>").join("");
  story.classList.add("show"); story.setAttribute("aria-hidden", "false");
  render();
}
function render() {
  const o = MONTHS[si], p = o.pages[sp], last = sp === o.pages.length - 1;
  [...bars.children].forEach((b, k) => b.classList.toggle("done", k <= sp));
  sbody.style.animation = "none"; void sbody.offsetWidth; sbody.style.animation = "";
  sbody.innerHTML = "<small>" + o.m + " " + o.y + " · " + o.cat + "</small>" +
    (p.img ? '<img alt="" src="' + FOLDER + p.img + '" onerror="this.remove()">' : "") +
    "<p>" + p.txt + "</p>" +
    (last ? '<button class="cta" id="cta">' + (si < MONTHS.length - 1 ? "Siguiente mes ↓" : "Y hoy, seis meses ♡") + "</button>" : "");
  if (last) {
    if (!seen.includes(si)) { seen.push(si); try { localStorage.setItem("seismeses_seen", JSON.stringify(seen)); } catch (e) {} paint(); }
    $("cta").onclick = () => { closeStory(); goSec(secs[si + 2]); };
  }
}
function step(d) { const n = sp + d; if (n < 0 || n >= MONTHS[si].pages.length) return; sp = n; render(); }
function closeStory() { story.classList.remove("show"); story.setAttribute("aria-hidden", "true"); }
$("tr").onclick = () => step(1);
$("tl").onclick = () => step(-1);
$("sx").onclick = closeStory;
story.addEventListener("click", e => { if (e.target === story) closeStory(); });
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