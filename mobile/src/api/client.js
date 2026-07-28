import axios from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

// En Expo Go sobre un celular físico, "localhost" apunta al propio celular,
// no a tu computadora — usa la IP de tu compu en la misma red WiFi (ej.
// "http://192.168.1.50:8000/api"). En el emulador Android, usa
// "http://10.0.2.2:8000/api" (alias que el emulador mapea al host).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Evita que peticiones concurrentes disparen varios refresh a la vez: todas
// esperan la misma promesa en curso.
let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = await getRefreshToken();
  if (!refresh) {
    throw new Error("No hay refresh token disponible.");
  }
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
  await setTokens({ access: data.access });
  return data.access;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const url = config?.url || "";
    const isAuthFlowEndpoint =
      url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");

    if (response?.status === 401 && !config._retry && !isAuthFlowEndpoint && (await getRefreshToken())) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const access = await refreshPromise;
        refreshPromise = null;
        config.headers.Authorization = `Bearer ${access}`;
        return apiClient(config);
      } catch (refreshError) {
        refreshPromise = null;
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
