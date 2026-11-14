/**
 * Registro de páginas desbloqueadas ("Descubiertas").
 * Lo cargan las páginas que se desbloquean jugando o visitándolas (RdelR, NuestraFecha, Interior...).
 * Escribe en el mismo lugar que lee el menú del index (js/codigos.js).
 *
 * Uso automático: en el <body> de la página, data-desbloquea="id"
 *   <body data-desbloquea="nuestrafecha">
 * Uso manual:  Desbloqueos.registrar("interior")
 * Los ids válidos están en js/codigos-data.js (PAGINAS_DESBLOQUEABLES).
 */
window.Desbloqueos = (() => {
  "use strict";
  const KEY = "descubiertas.v1";

  function leer() {
    try {
      const datos = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(datos) ? datos : [];
    } catch (_) { return []; }
  }

  function registrar(id) {
    if (!id) return;
    const lista = leer();
    if (lista.some(d => d && d.codigo === id)) return;
    lista.push({ codigo: id, ts: Date.now(), visto: false });
    try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch (_) { /* sin almacenamiento: se ignora */ }
  }

  const auto = () => { if (document.body && document.body.dataset.desbloquea) registrar(document.body.dataset.desbloquea); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();

  return Object.freeze({ registrar });
})();
