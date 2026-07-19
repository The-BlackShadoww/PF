import { useQuery } from "@tanstack/react-query";
import { eachMonthOfInterval, parseISO } from "date-fns";
import { calculationsApi } from "../api/calculations";

export function useReportPreview(
  startDate: string | null,
  endDate: string | null,
) {
  return useQuery({
    queryKey: ["report-preview", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return null;

      const months = eachMonthOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      });

      const summaries = await Promise.all(
        months.map((date) =>
          calculationsApi.getMonthlySummary(
            date.getFullYear(),
            date.getMonth() + 1,
          )
        )
      );

      let totalIncome = 0;
      let totalExpense = 0;
      let transactionCount = 0;

      for (const summary of summaries) {
        totalIncome += summary.totalIncome;
        totalExpense += summary.totalExpense;
        transactionCount += summary.transactionCount;
      }

      return {
        totalIncome,
        totalExpense,
        savings: totalIncome - totalExpense,
        transactionCount,
        monthsIncluded: months.length,
      };
    },
    enabled: Boolean(startDate && endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
