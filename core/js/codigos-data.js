// ===== CÓDIGOS Y PÁGINAS =====
// Cada código lleva a una página. "nombre" es lo que se ve en el menú "Desbloqueados".
// Para agregar uno nuevo, copia una línea y cambia el código, el destino y el nombre.
const PUZZLE_CODES = {
    "rdelrjeje":     { destino: "secciones/rdelr/RdelR.html",           nombre: "RdelR" },
    "cocolon":       { destino: "secciones/yo-pa-ti/YoPaTi.html",          nombre: "Yo pa ti" },
    "citasgg":       { destino: "secciones/citas-planeadas/citas-planeadas.html",  nombre: "Citas planeadas" },
    "recuerdos":     { destino: "https://drive.google.com/drive/folders/1oWHLIezeag-UPwRhGHqrDzCS1WmvJGU4?usp=sharing", nombre: "Recuerdos", externo: true },
    "nuestrosmeses": { destino: "secciones/nuestros-meses/nuestrosMeses.html",   nombre: "Nuestros meses" },
    "palabras":      { destino: "secciones/carta/Carta.html",           nombre: "Carta" },
    "13noviembre":   { destino: "secciones/nuestra-fecha/nuestrafecha.html",    nombre: "Nuestra fecha" }
};

// Páginas que se desbloquean jugando o visitándolas (no se escriben con código).
// "etiqueta" es la frase que aparece en el menú en lugar del código.
const PAGINAS_DESBLOQUEABLES = {
    "interior":     { destino: "secciones/interior/interior.html",     nombre: "Interior",      etiqueta: "desbloqueada con el puzzle" },
    "nuestrafecha": { destino: "secciones/nuestra-fecha/nuestrafecha.html", nombre: "Nuestra fecha", etiqueta: "desde que dijiste que sí" }
};
