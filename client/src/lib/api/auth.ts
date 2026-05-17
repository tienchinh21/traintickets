import { apiClient } from "@/lib/api/client";

export type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  userType: "CUSTOMER";
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthResponse = {
  success: true;
  data: AuthSession;
  meta: Record<string, unknown>;
  message: string;
};

type MessageResponse = {
  success: true;
  data?: undefined;
  meta: Record<string, unknown>;
  message: string;
};

type DataResponse<T> = {
  success: true;
  data: T;
  meta: Record<string, unknown>;
  message: string;
};

export type RegisterPayload = {
  email?: string;
  phone?: string;
  fullName: string;
  password: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export async function registerClient(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>("/client/auth/register", payload);

  return response.data;
}

export async function loginClient(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>("/client/auth/login", payload);

  return response.data;
}

export async function refreshClient(refreshToken: string) {
  const response = await apiClient.post<AuthResponse>("/client/auth/refresh", { refreshToken });

  return response.data;
}

export async function logoutClient(refreshToken: string) {
  const response = await apiClient.post<MessageResponse>("/client/auth/logout", { refreshToken });

  return response.data;
}

export async function getCurrentClient() {
  const response = await apiClient.get<DataResponse<AuthUser>>("/client/auth/me");

  return response.data.data;
}
