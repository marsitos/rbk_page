/**
 * Momento exacto en que se presionó "Sí".
 * Lo comparten la página de la pregunta (que lo guarda) y "Nuestra fecha" (que lo lee).
 * Cargar este archivo ANTES de pregunta.js y de nuestrafecha.js.
 */
window.MomentoSi = (() => {
  "use strict";

  const STORAGE_KEY = "nuestraFecha.si";
  const pad = n => String(n).padStart(2, "0");

  /** Guarda el momento en este dispositivo (como milisegundos). */
  function save(date) {
    try {
      localStorage.setItem(STORAGE_KEY, String(date.getTime()));
    } catch (_) { /* almacenamiento no disponible: se ignora */ }
  }

  /** Devuelve el momento guardado como Date, o null si no hay (o no es válido). */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return null;
      const date = new Date(Number(raw));
      return Number.isNaN(date.getTime()) ? null : date;
    } catch (_) {
      return null;
    }
  }

  /** Borra el momento guardado en este dispositivo (se usa en el modo prueba). */
  function clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* se ignora */ }
  }

  /** "13 · 11 · 2026" */
  const formatDate = d => `${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`;

  /** "20:47:32" */
  const formatTime = d => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  /** "13 · 11 · 2026 — 20:47:32" */
  const formatFull = d => `${formatDate(d)} — ${formatTime(d)}`;

  /** "2026-11-13T20:47:32-05:00": listo para pegar en CONFIG.fixedStart de nuestrafecha.js */
  function toIsoWithOffset(d) {
    const offset = -d.getTimezoneOffset();
    const abs = Math.abs(offset);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${formatTime(d)}` +
           `${offset >= 0 ? "+" : "-"}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  }

  return Object.freeze({ save, load, clear, formatDate, formatTime, formatFull, toIsoWithOffset });
})();
