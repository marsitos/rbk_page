//fondo estrellado
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];
let lastShootingStar = 0;

function resize() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const STAR_COUNT = 120;

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });
    const now = Date.now();

    // Crear estrella fugaz ocasional
    if (now - lastShootingStar > Math.random() * 6000 + 6000) {
        createShootingStar();
        lastShootingStar = now;
    }

    // Dibujar estrellas fugaces
    shootingStars.forEach((star, index) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
            star.x - star.length * Math.cos(star.angle),
            star.y - star.length * Math.sin(star.angle)
        );
        ctx.stroke();

        star.x += star.speed;
        star.y += star.speed;
        star.opacity -= 0.015;

        if (star.opacity <= 0) {
            shootingStars.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}
animate();
function createShootingStar() {
    shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        length: Math.random() * 300 + 200,
        speed: Math.random() * 10 + 15,
        angle: Math.PI / 4,
        opacity: 1
    });
}

//constelación

const virgoStars = document.querySelectorAll(".virgo-star[data-index]");
let currentVirgoStar = 0;

const virgoTexts = [
  "Quería decirte algo desde hace un tiempo, la verdad hubiera sido muy lindo decírtelo en "+
  "fin de año pero tenía mucha pena, aparte tampoco había terminado hasta donde quise "+
  "la página que personalice para tí, aún no la termino y la verdad que no quiero terminarla "+
  "porque el punto principal de la página es para guardar mi perspectiva de la historia "+
  "nuestra, guardar nuestras fotos y de vez en cuando agregarte una que otra cosa bonita. ",
  
  "Me gusta mucho pasar tiempo contigo, me haces sentir tranquilo, tanto que por eso te "+
  "digo que eres mi lugar seguro ya que al verte siempre me da sueño.",

  "En vista de que también has confesado tus sentimientos hacia mí y también por tus "+
  "acciones me gustaría que estemos juntos por mucho tiempo ya que me gustas tal y "+
  "como eres, peleona, cariñosa, amorosa, chistosa, chismosa, linda, por tus ganas de "+
  "hablar, tus ganas de querer y amar, me gustas tú.",
  
  "Sé que sólo llevamos dos meses hablando pero me ha gustado mucho haberte conocido en este tiempo y me gustaría "+
  "mucho más seguir conociéndote, quiero seguir compartiendo cosas contigo y construir algo lindo juntos.",
  
  "Hoy 16 de enero me gustaría estar en promesa contigo, prometo quererte cada día más que el anterior, prometo lealtad "+
  "hacia tu persona y a nuestra relación, honestidad y sobre todo tranquilidad. Ahora ya sabes lo "+
  "que te siento sinceramente y te quería decir que quisiera que seamos novios ¿Aceptas?",
];

const modal = document.querySelector(".text-modal");
const modalText = document.getElementById("star-text");
const closeBtn = document.getElementById("closeText");

virgoStars.forEach(star => {
  star.addEventListener("click", () => {
    if (!star.classList.contains("active")) return;

    const index = Number(star.dataset.index);
    modalText.textContent = virgoTexts[index];
    modal.classList.remove("hidden");
  });
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");

  virgoStars[currentVirgoStar].classList.remove("active");
  virgoStars[currentVirgoStar].classList.add("locked");

  currentVirgoStar++;

  if (virgoStars[currentVirgoStar]) {
    virgoStars[currentVirgoStar].classList.remove("locked");
    virgoStars[currentVirgoStar].classList.add("active");
  }
});
