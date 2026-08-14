'use client';

import { useQuery } from '@tanstack/react-query';
import { eachMonthOfInterval, getMonth, getYear } from 'date-fns';
import { apiClient } from '../api/client';
import type { ApiResponse } from '@/types/api';

export interface ReportPreviewData { totalIncome: number; totalExpense: number; savings: number; transactionCount: number; monthsIncluded: number; }
interface MonthlySummary { totalIncome: number; totalExpense: number; transactionCount: number; }
async function fetchMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  const response = await apiClient<ApiResponse<MonthlySummary> | MonthlySummary>(`/calculations/monthly?year=${year}&month=${month}`);
  return typeof response === 'object' && response !== null && 'data' in response ? response.data : response;
}
export function useReportPreview(startYear: number | null, startMonth: number | null, endYear: number | null, endMonth: number | null) {
  return useQuery({
    queryKey: ['report-preview', startYear, startMonth, endYear, endMonth],
    enabled: Boolean(startYear && startMonth && endYear && endMonth), staleTime: 1000 * 60 * 2,
    queryFn: async (): Promise<ReportPreviewData> => {
      const start = new Date(startYear!, startMonth! - 1, 1); const end = new Date(endYear!, endMonth! - 1, 1);
      if (end < start) throw new Error('End period cannot be before start period');
      const summaries = await Promise.all(eachMonthOfInterval({ start, end }).map((date) => fetchMonthlySummary(getYear(date), getMonth(date) + 1)));
      const totalIncome = summaries.reduce((sum, item) => sum + item.totalIncome, 0); const totalExpense = summaries.reduce((sum, item) => sum + item.totalExpense, 0);
      return { totalIncome, totalExpense, savings: totalIncome - totalExpense, transactionCount: summaries.reduce((sum, item) => sum + item.transactionCount, 0), monthsIncluded: summaries.length };
    },
  });
}
