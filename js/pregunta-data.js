// ===== TEXTOS Y AJUSTES DE LA PREGUNTA =====
// Aquí personalizas todo sin tocar la lógica.

// Carpeta de las fotos (relativa a esta página)
const FOTOS_DIR = "../assets/imgnosotros/";

// Frases que salen debajo cada vez que intenta darle clic al "No" (la última se queda fija)
const NO_MENSAJES = [
  "Mmm… ese botón está medio tímido.",
  "¿Segura? Mira que no se deja.",
  "Se escapó otra vez.",
  "Casi, casi…",
  "Creo que el botón ya sabe la respuesta.",
  "sapita",
  "Me odias....",
  "jummm...",
  "Mejor presiona el Sí jeje ♡"
];

// Lo que aparece después de decir que sí
const RESPUESTA = {
  eyebrow: "13 · 11 · 2026",
  title: "Gracias por\ndecir que sí.",
  // Cada frase aparece una después de otra. La primera se ve más grande.
  lines: [
    "Desde hoy, esto es nuestro.",
    "Seis meses para llegar hasta aquí, y todo lo que falta."
  ],
  // Fotos que aparecen como polaroids (archivos dentro de FOTOS_DIR). Usa [] para no mostrar ninguna.
  photos: [],
  // Carta opcional: si escribes texto aquí, aparece el botón para leerla. Déjalo en "" para ocultarlo.
  letter: {
    button: "Leer mi carta",
    text: ""
  },
  // Botón final
  cta: "Nuestros tiempos, pasado, presente y futuro →",
  ctaHref: "NuestraFecha.html"
};
