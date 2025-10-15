export default function formatCelular(celular) {
  if (!celular) return "-";
  return celular.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}
