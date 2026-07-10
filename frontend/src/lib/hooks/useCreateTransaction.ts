import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  transactionsApi,
  type TransactionPayload,
} from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: TransactionPayload) =>
      transactionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return "Unable to create transaction.";
}
