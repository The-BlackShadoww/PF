import type { ApiResponse } from "@/types/api";

import { apiClient } from "./client";
import type { TransactionType } from "./transactions";

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  color?: string | null;
  icon?: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateCategoryPayload = {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  sortOrder?: number;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export const categoriesApi = {
  async getAll() {
    const response = await apiClient<ApiResponse<Category[]>>("/categories");
    return response.data;
  },

  async create(data: CreateCategoryPayload) {
    const response = await apiClient<ApiResponse<Category>>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async update(id: string, data: UpdateCategoryPayload) {
    const response = await apiClient<ApiResponse<Category>>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient<ApiResponse<Category>>(`/categories/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },
};
