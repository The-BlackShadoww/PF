'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CategoryRow } from '../../../components/categories/CategoryRow';
import { CategoryForm } from '../../../components/categories/CategoryForm';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../../lib/hooks/useCategories';
import { Category } from '../../../lib/api/categories';
import { cn } from '../../../lib/utils/cn';
import { ProfileTab } from '../../../components/settings/ProfileTab';
import { SecurityTab } from '../../../components/settings/SecurityTab';
import { PreferencesTab } from '../../../components/settings/PreferencesTab';

type Tab = 'profile' | 'security' | 'preferences' | 'categories';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'profile',      label: 'Profile' },
  { id: 'security',     label: 'Security' },
  { id: 'preferences',  label: 'Preferences' },
  { id: 'categories',   label: 'Categories' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: categoriesResponse, isLoading } = useCategories();
  const categories = categoriesResponse ?? [];

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Separate income and expense categories for display in two groups
  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Handle form submit for both create and edit
  async function handleFormSubmit(values: {
    name: string; type: 'income' | 'expense'; color: string; icon: string;
  }) {
    setError(null);
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data: values });
        setEditingCategory(null);
      } else {
        await createMutation.mutateAsync(values);
        setShowCreateForm(false);
      }
    } catch (err: any) {
      // Show the API error message (e.g. "A category named X already exists")
      setError(err?.message ?? 'Something went wrong. Please try again.');
    }
  }

  // Soft delete with inline confirmation instead of a modal.
  // First click sets deleteConfirmId. Second click on the same item confirms.
  // Clicking anywhere else (another item's delete) resets it.
  async function handleDeleteClick(category: Category) {
    if (deleteConfirmId === category.id) {
      // Second click — confirmed
      try {
        await deleteMutation.mutateAsync(category.id);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to delete category');
      } finally {
        setDeleteConfirmId(null);
      }
    } else {
      // First click — request confirmation
      setDeleteConfirmId(category.id);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors -mb-px',
              'focus:outline-none',
              activeTab === tab.id
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* overflow-x-auto allows the tab bar to scroll horizontally on mobile
          without wrapping, which would break the underline indicator layout. */}

      {/* Error banner (belongs to categories tab state but shown globally) */}
      {error && (
        <div className="flex items-start justify-between gap-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && <ProfileTab />}

      {/* SECURITY TAB */}
      {activeTab === 'security' && <SecurityTab />}

      {/* PREFERENCES TAB */}
      {activeTab === 'preferences' && <PreferencesTab />}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-8">

          {/* Create button + form */}
          {showCreateForm || editingCategory ? (
            <div className="p-5 border border-gray-200 rounded-xl bg-white">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {editingCategory ? `Edit "${editingCategory.name}"` : 'New Category'}
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              New Category
            </button>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Income categories group */}
          {!isLoading && incomeCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Income ({incomeCategories.length})
              </h3>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div key={category.id}>
                    <CategoryRow
                      category={category}
                      onEdit={(c) => {
                        setEditingCategory(c);
                        setShowCreateForm(false);
                        setDeleteConfirmId(null);
                      }}
                      onDelete={handleDeleteClick}
                      isDeleting={deleteMutation.isPending}
                    />
                    {/* Inline delete confirmation */}
                    {deleteConfirmId === category.id && (
                      <div className="mt-1 ml-12 flex items-center gap-3 text-sm text-red-600">
                        <span>Delete &quot;{category.name}&quot;? This cannot be undone.</span>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="font-medium underline hover:no-underline"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense categories group */}
          {!isLoading && expenseCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Expenses ({expenseCategories.length})
              </h3>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div key={category.id}>
                    <CategoryRow
                      category={category}
                      onEdit={(c) => {
                        setEditingCategory(c);
                        setShowCreateForm(false);
                        setDeleteConfirmId(null);
                      }}
                      onDelete={handleDeleteClick}
                      isDeleting={deleteMutation.isPending}
                    />
                    {deleteConfirmId === category.id && (
                      <div className="mt-1 ml-12 flex items-center gap-3 text-sm text-red-600">
                        <span>Delete &quot;{category.name}&quot;? This cannot be undone.</span>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="font-medium underline hover:no-underline"
                        >
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && categories.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No categories yet.</p>
              <p className="text-xs mt-1">Create your first one above.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
