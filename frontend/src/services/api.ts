import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const googleOAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
  redirectUri:
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ??
    "http://localhost:5173/login/oauth2/code/google",
  scope: "email profile",
  backendAuthUrl:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
};
