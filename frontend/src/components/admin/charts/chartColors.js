// Referencia directa a las variables CSS del tema pastel (index.css) para
// que las gráficas cambien de color solas entre modo claro/oscuro.
export const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-danger)",
];

export const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-foreground)",
};
