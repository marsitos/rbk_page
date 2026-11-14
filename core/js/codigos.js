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
            // Si algún id se quita de codigos-data.js, simplemente deja de mostrarse
            return Array.isArray(datos) ? datos.filter(d => d && buscar(d.codigo)) : [];
        } catch (_) { return []; }
    }
    function guardar(lista) {
        try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch (_) { /* sin almacenamiento: se ignora */ }
    }
    const hasOwn = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
    const existe = codigo => hasOwn(PUZZLE_CODES, codigo); // ¿es un código que se puede escribir?
    const extras = typeof PAGINAS_DESBLOQUEABLES !== "undefined" ? PAGINAS_DESBLOQUEABLES : {};
    const buscar = id => hasOwn(PUZZLE_CODES, id) ? PUZZLE_CODES[id] : (hasOwn(extras, id) ? extras[id] : null);

    // Una misma página puede haberse desbloqueado de dos formas (con código y jugando): se muestra una sola vez
    function unicas() {
        const porDestino = new Map();
        leer().forEach(d => {
            const info = buscar(d.codigo), esCodigo = existe(d.codigo), previo = porDestino.get(info.destino);
            if (!previo) porDestino.set(info.destino, { d, info, codigo: esCodigo ? d.codigo : null });
            else if (esCodigo && !previo.codigo) previo.codigo = d.codigo;
        });
        return [...porDestino.values()];
    }

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
        document.body.classList.add("dsc-abierto");
        if (enfocar) setTimeout(() => enfocar.focus(), 300);
    }
    function cerrar() {
        if (!abierta) return;
        if (abierta.contains(document.activeElement)) document.activeElement.blur(); // el foco no puede quedar en algo oculto
        abierta.classList.remove("open");
        abierta.setAttribute("aria-hidden", "true");
        abierta = null;
        document.body.style.overflow = "";
        document.body.classList.remove("dsc-abierto");
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
        const items = unicas();
        contenedor.hidden = items.length === 0;
        insignia.textContent = items.length ? "· " + items.length : "";
        boton.classList.toggle("tiene-nuevas", leer().some(d => !d.visto));
    }

    function construirLista() {
        const items = unicas();
        lista.innerHTML = "";
        vacio.hidden = items.length > 0;

        let nuevas = 0;
        items.forEach(({ d, info, codigo }, i) => {
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
            a.querySelector(".dsc-code").textContent = codigo ? "código · " + codigo : (info.etiqueta || "");
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
        const todos = leer();
        if (todos.some(d => !d.visto)) {
            guardar(todos.map(d => Object.assign({}, d, { visto: true })));
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