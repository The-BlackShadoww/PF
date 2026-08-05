"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryRow } from "@/components/categories/CategoryRow";
import { PageHeader } from "@/components/layouts/PageHeader";
import { PreferencesTab } from "@/components/settings/PreferencesTab";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import type { Category } from "@/lib/api/categories";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/hooks/useCategories";
import { cn } from "@/lib/utils/cn";

type Tab = "profile" | "security" | "preferences" | "categories";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
  { id: "categories", label: "Categories" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: categoriesResponse, isLoading } = useCategories();
  const categories = categoriesResponse ?? [];
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const incomeCategories = categories.filter((category) => category.type === "income");
  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  async function handleFormSubmit(values: {
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
  }) {
    setError(null);
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: values,
        });
        setEditingCategory(null);
      } else {
        await createMutation.mutateAsync(values);
        setShowCreateForm(false);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  async function handleDeleteClick(category: Category) {
    if (deleteConfirmId === category.id) {
      try {
        await deleteMutation.mutateAsync(category.id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete category");
      } finally {
        setDeleteConfirmId(null);
      }
    } else {
      setDeleteConfirmId(category.id);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, security, preferences, and categories."
      />

      <div className="flex gap-1 overflow-x-auto rounded-full bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none",
              activeTab === tab.id
                ? "bg-[#9fe870] text-[#0e0f0c]"
                : "text-[#454745] hover:bg-[#e8ebe6] hover:text-[#0e0f0c]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="flex items-start justify-between gap-3 rounded-3xl bg-[#320707] p-4 text-white">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-white/70 transition hover:text-white"
            aria-label="Dismiss settings error"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <section className="rounded-3xl bg-white p-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "preferences" && <PreferencesTab />}
        {activeTab === "categories" && (
          <div className="space-y-8">
            {showCreateForm || editingCategory ? (
              <div className="rounded-3xl bg-[#e8ebe6] p-5">
                <h3 className="mb-4 text-sm font-black text-[#0e0f0c]">
                  {editingCategory
                    ? `Edit "${editingCategory.name}"`
                    : "New category"}
                </h3>
                <CategoryForm
                  initialData={editingCategory ?? undefined}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setShowCreateForm(false);
                    setEditingCategory(null);
                    setError(null);
                  }}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 rounded-3xl bg-[#9fe870] px-5 py-3 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#cdffad]"
              >
                <Plus size={16} />
                New category
              </button>
            )}

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-2xl bg-[#e8ebe6]"
                  />
                ))}
              </div>
            ) : null}

            <CategoryGroup
              title="Income"
              categories={incomeCategories}
              deleteConfirmId={deleteConfirmId}
              isDeleting={deleteMutation.isPending}
              onEdit={(category) => {
                setEditingCategory(category);
                setShowCreateForm(false);
                setDeleteConfirmId(null);
              }}
              onDelete={handleDeleteClick}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />
            <CategoryGroup
              title="Expenses"
              categories={expenseCategories}
              deleteConfirmId={deleteConfirmId}
              isDeleting={deleteMutation.isPending}
              onEdit={(category) => {
                setEditingCategory(category);
                setShowCreateForm(false);
                setDeleteConfirmId(null);
              }}
              onDelete={handleDeleteClick}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />

            {!isLoading && categories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#868685] bg-[#e8ebe6] px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#454745]">
                  No categories yet.
                </p>
                <p className="mt-1 text-xs text-[#868685]">
                  Create your first one above.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryGroup({
  title,
  categories,
  deleteConfirmId,
  isDeleting,
  onEdit,
  onDelete,
  onCancelDelete,
}: {
  title: string;
  categories: Category[];
  deleteConfirmId: string | null;
  isDeleting: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onCancelDelete: () => void;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-normal text-[#454745]">
        {title} ({categories.length})
      </h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id}>
            <CategoryRow
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
            {deleteConfirmId === category.id ? (
              <div className="ml-12 mt-2 flex flex-wrap items-center gap-3 text-sm text-[#a7000d]">
                <span>
                  Delete &quot;{category.name}&quot;? This cannot be undone.
                </span>
                <button
                  onClick={() => onDelete(category)}
                  className="font-semibold underline hover:no-underline"
                >
                  Yes, delete
                </button>
                <button
                  onClick={onCancelDelete}
                  className="text-[#868685] hover:text-[#454745]"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
