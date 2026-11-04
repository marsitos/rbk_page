/**
 * Página "Nuestra fecha":
 *   1) Carrusel de fotos de fondo (columnas que suben, con marco de foto instantánea).
 *   2) Contador desde el momento exacto del "sí".
 * Depende de js/momento-si.js (cargarlo antes que este archivo).
 */
(() => {
  "use strict";

  // ===== CONFIGURACIÓN (normalmente es lo único que necesitas editar) =====
  const CONFIG = {
    // Carpeta de las fotos, relativa a esta página.
    photosFolder: "../assets/imgnosotros/",
    // Las fotos se llaman foto1, foto2, ... Si agregas más, sube totalPhotos.
    photoPrefix: "foto",
    totalPhotos: 41,
    // Se prueba cada extensión hasta que una cargue (da igual si es .jpg, .jpeg, .png...).
    extensions: ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP"],
    // Textos opcionales bajo cada foto, por número. Ejemplo: { 3: "la playa", 7: "tu cumple" }
    // Las que no estén aquí muestran un ♡.
    captions: {},

    // Hora de inicio FIJA del contador. Tiene prioridad y vale para todos los dispositivos.
    // Pon aquí la hora que salió en la página de la pregunta, por ejemplo:
    //   fixedStart: "2026-11-13T20:47:32-05:00"   (-05:00 = hora de Ecuador)
    // Con null se usa la hora guardada en el dispositivo donde se presionó "Sí".
    fixedStart: null,

    carousel: {
      fillMargin: 120,       // px extra sobre la altura de la pantalla, para que nunca queden huecos
      maxFillFrames: 60,     // tope de seguridad al rellenar columnas cortas
      baseSpeed: 24,         // px por segundo de la columna más lenta
      speedStep: 7,          // cuánto más rápida va cada tipo de columna
      speedLevels: 3,        // cuántos ritmos distintos hay entre columnas
      delayPerColumn: 9,     // segundos de desfase entre columnas
      rebuildDebounce: 250,  // ms de espera antes de reconstruir al cambiar el tamaño
    },
  };

  // Ancho máximo (px) -> número de columnas. Por encima del último: 5.
  const BREAKPOINTS = [[560, 2], [900, 3], [1300, 4]];
  const MAX_COLUMNS = 5;

  const columnsFor = width => {
    for (const [maxWidth, cols] of BREAKPOINTS) {
      if (width < maxWidth) return cols;
    }
    return MAX_COLUMNS;
  };

  // ===== FOTOS =====

  /** Prueba cada extensión hasta que una cargue. Devuelve {src, caption} o null si no existe. */
  function loadPhoto(n) {
    const { photosFolder, photoPrefix, extensions, captions } = CONFIG;
    return new Promise(resolve => {
      let attempt = 0;
      const tryNext = () => {
        if (attempt >= extensions.length) {
          console.warn(`No se encontró ${photoPrefix}${n} (probé ${extensions.join(", ")}) en ${photosFolder}`);
          resolve(null);
          return;
        }
        const src = `${photosFolder}${photoPrefix}${n}.${extensions[attempt++]}`;
        const img = new Image();
        img.onload = () => resolve({ src, caption: captions[n] || "" });
        img.onerror = tryNext;
        img.src = src;
      };
      tryNext();
    });
  }

  async function loadPhotos() {
    const numbers = Array.from({ length: CONFIG.totalPhotos }, (_, i) => i + 1);
    const found = (await Promise.all(numbers.map(loadPhoto))).filter(Boolean);
    console.log(`Fotos cargadas: ${found.length} de ${CONFIG.totalPhotos}`);
    return found;
  }

  /** Mezcla Fisher-Yates sobre una copia (aleatoria de verdad). */
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /** Marco de foto instantánea. Se arma con nodos del DOM (no con innerHTML). */
  function createFrame({ src, caption }) {
    const frame = document.createElement("figure");
    frame.className = "frame";
    frame.style.setProperty("--r", `${(Math.random() * 6 - 3).toFixed(1)}deg`);

    const holder = document.createElement("div");
    holder.className = "ph";
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.src = src;
    holder.appendChild(img);

    const label = document.createElement("figcaption");
    label.textContent = caption || "♡";

    frame.append(holder, label);
    return frame;
  }

  /** Crea la estructura vacía de una columna: contenedor, pista y primera secuencia. */
  function createColumn() {
    const column = document.createElement("div");
    column.className = "col";
    const track = document.createElement("div");
    track.className = "track";
    const sequence = document.createElement("div");
    sequence.className = "seq";
    track.appendChild(sequence);
    column.appendChild(track);
    return { column, track, sequence };
  }

  /** Reparte las fotos barajadas entre las columnas y arma el carrusel. Devuelve cuántas columnas hizo. */
  function buildCarousel(box, photos) {
    box.replaceChildren();
    if (!photos.length) return 0;

    const { fillMargin, maxFillFrames, baseSpeed, speedStep, speedLevels, delayPerColumn } = CONFIG.carousel;
    const cols = columnsFor(window.innerWidth);
    box.style.setProperty("--cols", cols);

    // Cada foto aparece una vez por vuelta, en un orden distinto cada vez que se abre la página.
    const assigned = Array.from({ length: cols }, () => []);
    shuffle(photos).forEach((photo, i) => assigned[i % cols].push(photo));

    assigned.forEach((list, c) => {
      const { column, track, sequence } = createColumn();
      box.appendChild(column);

      let last = null;
      list.forEach(photo => { sequence.appendChild(createFrame(photo)); last = photo; });

      // Si la columna quedó más corta que la pantalla (pocas fotos), se rellena con fotos al azar.
      let guard = 0;
      while (sequence.offsetHeight < window.innerHeight + fillMargin && guard++ < maxFillFrames) {
        const extra = shuffle(photos).find(p => p !== last) || photos[0];
        sequence.appendChild(createFrame(extra));
        last = extra;
      }

      // Segunda copia idéntica: al subir media pista el ciclo se repite sin saltos.
      track.appendChild(sequence.cloneNode(true));

      const speed = baseSpeed + (c % speedLevels) * speedStep; // px por segundo
      track.style.setProperty("--dur", `${sequence.offsetHeight / speed}s`);
      track.style.setProperty("--dl", `${-c * delayPerColumn}s`);
    });

    return cols;
  }

  function initCarousel() {
    const box = document.getElementById("collage");
    if (!box) return;

    let photos = [];
    let builtCols = 0;
    const render = () => { builtCols = buildCarousel(box, photos); };

    loadPhotos().then(list => { photos = list; render(); });

    // Solo se reconstruye si cambia el número de columnas. En el celular, mostrar u ocultar
    // la barra del navegador cambia la altura y no debe reiniciar ni re-mezclar el carrusel.
    let timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (columnsFor(window.innerWidth) !== builtCols) render();
      }, CONFIG.carousel.rebuildDebounce);
    });
  }

  // ===== CONTADOR =====

  const pad2 = n => String(n).padStart(2, "0");
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  /** Hora de inicio: primero la fija (CONFIG.fixedStart), si no la guardada en el dispositivo. */
  function resolveStart() {
    if (CONFIG.fixedStart) {
      const fixed = new Date(CONFIG.fixedStart);
      if (!Number.isNaN(fixed.getTime())) return fixed;
      console.warn("CONFIG.fixedStart no es una fecha válida:", CONFIG.fixedStart);
    }
    return window.MomentoSi.load();
  }

  function initCounter() {
    if (!window.MomentoSi) {
      console.error("Falta cargar js/momento-si.js antes de nuestrafecha.js");
      return;
    }

    const start = resolveStart();

    // Sin hora de inicio, la página conserva el texto por defecto del HTML y el contador queda en ceros.
    if (start) {
      setText("nfFecha", window.MomentoSi.formatDate(start));
      setText("nfHora", `Juntos desde las ${window.MomentoSi.formatTime(start)}.`);
    }

    const render = () => {
      const total = start ? Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000)) : 0;
      setText("oD", pad2(Math.floor(total / 86400)));
      setText("oH", pad2(Math.floor((total % 86400) / 3600)));
      setText("oM", pad2(Math.floor((total % 3600) / 60)));
      setText("oS", pad2(total % 60));
    };

    render();
    setInterval(render, 1000);
  }

  initCarousel();
  initCounter();
})();
