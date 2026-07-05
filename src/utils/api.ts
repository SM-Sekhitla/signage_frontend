// src/api/axios.ts
import axios, { AxiosRequestConfig } from 'axios';

export const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ⚠ send cookies with every request
});

// Optional: automatically refresh access token on 401
API.interceptors.response.use(
  (response) => response, // pass through successful responses
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint, backend will set new httpOnly cookies
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // include cookies
        });

        if (!refreshResponse.ok) {
          throw new Error('Session expired');
        }

        // Retry the original request after refresh
        return API(originalRequest);
      } catch {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    const responseMessage =
      error.response?.data?.message ||
      error.response?.data?.detail?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Request failed';

    error.userMessage =
      typeof responseMessage === 'string' ? responseMessage : 'Request failed';

    return Promise.reject(error);
  }
);

export default API;
