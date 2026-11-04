const bgm = document.getElementById("bgm");
const muteBtn = document.getElementById("mute");
let audioFailed = false;
bgm.volume = 0;
bgm.addEventListener("error", () => { audioFailed = true; muteBtn.style.display = "none"; });

// Estrellitas de fondo
const starsBox = document.getElementById("stars");
for (let i = 0; i < 24; i++) {
  const s = document.createElement("i");
  s.textContent = ["✦", "✧", "·"][i % 3];
  s.style.left = Math.random() * 100 + "%";
  s.style.top = Math.random() * 100 + "%";
  s.style.fontSize = 8 + Math.random() * 12 + "px";
  s.style.setProperty("--t", 3 + Math.random() * 5 + "s");
  s.style.setProperty("--dl", -Math.random() * 8 + "s");
  s.style.setProperty("--p", 0.2 + Math.random() * 0.35);
  starsBox.appendChild(s);
}

// Al tocar "Abrir": entra la música (con fundido), empieza la secuencia y crece el resplandor.
document.getElementById("open").addEventListener("click", () => {
  document.getElementById("gate").classList.add("off");
  document.getElementById("ask").classList.remove("hidden");
  document.getElementById("halo").classList.add("on");

  const p = bgm.play();
  if (p && p.catch) p.catch(() => {});
  let v = 0;
  const fade = setInterval(() => { v = Math.min(0.7, v + 0.03); bgm.volume = v; if (v >= 0.7) clearInterval(fade); }, 150);
  if (!audioFailed) muteBtn.style.display = "block";
});

muteBtn.addEventListener("click", () => {
  bgm.muted = !bgm.muted;
  muteBtn.textContent = bgm.muted ? "✕" : "♪";
});

// Al decir que sí: se guarda el momento exacto (lo usa la página "Nuestra fecha")
// y la fecha de la respuesta pasa a mostrar también la hora. Ver js/momento-si.js.
document.getElementById("yes").addEventListener("click", () => {
  const momento = new Date();

  MomentoSi.save(momento);
  console.log("Momento del sí (para CONFIG.fixedStart en nuestrafecha.js):", MomentoSi.toIsoWithOffset(momento));

  RESPUESTA.eyebrow = MomentoSi.formatFull(momento);

  document.getElementById("ask").classList.add("hidden");
  document.getElementById("done").classList.remove("hidden");
  mostrarRespuesta();
});