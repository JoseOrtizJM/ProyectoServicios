const currencyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dateFormatter = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

export function formatCurrency(value) {
  const number = typeof value === "string" ? Number(value) : value;
  return currencyFormatter.format(Number.isFinite(number) ? number : 0);
}

export function formatDate(value) {
  if (!value) return "";
  return dateFormatter.format(new Date(value));
}

// Versión corta para etiquetas angostas (columnas de gráficas): sin
// decimales y abreviando miles, ej. "$1.2k" en vez de "$1,234.50".
export function formatCompactCurrency(value) {
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(number)) return "$0";
  if (Math.abs(number) >= 1000) {
    return `$${(number / 1000).toFixed(1)}k`;
  }
  return `$${Math.round(number)}`;
}
