export function normalizeCelular(value: string): string | null {
  let celular = value.replace(/\D/g, "");

  // Aceita o numero com ou sem o codigo do Brasil.
  if (celular.startsWith("55") && celular.length >= 12) {
    celular = celular.slice(2);
  }

  return celular.length === 10 || celular.length === 11 ? celular : null;
}
