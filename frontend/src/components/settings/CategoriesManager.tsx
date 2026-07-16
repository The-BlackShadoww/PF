"use client";

import { Edit2, Plus, Trash2, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useCategories } from "@/lib/hooks/useCategories";
import { useDeleteCategory } from "@/lib/hooks/useDeleteCategory";
import { type Category } from "@/lib/api/categories";
import { Modal } from "@/components/ui/Modal";
import { CategoryForm } from "./CategoryForm";
import { CategoryIcon } from "./IconSelector";

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (category: Category) => {
    if (category.isDefault) return;
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800/50" />)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="space-y-6">
        <CategorySection title="Expenses" categories={expenseCategories} onEdit={handleEdit} onDelete={handleDelete} />
        <CategorySection title="Income" categories={incomeCategories} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <Modal open={isFormOpen} title={editingCategory ? "Edit Category" : "New Category"} onClose={handleCloseForm}>
        <CategoryForm category={editingCategory} onSuccess={handleCloseForm} onCancel={handleCloseForm} />
      </Modal>
    </div>
  );
}

function CategorySection({ 
  title, 
  categories, 
  onEdit, 
  onDelete 
}: { 
  title: string, 
  categories: Category[], 
  onEdit: (c: Category) => void, 
  onDelete: (c: Category) => void 
}) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: category.color || "#6b7280" }}
            >
              <CategoryIcon name={category.icon} className="h-6 w-6" />
            </div>
            
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {category.name}
                {category.isDefault && (
                  <ShieldCheck className="h-3 w-3 text-blue-500" title="Default category" />
                )}
              </h4>
            </div>

            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onEdit(category)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {!category.isDefault && (
                <button
                  onClick={() => onDelete(category)}
                  className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
