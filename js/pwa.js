// Registra el service worker para que la página se pueda instalar como app.
// Necesita HTTPS (o localhost / 127.0.0.1 mientras pruebas).
if ("serviceWorker" in navigator) {
  const aqui = document.currentScript ? document.currentScript.src : location.href; // se guarda ahora: dentro de "load" ya no existe
  window.addEventListener("load", () => {
    const sw = new URL("../sw.js", aqui).href;
    navigator.serviceWorker.register(sw).catch(() => { /* si falla, la página funciona igual */ });
  });
}
