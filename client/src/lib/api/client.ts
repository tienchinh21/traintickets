import axios from "axios";

import { getAccessToken, refreshAccessToken } from "@/lib/auth-token-manager";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry || originalRequest?.url === "/client/auth/refresh") {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const accessToken = await refreshAccessToken();

    if (!accessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    return apiClient(originalRequest);
  }
);

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
