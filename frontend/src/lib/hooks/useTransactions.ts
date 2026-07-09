import { useQuery } from "@tanstack/react-query";

import {
  transactionsApi,
  type TransactionFilters,
} from "@/lib/api/transactions";

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionsApi.getAll(filters),
    staleTime: 60 * 1000,
  });
}
