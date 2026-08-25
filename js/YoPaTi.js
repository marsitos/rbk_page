// =========================
// ESTRELLAS DE AMBIENTE
// =========================
function initAmbientStars() {

    const container = document.getElementById("ambientStars");
    if (!container || container.dataset.built) return;

    const symbols = ["✦", "✧", "·", "·"];
    const colorClasses = ["", "purple", "gold"];

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
        const delay = -(Math.random() * duration * 2);
        const peakOpacity = 0.25 + Math.random() * 0.35;

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
// SOBRE: ABRIR LA CARTA
// =========================
function initEnvelope() {

    const scene = document.getElementById("envelopeScene");
    const button = document.getElementById("envelopeButton");
    const wrapper = document.getElementById("letterWrapper");

    if (!scene || !button || !wrapper) return;

    button.addEventListener("click", () => {

        if (button.classList.contains("open")) return;

        button.classList.add("open");

        // Deja ver primero la animación del sobre abriéndose
        // antes de revelar la carta.
        setTimeout(() => {

            wrapper.hidden = false;
            scene.classList.add("hidden");

            requestAnimationFrame(() => {
                wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
            });

            initLetterReveal();
            initScrollProgress();
            initAmbientHeartTrickle();
            initBgPhotos();

            setTimeout(() => {
                scene.style.display = "none";
            }, 700);

        }, 1000);

    });

}

// =========================
// PALABRA POR PALABRA
// =========================
function wrapWordsIn(node, chunkSize) {

    Array.from(node.childNodes).forEach(child => {

        if (child.nodeType === Node.TEXT_NODE) {

            const frag = document.createDocumentFragment();
            const parts = child.textContent.split(/(\s+)/);
        
            let pendingSpan = null;
            let wordsInSpan = 0;
            let bufferedSpace = "";

            parts.forEach(part => {
                if (part.trim() === "") {
                    bufferedSpace += part;
                } else {
                    if (!pendingSpan || wordsInSpan >= chunkSize) {
                        if (bufferedSpace) {
                            frag.appendChild(document.createTextNode(bufferedSpace));
                            bufferedSpace = "";
                        }
                        pendingSpan = document.createElement("span");
                        pendingSpan.className = "word";
                        frag.appendChild(pendingSpan);
                        wordsInSpan = 0;
                    } else if (bufferedSpace) {
                        pendingSpan.textContent += bufferedSpace;
                        bufferedSpace = "";
                    }
                    pendingSpan.textContent += part;
                    wordsInSpan++;
                }
            });

            if (bufferedSpace) {
                frag.appendChild(document.createTextNode(bufferedSpace));
            }

            node.replaceChild(frag, child);

        } else if (child.nodeType === Node.ELEMENT_NODE) {
            wrapWordsIn(child, chunkSize);
        }

    });

}

function initWordReveal() {

    const isMobile = window.innerWidth < 600;
    const chunkSize = isMobile ? 3 : 1;

    const paragraphs = document.querySelectorAll(".letter-text");

    paragraphs.forEach(p => {
        wrapWordsIn(p, chunkSize);
        const words = p.querySelectorAll(".word");
        words.forEach((word, i) => word.style.setProperty("--i", i));
    });

}

// =========================
// REVELADO DE PÁRRAFOS AL HACER SCROLL
// =========================
function initLetterReveal() {

    initWordReveal();

    const sections = document.querySelectorAll(".letter-section.reveal");

    if (!("IntersectionObserver" in window)) {
        sections.forEach(el => el.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
    }, {
        threshold: 0.25,
        rootMargin: "-8% 0px -8% 0px"
    });

    sections.forEach(el => observer.observe(el));

    initSignatureHearts();
    initTapHearts();

}

// =========================
// BARRA DE PROGRESO DE LECTURA
// =========================
function initScrollProgress() {

    const progressEl = document.getElementById("scrollProgress");
    const fillEl = document.getElementById("scrollProgressFill");
    const wrapper = document.getElementById("letterWrapper");
    if (!progressEl || !fillEl || !wrapper) return;

    let ticking = false;

    function update() {

        const total = wrapper.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY - wrapper.offsetTop;
        const pct = Math.min(Math.max(scrolled / total, 0), 1);

        fillEl.style.height = (pct * 100) + "%";
        progressEl.classList.toggle("visible", scrolled > -window.innerHeight * 0.3);

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
// TOCAR EL TEXTO DEJA UN CORAZÓN
// =========================
function initTapHearts() {

    const container = document.getElementById("heartsBurst");
    const paragraphs = document.querySelectorAll(".letter-text");
    if (!container || !paragraphs.length) return;

    paragraphs.forEach(p => {
        p.classList.add("tappable");
        p.addEventListener("click", (event) => {
            spawnTapHeart(container, event.clientX, event.clientY);
        });
    });

    // Pista discreta, una sola vez, en el primer párrafo.
    const firstSection = document.querySelector(".letter-section.reveal");
    if (firstSection) {
        const hint = document.createElement("span");
        hint.className = "tap-hint";
        hint.textContent = "toca el texto para dejar un corazón";
        firstSection.appendChild(hint);
    }

}

function spawnTapHeart(container, x, y) {

    const colors = ["var(--purple-light)", "var(--gold)", "var(--amber)", "var(--white)"];
    const count = 5;

    for (let i = 0; i < count; i++) {

        const heart = document.createElement("span");
        heart.className = "heart";
        heart.textContent = "♥";

        const angle = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 65;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance - 45;

        const size = 12 + Math.random() * 12;
        const duration = 1 + Math.random() * 0.7;
        const r0 = Math.random() * 40 - 20;
        const r1 = r0 + (Math.random() * 60 - 30);

        heart.style.fontSize = size + "px";
        heart.style.color = colors[i % colors.length];
        heart.style.setProperty("--x0", x + "px");
        heart.style.setProperty("--y0", y + "px");
        heart.style.setProperty("--x1", endX + "px");
        heart.style.setProperty("--y1", endY + "px");
        heart.style.setProperty("--r0", r0 + "deg");
        heart.style.setProperty("--r1", r1 + "deg");
        heart.style.animationDuration = duration + "s";

        container.appendChild(heart);

        setTimeout(() => heart.remove(), duration * 1000 + 200);
    }

}

// =========================
// GOTEO AMBIENTAL DE CORAZONES
// Uno ocasional mientras se lee, para que el fondo no se
// sienta estático entre párrafo y párrafo.
// =========================
function initAmbientHeartTrickle() {

    const container = document.getElementById("heartsBurst");
    if (!container) return;

    function loop() {
        spawnDriftingHearts(container, 1);
        const next = 14000 + Math.random() * 16000; // cada 14-30s
        setTimeout(loop, next);
    }

    setTimeout(loop, 6000);

}

// =========================
// CORAZONES QUE SUBEN AL LLEGAR A LA FIRMA
// (una sola vez, más suaves que el "burst" de la página principal)
// =========================
function initSignatureHearts() {

    const section = document.getElementById("signatureSection");
    const container = document.getElementById("heartsBurst");
    if (!section || !container) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !container.dataset.played) {
                spawnDriftingHearts(container, 22);
                container.dataset.played = "true";
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(section);

}

function spawnDriftingHearts(container, count) {

    const colors = ["var(--purple-light)", "var(--gold)", "var(--amber)", "var(--white)"];
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (let i = 0; i < count; i++) {

        const heart = document.createElement("span");
        heart.className = "heart";
        heart.textContent = "♥";

        const startX = Math.random() * vw;
        const startY = vh + 20 + Math.random() * 40;
        const endX = startX + (Math.random() * 160 - 80);
        const endY = startY - (vh * 0.75 + Math.random() * vh * 0.35);

        const size = 14 + Math.random() * 16;
        const duration = 4 + Math.random() * 3;
        const delay = Math.random() * 2.2;
        const r0 = Math.random() * 30 - 15;
        const r1 = r0 + (Math.random() * 50 - 25);

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

// =========================
// RASTRO DE CHISPITAS
// Sigue al cursor (o al dedo, con Pointer Events) por toda la
// página, con límites de tiempo y distancia para no saturar.
// =========================
function initCursorTrail() {

    const container = document.getElementById("heartsBurst");
    if (!container || !window.PointerEvent) return;

    const symbols = ["✦", "✧", "♥"];
    const colorClasses = ["", "gold", "amber"];

    let lastX = null;
    let lastY = null;
    let lastTime = 0;

    const THROTTLE_MS = 90;
    const MIN_DIST = 26;

    function spawnSpark(x, y) {

        const spark = document.createElement("span");
        const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

        spark.className = "cursor-spark" + (colorClass ? " " + colorClass : "");
        spark.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const size = 8 + Math.random() * 8;
        const dx = (Math.random() * 34 - 17) + "px";
        const dy = -(22 + Math.random() * 30) + "px";

        spark.style.fontSize = size + "px";
        spark.style.setProperty("--x", x + "px");
        spark.style.setProperty("--y", y + "px");
        spark.style.setProperty("--dx", dx);
        spark.style.setProperty("--dy", dy);

        container.appendChild(spark);

        setTimeout(() => spark.remove(), 950);

    }

    window.addEventListener("pointermove", (event) => {

        // En táctil, el scroll también dispara "pointermove", lo que
        // generaba chispitas justo mientras se hacía scroll y competía
        // con la animación de aparición del texto. Solo mouse/pen.
        if (event.pointerType === "touch") return;

        const now = Date.now();
        if (now - lastTime < THROTTLE_MS) return;

        if (lastX !== null) {
            const dist = Math.hypot(event.clientX - lastX, event.clientY - lastY);
            if (dist < MIN_DIST) return;
        }

        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = now;

        spawnSpark(event.clientX, event.clientY);

    }, { passive: true });

}

// =========================
// FOTOS DE FONDO (DESTELLOS)
// =========================
const BG_PHOTOS = [
    "../assets/imgnosotros/foto1.jpeg",
    "../assets/imgnosotros/foto2.jpeg",
    "../assets/imgnosotros/foto3.jpg",
    "../assets/imgnosotros/foto4.jpg",
    "../assets/imgnosotros/foto5.jpg",
    "../assets/imgnosotros/foto6.jpg",
    "../assets/imgnosotros/foto7.jpg",
    "../assets/imgnosotros/foto8.jpg",
    "../assets/imgnosotros/foto9.jpg",
    "../assets/imgnosotros/foto10.jpg",
    "../assets/imgnosotros/foto11.jpg",
    "../assets/imgnosotros/foto12.jpg",
    "../assets/imgnosotros/foto13.jpg",
    "../assets/imgnosotros/foto14.jpg",
    "../assets/imgnosotros/foto15.jpg",
    "../assets/imgnosotros/foto16.jpeg",
    "../assets/imgnosotros/foto17.jpg",
    "../assets/imgnosotros/foto18.jpg",
    "../assets/imgnosotros/foto19.jpg",
    "../assets/imgnosotros/foto20.jpg",
];

function initBgPhotos() {

    const container = document.getElementById("bgPhotos");
    if (!container || !BG_PHOTOS.length) return;

    function spawnPhoto() {

        const src = BG_PHOTOS[Math.floor(Math.random() * BG_PHOTOS.length)];

        const img = document.createElement("img");
        img.className = "bg-photo";
        img.src = src;
        img.alt = "";
        img.loading = "lazy";

        const isMobile = window.innerWidth < 600;
        const size = (isMobile ? 100 : 150) + Math.random() * (isMobile ? 60 : 110);
        const top = Math.random() * 78;
        const left = Math.random() * 78;
        const duration = 9 + Math.random() * 6;
        const peak = 0.15 + Math.random() * 0.13;

        img.style.width = size + "px";
        img.style.height = (size * 1.15) + "px";
        img.style.top = top + "%";
        img.style.left = left + "%";
        img.style.animationDuration = duration + "s";
        img.style.setProperty("--peak", peak);

        // Si la foto todavía no existe en el proyecto, se retira
        // en silencio en vez de mostrar un ícono roto.
        img.addEventListener("error", () => img.remove());
        img.addEventListener("animationend", () => img.remove());

        container.appendChild(img);

    }

    function loop() {
        const batch = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < batch; i++) {
            setTimeout(spawnPhoto, i * 900);
        }
        const next = 7000 + Math.random() * 7000; // cada 7-14s
        setTimeout(loop, next);

    }
    setTimeout(loop, 4000);
}

initAmbientStars();
initEnvelope();
initCursorTrail();
