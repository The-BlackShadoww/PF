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

export const categoriesApi = {
  async getAll() {
    const response = await apiClient<ApiResponse<Category[]>>("/categories");

    return response.data;
  },
};
