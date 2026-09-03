'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconPicker } from './IconPicker';
import { ColorPicker, PRESET_COLORS } from './ColorPicker';
import { Category, CategoryType } from '../../lib/api/categories';
import { cn } from '../../lib/utils/cn';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color'),
  icon: z.string().min(1, 'Please select an icon'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category;       // provided → edit mode; undefined → create mode
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const isEditing = Boolean(initialData);

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CategoryFormValues>({
      resolver: zodResolver(categorySchema),
      defaultValues: {
        name: initialData?.name ?? '',
        type: initialData?.type ?? 'expense',
        color: initialData?.color ?? PRESET_COLORS[0],
        icon: initialData?.icon ?? 'tag',
      },
    });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Name field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Groceries"
          className={cn(
            'w-full px-3 py-2 border rounded-control text-sm',
            'focus:outline-none focus:ring-2 focus:ring-gray-900',
            errors.name ? 'border-red-400' : 'border-gray-300',
          )}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Type selector — disabled in edit mode because type is immutable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
          {isEditing && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              (cannot be changed after creation)
            </span>
          )}
        </label>
        <div className="flex gap-2">
          {(['income', 'expense'] as CategoryType[]).map((type) => (
            <button
              key={type}
              type="button"
              disabled={isEditing}
              onClick={() => !isEditing && setValue('type', type)}
              className={cn(
                'flex-1 py-2 px-4 rounded-control text-sm font-medium capitalize transition-all',
                'focus:outline-none focus:ring-2 focus:ring-gray-400',
                isEditing && 'opacity-60 cursor-not-allowed',
                selectedType === type
                  ? type === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <ColorPicker
          value={selectedColor}
          onChange={(color) => setValue('color', color, { shouldValidate: true })}
        />
        {errors.color && (
          <p className="mt-1 text-xs text-red-500">{errors.color.message}</p>
        )}
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <IconPicker
          value={selectedIcon}
          onChange={(icon) => setValue('icon', icon, { shouldValidate: true })}
        />
        {errors.icon && (
          <p className="mt-1 text-xs text-red-500">{errors.icon.message}</p>
        )}
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-control border border-gray-200">
        <span className="text-xs text-gray-500">Preview:</span>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: selectedColor }}
        >
          {/* Icon preview rendered inline */}
          <span className="text-white opacity-90">●</span>
          {watch('name') || 'Category Name'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-control text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-gray-900 text-white rounded-control text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
        </button>
      </div>

    </form>
  );
}
