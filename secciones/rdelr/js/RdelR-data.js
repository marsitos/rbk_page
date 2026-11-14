// ===== TEXTOS DE LA CONSTELACIÓN =====
// Aquí cambias todo lo que se lee, sin tocar la lógica.

// Mensajes de las 4 primeras estrellas (la quinta es la pregunta).
// Son borradores: reemplázalos por tus propias palabras.
const VIRGO_TEXTOS = [
  "Hay estrellas que son dificiles de ver y encontrar en el espacio, pero el tiempo premia la paciencia",
  "A veces llegué a sentir que en un universo tan grande y con tantas estrellas no podría encontrar una que me gustara tanto, sentirme tan a gusto teniendo la seguridad de que siempre estará conmigo, que yo podré contemplarla y adorarla.",
  "En estos textos, reflejo lo que siento, lo que me haces sentir, ya que siempre serás mi galaxia.",
  "Hoy, que cumplimos seis meses, y mañana reconocerán tu esfuerzo con un diploma por excelencia académica. Estoy muy orgulloso de ti. Hoy también que es un día especial, considero que el viernes 13 es una fecha bonita aunque por ahí dicen que el 13 es un numero de mala suerte, me gustaría cambiar esa idea errónea y hacer las cosas bien contigo como lo hemos estado haciendo desde que nos conocimos."
];

// Última estrella
const PREGUNTA = {
  icono: "🌠",
  intro: "Si pudiera pedirle un deseo a esta última estrella fugaz, sería seguir compartiendo mi vida contigo, descubrir todo lo que nos espera juntos. Tengo atorado hace un buen tiempo esto pero no encontraba una buena fecha, hasta que caí en cuenta que cumplimos seis meses y sería bonito. Me gustaría dar el paso, dejar de imaginar como sería y empezar a construirlo. Me gustaría ser tu novio, Rebeca.",
  titulo: "¿Aceptas?",
  // Frases que salen cada vez que intenta tocar el "No" (la última se queda fija)
  noMensajes: [
    "Mmm…………",
    "¿Segura? Mira que no se deja jeje.",
    "Se jue otra vez....",
    "Ta feita esa palabra...",
    "Me odias....",
    "ME ODIAS INFINITAMENTE",
    "😭😭",
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
  modoPrueba: false,
  fecha: "2026-11-13T16:04:43-05:00",      // momento exacto del sí (viernes 13/11/2026, hora de Ecuador)
  eyebrow: "Bechito",
  titulo: "Desde hoy, hasta siempre.",
  etiquetaHora: "Tu sí quedó registrado el",
  palabras: "Desde hoy, esto es nuestro.\nSeis meses para llegar hasta aquí, y todo lo que falta.",
  cta: "Ver nuestra fecha →",
  ctaHref: "../nuestra-fecha/NuestraFecha.html",
  emojis: ["🦋", "🌻", "✦", "💜"]           // lluvia que cae al decir que sí
};


// ===== TELESCOPIO =====
// Indicaciones del recorrido: scroll, telescopio y visor. (Los párrafos son VIRGO_TEXTOS, arriba:
// salen en ese orden sin importar qué estrella toque primero. La última luz es la pregunta.)
const TELESCOPIO = {
  pistaScroll: "desliza ↓",
  pistaTelescopio: "toca el telescopio",
  pistaArrastrar: "arrastra para mirar el cielo",
  salir: "✖️ salir",
  segundosPista: 6   // segundos sin encontrar una estrella para que aparezca la indicación discreta
};
