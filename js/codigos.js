// ===== Códigos, "Descubiertas" y código rápido =====
// - Valida los códigos (panel del final y ventana rápida de la intro).
// - Guarda en este dispositivo cada página desbloqueada (localStorage) para no volver a escribir el código.
// - Muestra el menú "Desbloqueados" con una animación de desbloqueo la primera vez que aparece cada una.
(function () {
    "use strict";

    const KEY = "descubiertas.v1";
    const $ = id => document.getElementById(id);

    // ---------- Memoria del dispositivo ----------
    function leer() {
        try {
            const datos = JSON.parse(localStorage.getItem(KEY));
            // Si algún código se quita de codigos-data.js, simplemente deja de mostrarse
            return Array.isArray(datos) ? datos.filter(d => d && existe(d.codigo)) : [];
        } catch (_) { return []; }
    }
    function guardar(lista) {
        try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch (_) { /* sin almacenamiento: se ignora */ }
    }
    const existe = codigo => Object.prototype.hasOwnProperty.call(PUZZLE_CODES, codigo);

    function registrar(codigo) {
        const lista = leer();
        if (lista.some(d => d.codigo === codigo)) return;
        lista.push({ codigo, ts: Date.now(), visto: false });
        guardar(lista);
    }

    // ---------- Validar un código (lo usan los dos formularios) ----------
    function verificar(crudo, input, feedback) {
        const codigo = crudo.trim().toLowerCase();
        if (!codigo) return;

        if (existe(codigo)) {
            registrar(codigo);
            feedback.textContent = "✧ es ese... un momento";
            feedback.className = "puzzle-feedback visible success";
            setTimeout(() => { window.location.href = PUZZLE_CODES[codigo].destino; }, 650);
        } else {
            feedback.textContent = "ese código todavía no es válido";
            feedback.className = "puzzle-feedback visible error";
            input.classList.add("shake");
            setTimeout(() => input.classList.remove("shake"), 400);
        }
    }

    // ---------- Ventanas (overlays) ----------
    let abierta = null;
    function abrir(overlay, enfocar) {
        cerrar();
        abierta = overlay;
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (enfocar) setTimeout(() => enfocar.focus(), 300);
    }
    function cerrar() {
        if (!abierta) return;
        abierta.classList.remove("open");
        abierta.setAttribute("aria-hidden", "true");
        abierta = null;
        document.body.style.overflow = "";
    }
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });

    // ---------- Panel de código del final de la página (el de siempre) ----------
    function iniciarPanel() {
        const toggle = $("puzzleToggle"), panel = $("puzzlePanel"), form = $("puzzleForm");
        const input = $("puzzleInput"), feedback = $("puzzleFeedback");
        if (!toggle || !panel || !form || !input || !feedback) return;

        toggle.addEventListener("click", () => {
            const abrir = !panel.classList.contains("open");
            panel.classList.toggle("open", abrir);
            panel.setAttribute("aria-hidden", String(!abrir));
            toggle.setAttribute("aria-expanded", String(abrir));
            if (abrir) setTimeout(() => input.focus(), 300);
            else { feedback.textContent = ""; feedback.className = "puzzle-feedback"; form.reset(); }
        });
        form.addEventListener("submit", e => { e.preventDefault(); verificar(input.value, input, feedback); });
    }

    // ---------- Código rápido (botón de la intro) ----------
    function iniciarRapido() {
        const abrirBtn = $("quickCodeToggle"), overlay = $("quickOverlay"), form = $("quickForm");
        const input = $("quickInput"), feedback = $("quickFeedback"), aLista = $("quickToList");
        if (!abrirBtn || !overlay || !form || !input || !feedback) return;

        abrirBtn.addEventListener("click", () => {
            feedback.textContent = ""; feedback.className = "puzzle-feedback"; form.reset();
            if (aLista) aLista.hidden = leer().length === 0; // si ya hay descubiertas, se ofrece verlas
            abrir(overlay, input);
        });
        $("quickClose").addEventListener("click", cerrar);
        overlay.addEventListener("click", e => { if (e.target === overlay) cerrar(); });
        form.addEventListener("submit", e => { e.preventDefault(); verificar(input.value, input, feedback); });
        if (aLista) aLista.addEventListener("click", abrirMenu);
    }

    // ---------- Menú "Desbloqueados" ----------
    const menu = $("discoveredOverlay"), lista = $("discoveredList"), vacio = $("discoveredEmpty");
    const boton = $("discoveredToggle"), insignia = $("discoveredBadge"), contenedor = $("discoveredWrap");

    // El botón "Descubiertas" solo aparece cuando ya hay algo desbloqueado
    function actualizarBoton() {
        if (!boton || !contenedor) return;
        const items = leer();
        contenedor.hidden = items.length === 0;
        insignia.textContent = items.length ? "· " + items.length : "";
        boton.classList.toggle("tiene-nuevas", items.some(d => !d.visto));
    }

    function construirLista() {
        const items = leer();
        lista.innerHTML = "";
        vacio.hidden = items.length > 0;

        let nuevas = 0;
        items.forEach((d, i) => {
            const info = PUZZLE_CODES[d.codigo];
            const li = document.createElement("li");
            li.className = "dsc-item";

            const a = document.createElement("a");
            a.className = "dsc-row";
            a.href = info.destino;
            if (info.externo) { a.target = "_blank"; a.rel = "noopener"; }
            a.innerHTML =
                '<span class="dsc-lock" aria-hidden="true"><span class="dsc-lock-closed">🔒</span><span class="dsc-lock-open">🔓</span></span>' +
                '<span class="dsc-info"><span class="dsc-name"></span><span class="dsc-code"></span></span>' +
                '<span class="dsc-go" aria-hidden="true">→</span>';
            a.querySelector(".dsc-name").textContent = info.nombre;
            a.querySelector(".dsc-code").textContent = "código · " + d.codigo;
            li.appendChild(a);
            lista.appendChild(li);

            if (d.visto) {
                // Ya la había visto: aparece sin ceremonia
                setTimeout(() => li.classList.add("in", "unlocked"), 80 + i * 70);
            } else {
                // Primera vez: aparece bloqueada y se desbloquea
                const t = 350 + nuevas * 750;
                li.classList.add("locked");
                setTimeout(() => li.classList.add("in"), t);
                setTimeout(() => li.classList.add("unlocked"), t + 650);
                nuevas++;
            }
        });

        // Ya se mostraron: la próxima vez aparecerán normales
        if (items.some(d => !d.visto)) {
            guardar(items.map(d => Object.assign({}, d, { visto: true })));
            if (boton) boton.classList.remove("tiene-nuevas");
        }
    }

    function abrirMenu() {
        if (!menu) return;
        construirLista();
        abrir(menu);
    }

    function iniciarMenu() {
        if (!menu || !boton) return;
        boton.addEventListener("click", abrirMenu);
        $("discoveredClose").addEventListener("click", cerrar);
        menu.addEventListener("click", e => { if (e.target === menu) cerrar(); });
        actualizarBoton();
        // Si vuelve con el botón "atrás" del navegador, la página puede venir de memoria: se refresca el botón
        window.addEventListener("pageshow", e => { if (e.persisted) actualizarBoton(); });
    }

    iniciarPanel();
    iniciarRapido();
    iniciarMenu();
})();
