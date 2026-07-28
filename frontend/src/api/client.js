import axios from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Evita que peticiones concurrentes disparen varios refresh a la vez: todas
// esperan la misma promesa en curso.
let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No hay refresh token disponible.");
  }
  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
  setTokens({ access: data.access });
  return data.access;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const url = config?.url || "";
    const isAuthFlowEndpoint =
      url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");

    if (response?.status === 401 && !config._retry && !isAuthFlowEndpoint && getRefreshToken()) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const access = await refreshPromise;
        refreshPromise = null;
        config.headers.Authorization = `Bearer ${access}`;
        return apiClient(config);
      } catch (refreshError) {
        refreshPromise = null;
        clearTokens();
        window.location.assign("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
