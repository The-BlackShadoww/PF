'use client';

import { useQuery } from '@tanstack/react-query';
import {
  parseISO,
  eachMonthOfInterval,
  getYear,
  getMonth,
  isValid,
} from 'date-fns';
import { apiClient } from '../api/client';
import type { ApiResponse } from '@/types/api';

export interface ReportPreviewData {
  totalIncome: number;        // in dollars
  totalExpense: number;       // in dollars
  savings: number;            // in dollars
  transactionCount: number;
  monthsIncluded: number;
}

interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  transactionCount: number;
}

function unwrapApiResponse<T>(payload: T | ApiResponse<T>): T {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

async function fetchMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  const response = await apiClient<ApiResponse<MonthlySummary> | MonthlySummary>(
    `/calculations/monthly?year=${year}&month=${month}`
  );
  return unwrapApiResponse(response);
}

export function useReportPreview(
  startDate: string | null,
  endDate: string | null,
) {
  return useQuery({
    queryKey: ['report-preview', startDate, endDate],

    enabled: Boolean(startDate && endDate),

    staleTime: 1000 * 60 * 2,

    queryFn: async (): Promise<ReportPreviewData> => {
      const start = parseISO(startDate!);
      const end = parseISO(endDate!);

      if (!isValid(start) || !isValid(end)) {
        throw new Error('Invalid date range');
      }

      if (end < start) {
        throw new Error('End date must be after start date');
      }

      const months = eachMonthOfInterval({ start, end });

      const summaries = await Promise.all(
        months.map((monthDate) =>
          fetchMonthlySummary(
            getYear(monthDate),
            getMonth(monthDate) + 1,
          )
        )
      );

      const totalIncome = summaries.reduce((sum, s) => sum + s.totalIncome, 0);
      const totalExpense = summaries.reduce((sum, s) => sum + s.totalExpense, 0);
      const savings = totalIncome - totalExpense;
      const transactionCount = summaries.reduce((sum, s) => sum + s.transactionCount, 0);

      return {
        totalIncome,
        totalExpense,
        savings,
        transactionCount,
        monthsIncluded: months.length,
      };
    },
  });
}
