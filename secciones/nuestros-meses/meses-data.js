// ===== LOS MESES =====
// y = año, h = tono de color (0-360). pages = páginas de la historia; cada una puede llevar foto opcional:
// { txt: "texto", img: "foto12.jpg" } → busca la foto en FOLDER. Si no existe, solo muestra el texto.
// bg = foto de fondo de ese mes (archivo dentro de FOLDER). Déjalo en "" para usar solo el fondo liso.
// Septiembre y octubre: reemplaza los textos "Escribe aquí..." por recuerdos reales.
const FOLDER = "../../assets/imgnosotros/";
// Opacidad de la foto de fondo (0 = invisible, 1 = totalmente visible). Sube o baja a tu gusto.
const BG_OPACITY = 0.35;
const MONTHS = [
  { m: "Mayo", y: 2026, bg: "foto3.jpg", cat: "Los inicios", h: 340, t: "Empezamos a conocernos", s: "Con inconvenientes pero con ganas de seguir.",
    pages: [ { txt: "13 de mayo. Todo empezó sin que ninguno de los dos supiera lo que venía, fue hasta algo raro de hecho." },
             { txt: "tuvimos unos cuantos inconvenientes que supimos resolver y llegar a quienes somos hoy" } ] },
  { m: "Junio", y: 2026, bg: "foto41.jpg", cat: "El aceptamiento y las salidas", h: 20, t: "Nuestros inicios", s: "De a poco fuimos mejorando y madurando como pareja",
    pages: [ { txt: "Los inconvenientes dejaron de ser un problema, los futuros inciertos poco a poco fueron desvaneciendose para conformar algo sólido con el tiempo" },
             { txt: "Recién empezamos a conocernos realmente, por encima de todo " } ] },
  { m: "Julio", y: 2026, bg: "foto13.jpg", cat: "La costumbre y el amor", h: 310, t: "Las salidas a lugares bonitos", s: "el sentimiento de estar más juntos",
    pages: [ { txt: "18 de julio." },
             { txt: "Las salidas dejaron de ser planes y se volvieron costumbre." },
             { txt: "Hablar, reírnos, vernos, los berrinches. Cada vez más natural." } ] },
  { m: "Agosto", y: 2026, bg: "foto14.jpg", cat: "Tu día", h: 160, t: "Tu cumpleaños", s: "Tres meses, unos tulipanes hechos a mano y el inicio de esta página solo para ti.",
    pages: [ { txt: "Tu cumpleaños fue un día muy bonito, planeado por mi mami y por mí, cada detalle y cada momento fueron hechos con amor para que te sientas querida, para que me sientas cómo soy." },
             { txt: "Tres meses de conocernos, unos tulipanes hechos a mano, un picnic con ropa bonita, un lugar solitario para tener tranquilidad, actividades y regalitos." } ] },
  { m: "Septiembre", y: 2026, bg: "foto31.jpg", cat: "Nosotros", h: 265, t: "Cada vez más nosotros", s: "De cualquier manera encontrabamos la forma de vernos.",
    pages: [ { txt: "Este mes fue especial porque al fin pude conocer a tu papá, nos salió todo tan bien que pareciera hasta planeado por ambos." },
             { txt: "Todo empezó a ser mucho mejor, no teniamos el miedo del qué dirá tu papá, las salidas empezaron a sentirse un poco más libres"}] },
            
  { m: "Octubre", y: 2026, bg: "foto36.jpg", cat: "Ola sip", h: 35, t: "Salidas sin miedo", s: "",
    pages: [ { txt: "Empecé a pedirle permisos a tu papá para salir contigo jeje, supimos ya completamente que le caía muy bien y hasta mijo me dice Don Victor." } ] }
];