import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoriesApi, type UpdateCategoryPayload } from "@/lib/api/categories";

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
