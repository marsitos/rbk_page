// ===== FOTOS DEL CARRUSEL =====
// Carpeta de las fotos (relativa a este archivo):
const FOLDER = "../assets/imgnosotros/";
// Las fotos se llaman foto1, foto2, ... foto40. Si agregas más, sube este número.
const TOTAL = 40;
// El código prueba estas extensiones para cada foto, así no importa si es .jpg, .jpeg, .png, etc.
const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP"];
// Textos opcionales debajo de la foto: por número. Ejemplo: { 3: "la playa", 7: "tu cumple" }
// Las que no estén aquí muestran un ♡.
const CAPTIONS = {};

const box = document.getElementById("collage");
let loaded = [];

// Prueba cada extensión hasta que una cargue. Si ninguna existe, avisa en la consola (F12).
function loadOne(n) {
  return new Promise(res => {
    let k = 0;
    const next = () => {
      if (k >= EXTS.length) {
        console.warn("No se encontró foto" + n + " (probé " + EXTS.join(", ") + ") en " + FOLDER);
        return res(null);
      }
      const src = FOLDER + "foto" + n + "." + EXTS[k++];
      const im = new Image();
      im.onload = () => res({ src, cap: CAPTIONS[n] || "" });
      im.onerror = next;
      im.src = src;
    };
    next();
  });
}

function loadAll() {
  const nums = Array.from({ length: TOTAL }, (_, i) => i + 1);
  return Promise.all(nums.map(loadOne)).then(list => {
    const ok = list.filter(Boolean);
    console.log("Fotos cargadas: " + ok.length + " de " + TOTAL);
    return ok;
  });
}

// Mezcla Fisher-Yates (aleatoria de verdad)
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 2 columnas en celular, 3 en tablet, 4–5 en computador.
const colsFor = w => w < 560 ? 2 : w < 900 ? 3 : w < 1300 ? 4 : 5;

function makeFrame(p) {
  const f = document.createElement("figure");
  f.className = "frame";
  f.style.setProperty("--r", (Math.random() * 6 - 3).toFixed(1) + "deg");
  f.innerHTML = '<div class="ph"><img alt="" src="' + p.src + '"></div><figcaption>' + (p.cap || "♡") + "</figcaption>";
  return f;
}

function build() {
  box.innerHTML = "";
  if (!loaded.length) return;
  const cols = colsFor(window.innerWidth);
  box.style.setProperty("--cols", cols);

  // Se baraja todo el mazo y se reparte entre las columnas: así cada foto
  // aparece una vez por vuelta, en orden distinto cada vez que se abre la página.
  const deck = shuffle(loaded);
  const lists = Array.from({ length: cols }, () => []);
  deck.forEach((p, i) => lists[i % cols].push(p));

  for (let c = 0; c < cols; c++) {
    const col = document.createElement("div");
    col.className = "col";
    const track = document.createElement("div");
    track.className = "track";
    const seq = document.createElement("div");
    seq.className = "seq";
    track.appendChild(seq);
    col.appendChild(track);
    box.appendChild(col);

    // Fotos asignadas a esta columna
    let last = null;
    lists[c].forEach(p => { seq.appendChild(makeFrame(p)); last = p; });

    // Si la columna quedó más corta que la pantalla (pocas fotos), se rellena con fotos al azar
    let guard = 0;
    while (seq.offsetHeight < window.innerHeight + 40 && guard++ < 60) {
      let extra = shuffle(loaded).find(p => p !== last) || loaded[0];
      seq.appendChild(makeFrame(extra));
      last = extra;
    }

    // Segunda copia idéntica: al subir media pista, el ciclo se repite sin saltos.
    track.appendChild(seq.cloneNode(true));

    const speed = 24 + (c % 3) * 7; // px por segundo; cada columna a su ritmo
    track.style.setProperty("--dur", (seq.offsetHeight / speed) + "s");
    track.style.setProperty("--dl", (-c * 9) + "s");
  }
}

loadAll().then(list => { loaded = list; build(); });

let rt;
window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 250); });

// ===== CONTADOR =====
// Ajusta la hora exacta cuando ella diga que sí (mes 10 = noviembre).
const DEFAULT_START = new Date(2026, 10, 13, 0, 0, 0);
// El momento exacto del "sí" llega por el enlace (?sf=...) o queda guardado en el dispositivo (RdelR).
// Si no existe, o es anterior al 13/11/2026 (una prueba), se usa el 13/11/2026 a las 00:00.
function savedStart() {
  let raw = new URLSearchParams(location.search).get("sf");
  const fromUrl = !!raw;
  if (!raw) { try { raw = localStorage.getItem("respuestaSi"); } catch (e) {} }
  const ts = Number(raw);
  if (!ts) return null;//cambiado
  if (fromUrl) { try { localStorage.setItem("respuestaSi", String(ts)); } catch (e) {} }
  return new Date(ts);
}
const OUR_START = savedStart() || DEFAULT_START;
const p2 = n => String(n).padStart(2, "0");
function tick() {
  const s = Math.max(0, Math.floor((new Date() - OUR_START) / 1000));
  document.getElementById("oD").textContent = p2(Math.floor(s / 86400));
  document.getElementById("oH").textContent = p2(Math.floor(s % 86400 / 3600));
  document.getElementById("oM").textContent = p2(Math.floor(s % 3600 / 60));
  document.getElementById("oS").textContent = p2(s % 60);
}
tick(); setInterval(tick, 1000);
