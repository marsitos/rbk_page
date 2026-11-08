// Service worker de la app. Primero busca la versión nueva en internet y, si no hay conexión,
// usa la última copia guardada. Así los cambios que hagas se ven siempre al instante.
const CACHE = "cocolon-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(c => c !== CACHE).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // Solo páginas y archivos propios; el audio (que usa fragmentos) y lo externo se dejan pasar
  if (req.method !== "GET" || req.headers.has("range") || new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
