// ===== Fondo: estrellas y estrellas fugaces =====
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];
let lastShootingStar = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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

let last = 0;
function animate(ts) {
  requestAnimationFrame(animate);
  if (ts - last < 33) return;
  const k = Math.min((ts - last) / 16.67, 3);
  last = ts;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();

    star.x += star.vx * k;
    star.y += star.vy * k;

    if (star.x < 0) star.x = canvas.width;
    if (star.x > canvas.width) star.x = 0;
    if (star.y < 0) star.y = canvas.height;
    if (star.y > canvas.height) star.y = 0;
  });

  // Estrella fugaz ocasional
  const now = Date.now();
  if (now - lastShootingStar > Math.random() * 6000 + 6000) {
    createShootingStar();
    lastShootingStar = now;
  }

  shootingStars.forEach(star => {
    ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
      star.x - star.length * Math.cos(star.angle),
      star.y - star.length * Math.sin(star.angle)
    );
    ctx.stroke();

    star.x += star.speed * k;
    star.y += star.speed * k;
    star.opacity -= 0.015 * k;
  });
  shootingStars = shootingStars.filter(star => star.opacity > 0);
}
requestAnimationFrame(animate); 