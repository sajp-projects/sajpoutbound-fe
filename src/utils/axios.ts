import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { api } from "@/lib/axios";
import { BASE_URL } from "@/constant/baseUrl";
import {
  getAccessToken,
  clearAuthData,
  saveAuthData,
  getUser,
} from "./storage";
import { ApiResponse } from "@/types/api";

// Flag to prevent race conditions during token refresh
let isRefreshing = false;

export const axiosInstance = api;

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers["x-outmanage-token"] = accessToken;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Pastikan error response selalu memiliki data yang lengkap untuk dikonsumsi oleh client
    if (error.response && error.response.data) {
      const errorData = error.response.data as unknown;

      // Jika server mengembalikan respons tapi tidak dalam format yang diharapkan
      if (typeof errorData === "string") {
        error.response.data = {
          success: false,
          message: errorData,
          errorType: "serverError",
        } as ApiResponse<unknown>;
      } else if (typeof errorData === "object") {
        const apiResponse = errorData as Partial<ApiResponse<unknown>>;
        // Pastikan selalu ada message error jika belum ada
        if (!apiResponse.message) {
          apiResponse.message = error.message || "Terjadi kesalahan";
          apiResponse.success = false;
          error.response.data = apiResponse as ApiResponse<unknown>;
        }
      }
    }

    const isLoginRequest = originalRequest.url?.includes("/auth/login");
    const isRefreshRequest = originalRequest.url?.includes(
      "/auth/refresh-token"
    );
    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403;

    if (
      isAuthError &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        if (isRefreshing) {
          return Promise.reject(error);
        }

        isRefreshing = true;

        const accessToken = getAccessToken();

        if (!accessToken) {
          throw new Error("No access token available");
        }

        const response = await axios.get(`${BASE_URL}/auth/refresh-token`, {
          headers: {
            "x-outmanage-token": accessToken,
            "Content-Type": "application/json",
          },
        });

        const { accessToken: newToken } = response.data.data;

        // Update access token in storage (refresh token tetap di database)
        const currentUser = getUser();
        if (currentUser && newToken) {
          saveAuthData(currentUser, {
            accessToken: newToken,
            refreshToken: "",
          });
        }

        originalRequest.headers["x-outmanage-token"] = newToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        // Clear auth data and redirect to login
        clearAuthData();

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
