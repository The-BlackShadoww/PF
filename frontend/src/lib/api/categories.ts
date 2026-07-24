import { apiClient } from './client';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export const categoriesApi = {
  getAll: () =>
    apiClient<Category[]>('/categories'),

  create: (data: CreateCategoryPayload) =>
    apiClient<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCategoryPayload) =>
    apiClient<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};
