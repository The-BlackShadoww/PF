import type { ApiResponse } from "@/types/api";

import { apiClient } from "./client";

export type TransactionType = "income" | "expense";

export type TransactionFilters = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
};

export type TransactionCategory = {
  id: string;
  name: string;
  type: TransactionType;
  color?: string | null;
  icon?: string | null;
};

export type Transaction = {
  id: string;
  categoryId: string;
  type: TransactionType;
  amountCents: number;
  date: string;
  note?: string | null;
  category: TransactionCategory;
};

export type TransactionsResponse = {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
};

export const transactionsApi = {
  async getAll(filters: TransactionFilters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    const response = await apiClient<ApiResponse<TransactionsResponse>>(
      `/transactions${queryString ? `?${queryString}` : ""}`,
    );

    return response.data;
  },
};
