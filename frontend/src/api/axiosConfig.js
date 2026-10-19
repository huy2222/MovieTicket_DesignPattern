import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
api.interceptors.response.use(
  response => response,
  error => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
    const hasStoredSession = Boolean(localStorage.getItem("token"));

    if (error.response?.status === 401 && hasStoredSession && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);
export default api;
