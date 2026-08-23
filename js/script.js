const startButton = document.getElementById("startButton");
const mainContent = document.getElementById("mainContent");
const intro = document.querySelector(".intro");


// Estrellas de fondo (✦ ✧ ·) que titilan al azar por toda la página.
// Se generan una sola vez, en posiciones y tiempos aleatorios,
// pensadas para acompañar sin llamar la atención.
function initAmbientStars() {

    const container = document.getElementById("ambientStars");
    if (!container || container.dataset.built) return;

    const symbols = ["✦", "✧", "·", "·"]; // "·" repetido a propósito: más frecuente y discreto
    const colorClasses = ["", "purple", "gold"]; // "" = blanco (var(--white))

    const isMobile = window.innerWidth < 600;
    const count = isMobile ? 16 : 26;

    for (let i = 0; i < count; i++) {

        const star = document.createElement("span");
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

        star.className = "ambient-star" + (colorClass ? " " + colorClass : "");
        star.textContent = symbol;

        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = symbol === "·" ? 6 + Math.random() * 5 : 10 + Math.random() * 12;
        const duration = 3 + Math.random() * 5;
        const delay = -(Math.random() * duration * 2); // arranca a mitad de ciclo, en distintos puntos
        const peakOpacity = 0.25 + Math.random() * 0.35; // nunca demasiado brillante

        star.style.top = top + "%";
        star.style.left = left + "%";
        star.style.fontSize = size + "px";
        star.style.animationDuration = duration + "s";
        star.style.animationDelay = delay + "s";
        star.style.setProperty("--peak", peakOpacity);

        container.appendChild(star);
    }

    container.dataset.built = "true";

}

// =========================
// PUZZLE: CÓDIGO -> PÁGINA
// =========================
//
// Cada código lleva a una página dentro del proyecto.
const PUZZLE_CODES = {
    "rdelr": "puzzles/RdelR.html",
    "cocolon": "puzzles/YoPaTi.html",
    "citasgg": "puzzles/CitasPlaneadas.html",
    "recuerdos": "https://drive.google.com/drive/folders/1oWHLIezeag-UPwRhGHqrDzCS1WmvJGU4?usp=sharing",
    // "otrocodigo": "puzzles/puzzle2.html",
};

function initPuzzle() {

    const toggle = document.getElementById("puzzleToggle");
    const panel = document.getElementById("puzzlePanel");
    const form = document.getElementById("puzzleForm");
    const input = document.getElementById("puzzleInput");
    const feedback = document.getElementById("puzzleFeedback");

    if (!toggle || !panel || !form || !input || !feedback) return;

    toggle.addEventListener("click", () => {

        const willOpen = !panel.classList.contains("open");

        panel.classList.toggle("open", willOpen);
        panel.setAttribute("aria-hidden", String(!willOpen));
        toggle.setAttribute("aria-expanded", String(willOpen));

        if (willOpen) {
            setTimeout(() => input.focus(), 300);
        } else {
            feedback.textContent = "";
            feedback.className = "puzzle-feedback";
            form.reset();
        }

    });

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const code = input.value.trim().toLowerCase();
        const destination = PUZZLE_CODES[code];

        if (!code) return;

        if (destination) {

            feedback.textContent = "✧ es ese... un momento";
            feedback.className = "puzzle-feedback visible success";

            setTimeout(() => {
                window.location.href = destination;
            }, 650);

        } else {

            feedback.textContent = "ese código todavía no es válido";
            feedback.className = "puzzle-feedback visible error";
            input.classList.add("shake");
            setTimeout(() => input.classList.remove("shake"), 400);

        }

    });

}

// =========================
// CONTADOR DINÁMICO
// =========================
//
// Fecha de inicio: 13 de mayo de 2026, 16:21:02.
// Nota: el mes en JavaScript es 0-indexado (0 = enero), por eso
// mayo se escribe como 4.
const COUNTER_START = new Date(2026, 4, 13, 16, 21, 2);

// Descompone el tiempo transcurrido entre "start" y "now" en
// años, meses, semanas, días, horas, minutos y segundos,
// tomando en cuenta la duración real de cada mes (no un promedio).
function getElapsedBreakdown(start, now) {

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) {
        seconds += 60;
        minutes -= 1;
    }
    if (minutes < 0) {
        minutes += 60;
        hours -= 1;
    }
    if (hours < 0) {
        hours += 24;
        days -= 1;
    }
    if (days < 0) {
        // Días del mes anterior al mes actual de "now"
        const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += daysInPrevMonth;
        months -= 1;
    }
    if (months < 0) {
        months += 12;
        years -= 1;
    }

    const weeks = Math.floor(days / 7);
    days = days % 7;

    return { years, months, weeks, days, hours, minutes, seconds };

}

