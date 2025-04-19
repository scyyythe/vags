import axios from "axios";

const createAPIClient = (baseURL = "http://127.0.0.1:8000/api/") => {
  const apiClient = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");

          const response = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token invalid or expired");
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
