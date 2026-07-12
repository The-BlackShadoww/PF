import { useQuery } from "@tanstack/react-query";

import { calculationsApi } from "@/lib/api/calculations";

type UseYearlySummaryOptions = {
  enabled?: boolean;
};

export function useYearlySummary(
  year: number,
  options: UseYearlySummaryOptions = {},
) {
  return useQuery({
    queryKey: ["calculations", "yearly", year],
    queryFn: () => calculationsApi.getYearlySummary(year),
    staleTime: 60 * 1000,
    enabled: options.enabled ?? true,
  });
}