function pad2(n) {
    return String(Math.max(n, 0)).padStart(2, "0");
}

function updateCounter() {

    const cYears = document.getElementById("cYears");
    if (!cYears) return; // esta página no tiene el contador

    const now = new Date();

    // Si alguien abre la página antes de la fecha de inicio,
    // simplemente se queda en ceros en vez de mostrar negativos.
    if (now < COUNTER_START) {
        ["cYears","cMonths","cWeeks","cDays","cHours","cMinutes","cSeconds"]
            .forEach(id => document.getElementById(id).textContent = "00");
        return;
    }

    const t = getElapsedBreakdown(COUNTER_START, now);

    document.getElementById("cYears").textContent = pad2(t.years);
    document.getElementById("cMonths").textContent = pad2(t.months);
    document.getElementById("cWeeks").textContent = pad2(t.weeks);
    document.getElementById("cDays").textContent = pad2(t.days);
    document.getElementById("cHours").textContent = pad2(t.hours);
    document.getElementById("cMinutes").textContent = pad2(t.minutes);
    document.getElementById("cSeconds").textContent = pad2(t.seconds);

}

function initCounter() {
    if (!document.getElementById("cYears")) return;
    updateCounter();
    setInterval(updateCounter, 1000);
}

initAmbientStars();
initPuzzle();
initCounter();
initHeartHunt();


startButton.addEventListener("click", () => {

    burstHearts();

    intro.classList.add("intro-hide");

    setTimeout(() => {

        intro.style.display = "none";

        mainContent.style.display = "block";

        mainContent.scrollIntoView({
            behavior: "smooth"
        });

        initPetals();
        initRevealObserver();
        initScrollProgress();

    }, 700);

});


// Corazones que brotan del botón al presionar "Descubrir",
// se dispersan y se desvanecen solos, dando un toque de misterio
// justo antes de que aparezca el contenido.
function burstHearts() {

    const container = document.getElementById("heartsBurst");
    if (!container) return;

    const rect = startButton.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const colors = ["var(--purple-light)", "var(--gold)", "var(--amber)", "var(--white)"];
    const count = 50;

    for (let i = 0; i < count; i++) {

        const heart = document.createElement("span");
        heart.className = "heart";
        heart.textContent = "♥";

        const startX = originX + (Math.random() * 60 - 30);
        const startY = originY + (Math.random() * 30 - 15);

        const angle = Math.random() * Math.PI - (Math.PI / 2) - (Math.PI / 4);
        const distance = 140 + Math.random() * 260;
        const endX = startX + Math.cos(angle) * distance;
        const endY = startY + Math.sin(angle) * distance - 60;

        const size = 16 + Math.random() * 18;
        const duration = 1.7 + Math.random() * 1.3;
        const delay = Math.random() * 0.35;
        const r0 = Math.random() * 40 - 20;
        const r1 = r0 + (Math.random() * 70 - 35);

        heart.style.fontSize = size + "px";
        heart.style.color = colors[i % colors.length];
        heart.style.setProperty("--x0", startX + "px");
        heart.style.setProperty("--y0", startY + "px");
        heart.style.setProperty("--x1", endX + "px");
        heart.style.setProperty("--y1", endY + "px");
        heart.style.setProperty("--r0", r0 + "deg");
        heart.style.setProperty("--r1", r1 + "deg");
        heart.style.animationDuration = duration + "s";
        heart.style.animationDelay = delay + "s";

        container.appendChild(heart);

        setTimeout(() => heart.remove(), (duration + delay) * 1000 + 200);
    }

}


