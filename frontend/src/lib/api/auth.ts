import type { ApiResponse } from "@/types/api";
import { apiClient, clearAccessToken } from "./client";

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = ApiResponse<
  | { accessToken: string }
  | { requiresTwoFactor: true; tempToken: string }
>;

export const authApi = {
  async register(data: RegisterRequest): Promise<RegisteredUser> {
    const response = await apiClient<ApiResponse<RegisteredUser>>(
      "/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return response.data;
  },

  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    try {
      await apiClient<void>("/auth/logout", {
        method: "POST",
        retryOnUnauthorized: false,
      });
    } finally {
      clearAccessToken();
    }
  },
};
