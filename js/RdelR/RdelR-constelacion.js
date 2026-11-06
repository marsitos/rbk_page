// ===== Constelación: 5 estrellas que se desbloquean una por una =====
const virgoStars = document.querySelectorAll(".virgo-star[data-index]");
let currentVirgoStar = 0;

const modal = document.querySelector(".text-modal");
const modalText = document.getElementById("star-text");
const closeBtn = document.getElementById("closeText");
const ULTIMA = virgoStars.length - 1; // la última estrella es la pregunta

virgoStars.forEach(star => {
  star.addEventListener("click", () => {
    if (!star.classList.contains("active")) return;

    const index = Number(star.dataset.index);
    if (index === ULTIMA) {
      abrirPregunta(); // definida en RdelR-pregunta.js
      return;
    }
    modalText.textContent = VIRGO_TEXTOS[index];
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