// Crea los pétalos que caerán dentro de la sección de tulipanes,
// cada uno con tamaño, velocidad y deriva ligeramente distintos.
function initPetals() {

    const container = document.getElementById("petalsContainer");
    if (!container || container.dataset.built) return;

    const colors = [
        "linear-gradient(135deg, var(--purple-light), var(--purple))",
        "linear-gradient(135deg, var(--gold), var(--amber))"
    ];

    const count = 20;

    for (let i = 0; i < count; i++) {

        const petal = document.createElement("div");
        petal.className = "petal";

        const size = 8 + Math.random() * 8;
        const left = Math.random() * 100;
        const duration = 9 + Math.random() * 7;
        const delay = Math.random() * -duration;
        const drift = Math.round(Math.random() * 70 - 35) + "px";

        petal.style.width = size + "px";
        petal.style.height = size + "px";
        petal.style.left = left + "%";
        petal.style.background = colors[i % 2];
        petal.style.animationDuration = duration + "s";
        petal.style.animationDelay = delay + "s";
        petal.style.setProperty("--drift", drift);

        container.appendChild(petal);
    }

    container.dataset.built = "true";

}


// Barra fina que muestra cuánto llevas del recorrido.
// Solo se activa dentro de mainContent (después de la intro).
function initScrollProgress() {

    const progressEl = document.getElementById("scrollProgress");
    const fillEl = document.getElementById("scrollProgressFill");
    if (!progressEl || !fillEl) return;

    let ticking = false;

    function update() {

        const total = mainContent.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY - mainContent.offsetTop;
        const pct = Math.min(Math.max(scrolled / total, 0), 1);

        fillEl.style.height = (pct * 100) + "%";

        const withinRange = scrolled > -window.innerHeight * 0.6 &&
                             scrolled < total + window.innerHeight * 0.6;
        progressEl.classList.toggle("visible", withinRange);

        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();

}


// =========================
// CAZA DE CORAZONES
// =========================
//
// 5 corazones escondidos por distintas secciones. Al encontrar los 5,
// se revela un mensaje en etapas y, al final, el código de un puzzle nuevo.
function initHeartHunt() {

    const hearts = document.querySelectorAll(".hunt-heart");
    if (!hearts.length) return;

    const tracker = document.getElementById("heartTracker");
    const trackerCount = document.getElementById("heartTrackerCount");
    let found = 0;

    function handleFound(heart) {

        if (heart.classList.contains("found")) return;

        heart.classList.add("found");
        heart.textContent = "♥";
        heart.setAttribute("aria-disabled", "true");
        found++;

        if (tracker) tracker.classList.add("visible");
        if (trackerCount) trackerCount.textContent = String(found);

        if (found === hearts.length) {
            setTimeout(openHeartHuntOverlay, 500);
        }

    }

    hearts.forEach(heart => {

        heart.addEventListener("click", () => handleFound(heart));

        heart.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleFound(heart);
            }
        });

    });

    // El contador aparece apenas se encuentra el primero, no antes.
    if (tracker) tracker.classList.remove("visible");

}


// Revela el mensaje final en tres tiempos y, al último,
// el código que desbloquea la página de citas pendientes.
function openHeartHuntOverlay() {

    const overlay = document.getElementById("heartHuntOverlay");
    if (!overlay) return;

    const line2 = overlay.querySelector(".hh-line-2");
    const codeReveal = overlay.querySelector(".hh-code-reveal");
    const closeBtn = document.getElementById("heartHuntClose");

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");

    setTimeout(() => line2 && line2.classList.add("show"), 1700);
    setTimeout(() => codeReveal && codeReveal.classList.add("show"), 3400);

    function closeOverlay() {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeOverlay, { once: true });
    }

}


// Revela cada sección cuando entra en pantalla y la vuelve a ocultar
// cuando sale, para que el scroll se sienta vivo en ambas direcciones.
function initRevealObserver() {

    const revealEls = document.querySelectorAll(".reveal");
    const tulip = document.querySelector(".tulip-svg");
    const petalsContainer = document.getElementById("petalsContainer");

    if (!("IntersectionObserver" in window)) {
        revealEls.forEach(el => el.classList.add("in-view"));
        if (tulip) tulip.classList.add("bloom");
        if (petalsContainer) petalsContainer.classList.add("active");
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {

            entry.target.classList.toggle("in-view", entry.isIntersecting);

            if (entry.target.classList.contains("flowers-section")) {
                if (tulip) tulip.classList.toggle("bloom", entry.isIntersecting);
                if (petalsContainer) petalsContainer.classList.toggle("active", entry.isIntersecting);
            }

        });
    }, {
        threshold: 0.2,
        rootMargin: "-10% 0px -10% 0px"
    });

    revealEls.forEach(el => observer.observe(el));

}
