import { useQuery } from "@tanstack/react-query";

import { calculationsApi } from "@/lib/api/calculations";

export function useCategoryBreakdown(year: number, month: number) {
  return useQuery({
    queryKey: ["calculations", "category-breakdown", year, month],
    queryFn: () => calculationsApi.getCategoryBreakdown(year, month),
    staleTime: 60 * 1000,
  });
}
