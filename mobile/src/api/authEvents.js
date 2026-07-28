// Puente mínimo entre el cliente API (que no tiene acceso a React) y
// AuthContext: cuando el refresh token falla en cualquier parte de la app,
// esto avisa para que la UI vuelva a mostrar el login en vez de quedarse
// con una sesión "fantasma" que solo produce 401 silenciosos.
let listeners = [];

export function onAuthExpired(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function emitAuthExpired() {
  listeners.forEach((listener) => listener());
}
