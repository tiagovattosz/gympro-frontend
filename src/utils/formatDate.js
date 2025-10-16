export function formatDate(dateString) {
  if (!dateString) return "-";

  const [year, month, day] = dateString.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatHora(horaString) {
  if (!horaString) return "";

  return horaString.split(".")[0];
}
