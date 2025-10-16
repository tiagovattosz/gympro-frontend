export function getHoje() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function getSemanaPassada() {
  const hoje = new Date();
  // Subtrai 7 dias
  const semanaPassada = new Date(hoje);
  semanaPassada.setDate(hoje.getDate() - 7);

  const ano = semanaPassada.getFullYear();
  const mes = String(semanaPassada.getMonth() + 1).padStart(2, "0");
  const dia = String(semanaPassada.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function parseDateSemTimezone(dateString) {
  const parts = dateString.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
