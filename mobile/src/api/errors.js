// Misma lógica que frontend/src/api/errors.js — DRF devuelve el mismo
// formato de error sin importar qué cliente (web o móvil) lo consuma.
export function extractErrorMessages(error) {
  const data = error?.response?.data;
  if (!data) return ["Ocurrió un error de conexión. Intenta de nuevo."];
  if (typeof data === "string") return [data];

  const messages = [];
  if (data.detail) messages.push(data.detail);
  if (data.non_field_errors) messages.push(...[].concat(data.non_field_errors));

  for (const [key, value] of Object.entries(data)) {
    if (key === "detail" || key === "non_field_errors") continue;
    for (const item of [].concat(value)) {
      messages.push(typeof item === "string" ? item : JSON.stringify(item));
    }
  }

  return messages.length ? messages : ["Ocurrió un error inesperado."];
}
