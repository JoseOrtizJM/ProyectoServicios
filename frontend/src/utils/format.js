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
