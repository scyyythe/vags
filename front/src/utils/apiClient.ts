import axios from "axios";
import { secureTokenStorage } from "./security/secureStorage";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocal ? import.meta.env.VITE_API_LOCAL : import.meta.env.VITE_API_PROD;

const createAPIClient = (baseURL = API_BASE_URL) => {
  const apiClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use((config) => {
    if (!config?.url) {
      console.error("🚫 Invalid Axios request config:", config);
      return Promise.reject(new Error("Invalid request configuration"));
    }

    const isLoginOrRefresh = config.url.includes("token") && !config.url.includes("refresh");

    if (!isLoginOrRefresh) {
      const accessToken = secureTokenStorage.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isLoginOrRefresh = originalRequest?.url?.includes("token") && !originalRequest.url.includes("refresh");

      if (isLoginOrRefresh) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = secureTokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await axios.post(
            `${baseURL}token/refresh/`,
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const newAccessToken = response.data.access;
          secureTokenStorage.setAccessToken(newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("🔒 Refresh token invalid or expired");
          secureTokenStorage.clearTokens();
          // Preserve language setting during logout
          const savedLanguage = localStorage.getItem("language");
          localStorage.clear();
          if (savedLanguage) {
            localStorage.setItem("language", savedLanguage);
          }
          window.location.href = "/";
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

export default createAPIClient();
