export function normalizarTexto(texto) {
  return texto
    ? texto
        .toString()
        .normalize("NFD") // remove acentuação
        .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
        .replace(/[.\-\/\s]/g, "") // remove pontuação comum
        .toLowerCase()
    : "";
}
