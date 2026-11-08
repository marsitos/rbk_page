// ===== TEXTOS DE INTERIOR =====
// Cada elemento de RECUERDOS es un girasol. Agrega o quita elementos y el campo se ajusta solo.
// "foto" es un archivo dentro de FOTOS_DIR; si no existe, el recuerdo se muestra solo con el texto.

const FOTOS_DIR = "../assets/imgnosotros/";

const INSTRUCCION = "Toca un girasol";
const FINAL_TEXTO = "Y todo lo que falta.";   // aparece cuando abre todos los girasoles

const RECUERDOS = [
  { titulo: "13 de mayo",      texto: "Todo empezó sin que ninguno de los dos supiera lo que venía.",             foto: "foto1.jpeg" },
  { titulo: "18 de julio",     texto: "El día más bonito, hasta ahora.",                                          foto: "foto2.jpeg" },
  { titulo: "Agosto",          texto: "Tres meses, unos tulipanes hechos a mano y una página solo para ti.",      foto: "foto3.jpg" },
  { titulo: "13 de noviembre", texto: "Seis meses, y algo que quería preguntarte, mirándote.",                    foto: "foto4.jpg" },
  { titulo: "Lo que falta",    texto: "Todo lo que todavía nos falta por vivir.",                                 foto: "foto5.jpg" }
];
