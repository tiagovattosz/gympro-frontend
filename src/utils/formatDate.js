export function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  // Exemplo: formata para "14/10/2025"
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
