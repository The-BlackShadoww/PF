import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoriesApi } from "@/lib/api/categories";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
