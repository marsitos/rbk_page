// ===== CÓDIGOS Y PÁGINAS =====
// Cada código lleva a una página. "nombre" es lo que se ve en el menú "Desbloqueados".
// Para agregar uno nuevo, copia una línea y cambia el código, el destino y el nombre.
const PUZZLE_CODES = {
    "rdelrjeje":     { destino: "puzzles/RdelR.html",           nombre: "RdelR" },
    "cocolon":       { destino: "puzzles/YoPaTi.html",          nombre: "Yo pa ti" },
    "citasgg":       { destino: "puzzles/CitasPlaneadas.html",  nombre: "Citas planeadas" },
    "recuerdos":     { destino: "https://drive.google.com/drive/folders/1oWHLIezeag-UPwRhGHqrDzCS1WmvJGU4?usp=sharing", nombre: "Recuerdos", externo: true },
    "nuestrosmeses": { destino: "puzzles/NuestrosMeses.html",   nombre: "Nuestros meses" },
    "palabras":      { destino: "puzzles/Carta.html",           nombre: "Carta" },
    "13noviembre":   { destino: "puzzles/NuestraFecha.html",    nombre: "Nuestra fecha" }
};

// Páginas que se desbloquean jugando o visitándolas (no se escriben con código).
// "etiqueta" es la frase que aparece en el menú en lugar del código.
const PAGINAS_DESBLOQUEABLES = {
    "interior":     { destino: "puzzles/Interior.html",     nombre: "Interior",      etiqueta: "desbloqueada con el puzzle" },
    "nuestrafecha": { destino: "puzzles/NuestraFecha.html", nombre: "Nuestra fecha", etiqueta: "desde que dijiste que sí" }
};
