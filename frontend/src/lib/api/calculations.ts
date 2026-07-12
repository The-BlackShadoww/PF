import type { ApiResponse } from "@/types/api";

import { apiClient } from "./client";

export type PeriodSummary = {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  savingsRate: number | string;
  transactionCount: number;
};

export type MonthlySummary = PeriodSummary & {
  year: number;
  month: number;
};

export type MonthlyBreakdownItem = {
  month: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
};

export type YearlySummary = PeriodSummary & {
  year: number;
  monthlyBreakdown: MonthlyBreakdownItem[];
};

export type CategoryBreakdownItem = {
  name: string;
  color?: string | null;
  icon?: string | null;
  type: "income" | "expense";
  total: number;
  count: number;
};

export const calculationsApi = {
  async getMonthlySummary(year: number, month: number) {
    const response = await apiClient<ApiResponse<MonthlySummary>>(
      `/calculations/monthly?year=${year}&month=${month}`,
    );

    return response.data;
  },

  async getYearlySummary(year: number) {
    const response = await apiClient<ApiResponse<YearlySummary>>(
      `/calculations/yearly?year=${year}`,
    );

    return response.data;
  },

  async getCategoryBreakdown(year: number, month: number) {
    const response = await apiClient<ApiResponse<CategoryBreakdownItem[]>>(
      `/calculations/category-breakdown?year=${year}&month=${month}`,
    );

    return response.data;
  },
};
