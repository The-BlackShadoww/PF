"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";

import type { Category } from "@/lib/api/categories";
import { useCreateCategory } from "@/lib/hooks/useCreateCategory";
import { useUpdateCategory } from "@/lib/hooks/useUpdateCategory";
import { ColorPicker } from "./ColorPicker";
import { IconSelector } from "./IconSelector";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["income", "expense"]),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryFormProps = {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "expense",
      color: category?.color || "",
      icon: category?.icon || "",
    },
  });

  const currentColor = watch("color");
  const currentIcon = watch("icon");

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ id: category.id, data });
      } else {
        await createCategory.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;
  const error = createCategory.error || updateCategory.error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error.message || "Something went wrong."}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-900/20">
              <input type="radio" value="expense" className="sr-only" {...register("type")} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Expense</span>
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-900/20">
              <input type="radio" value="income" className="sr-only" {...register("type")} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Income</span>
            </label>
          </div>
          {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>}
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            placeholder="e.g. Groceries"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color
          </label>
          <ColorPicker value={currentColor} onChange={(c) => setValue("color", c)} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Icon
          </label>
          <IconSelector value={currentIcon} onChange={(i) => setValue("icon", i)} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || isPending}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Saving..." : "Save Category"}
        </button>
      </div>
    </form>
  );
}
