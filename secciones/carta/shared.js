// Aparición suave de los elementos .rv al entrar en pantalla.
(function () {
    const els = document.querySelectorAll(".rv");
    els.forEach((el, i) => {
        if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 6) * 0.12 + "s");
    });
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
    }, { threshold: 0.2 });
    els.forEach(el => io.observe(el));
})();

// Lluvia de corazones para celebrar.
function burst(n) {
    n = n || 36;
    const colors = ["#FCD34D", "#C4B5FD", "#E7A0AE", "#F59E0B"];
    for (let i = 0; i < n; i++) {
        const h = document.createElement("span");
        h.className = "hb";
        h.textContent = "♥";
        h.style.left = (innerWidth / 2 + Math.random() * 120 - 60) + "px";
        h.style.top = (innerHeight * 0.6) + "px";
        h.style.fontSize = (16 + Math.random() * 20) + "px";
        h.style.color = colors[i % colors.length];
        h.style.setProperty("--dx", (Math.random() * 400 - 200) + "px");
        h.style.setProperty("--dy", -(120 + Math.random() * 320) + "px");
        h.style.setProperty("--t", (1.8 + Math.random() * 1.4) + "s");
        h.style.animationDelay = Math.random() * 0.4 + "s";
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 4200);
    }
}
