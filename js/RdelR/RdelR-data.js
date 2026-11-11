// ===== TEXTOS DE LA CONSTELACIÓN =====
// Aquí cambias todo lo que se lee, sin tocar la lógica.

// Mensajes de las 4 primeras estrellas (la quinta es la pregunta).
// Son borradores: reemplázalos por tus propias palabras.
const VIRGO_TEXTOS = [
  "Hay galaxias tan lejos que su luz tarda millones de años en llegar. La tuya, en cambio, llegó justo a tiempo.",
  "Las mariposas aparecen sin avisar y lo cambian todo, aunque ellas ni lo sepan. Así llegaste tú a mis días.",
  "Los girasoles siempre buscan la luz. Y yo, sin darme cuenta, siempre termino buscándote a ti.",
  "Hoy cumplimos seis meses, y hoy también reconocen tu esfuerzo con un diploma por excelencia académica. Estoy muy orgulloso de ti."
];

// Última estrella
const PREGUNTA = {
  icono: "🌻",
  intro: "Esta última estrella guarda lo que quería preguntarte, mirándote.",
  titulo: "¿Quieres ser mi novia?",
  // Frases que salen cada vez que intenta tocar el "No" (la última se queda fija)
  noMensajes: [
    "Mmm…………",
    "¿Segura? Mira que no se deja jeje.",
    "Se escapó otra vez....",
    "No es tan fácil tocar el No...",
    "Me odias....",
    "ME ODIAS INFINITAMENTE",
    "JUMMM",
    "Listo, voy entendiendo el mensaje……",
    "Okei, no hay problema chau",
    "Ya la siguiente que lo aplastes queda, tranquila.",
    "Ultima oportunidad...",
    "MENTIRA TU NO TE ME VAS JEJEJJEJEJE",
    "Aplasta el sí sapita",
    "Si aplastas el sí tienes un cupón valido para pedirme mil besos……",
    "Listo, mis besos no son suficientes para ti entonces....",
    "Dos mil???",
    "Tres mil???",
    "Infinitos entonces……",
    "Listo, besos infinitos para ti, y abrazos, y caricias, y todo lo que quieras.",
    "Te quielo mucho mi amochito, seamos uno para siempre"
  ]
};

// Lo que aparece después de decir que sí
const RESPUESTA = {
  modoPrueba: true,
  clave: "respuestaSi",                    // nombre con el que se guarda la hora (NuestraFecha la lee)
  eyebrow: "Desde hoy",
  titulo: "Gracias por decir que sí.",
  etiquetaHora: "Tu sí quedó registrado el",
  palabras: "Desde hoy, esto es nuestro.\nSeis meses para llegar hasta aquí, y todo lo que falta.",
  cta: "Ver nuestra fecha →",
  ctaHref: "NuestraFecha.html",
  emojis: ["🦋", "🌻", "✦", "💜"]           // lluvia que cae al decir que sí
};


// ===== TELESCOPIO =====
// Indicaciones del recorrido: scroll, telescopio y visor. (Los párrafos son VIRGO_TEXTOS, arriba:
// salen en ese orden sin importar qué estrella toque primero. La última luz es la pregunta.)
const TELESCOPIO = {
  pistaScroll: "desliza ↓",
  pistaTelescopio: "toca el telescopio",
  pistaArrastrar: "arrastra para mirar el cielo",
  salir: "✕ salir",
  segundosPista: 6   // segundos sin encontrar una estrella para que aparezca la indicación discreta
};
