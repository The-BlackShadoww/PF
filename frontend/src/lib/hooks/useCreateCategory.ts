import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoriesApi, type CreateCategoryPayload } from "@/lib/api/categories";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
