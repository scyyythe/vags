import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocal ? import.meta.env.VITE_API_LOCAL : import.meta.env.VITE_API_PROD;

console.log("🌐 API_BASE_URL:", API_BASE_URL);

const createAPIClient = (baseURL = API_BASE_URL) => {
  const apiClient = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use((config) => {
    if (!config?.url) {
      console.error("🚫 Invalid Axios request config:", config);
      return Promise.reject(new Error("Invalid request configuration"));
    }

    const isLoginOrRefresh = config.url.includes("token") && !config.url.includes("refresh");

    if (!isLoginOrRefresh) {
      const accessToken = localStorage.getItem("access_token");
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
          const refreshToken = localStorage.getItem("refresh_token");
          const response = await axios.post(
            `${baseURL}token/refresh/`,
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("🔒 Refresh token invalid or expired");
          localStorage.clear();
          window.location.href = "/";
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

export default createAPIClient();
