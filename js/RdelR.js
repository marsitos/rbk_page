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
  "",
  
  "",

  "",
  
  "",
  
  "",
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
