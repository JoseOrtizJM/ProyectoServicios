// DRF puede devolver el error de varias formas: {"detail": "..."},
// {"non_field_errors": [...]}, o {"campo": ["mensaje", ...]} por cada campo
// inválido. Esta función los aplana todos a una lista simple de strings
// para mostrarlos igual sin importar qué endpoint falló.
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
