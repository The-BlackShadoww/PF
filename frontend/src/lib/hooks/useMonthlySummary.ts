import { useQuery } from "@tanstack/react-query";

import { calculationsApi } from "@/lib/api/calculations";

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: ["calculations", "monthly", year, month],
    queryFn: () => calculationsApi.getMonthlySummary(year, month),
    staleTime: 60 * 1000,
  });
}
