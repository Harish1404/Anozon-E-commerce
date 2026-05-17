import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { AxiosError } from "axios";

const isServer = typeof window === "undefined";
const baseURL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  : "/api";

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

const AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/refresh",
    "/auth/signup",
    "/auth/logout",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/forgot-password",
    "/auth/reset-password"
];

// Queue process

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Interceptors

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't refresh for auth endpoints
      if (AUTH_ENDPOINTS.some(endpoint => originalRequest.url?.includes(endpoint))) {
        return Promise.reject(error);
      }
      // If already refreshing → queue request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (cookie-based)
        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access_token;

        // Save token in Zustand
        useAuthStore.getState().setAuth(newAccessToken, useAuthStore.getState().user!); // Assuming user data is unchanged

        // Update default headers
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);

        // Logout user
        useAuthStore.getState().logout();

        // Shield user from technical backend errors
        if (refreshError.response?.status === 401) {
            return Promise.reject(new Error("Your session has expired. Please log in again."));
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
}
);

export default api;
