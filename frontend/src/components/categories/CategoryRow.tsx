'use client';

import { Pencil, Trash2, Lock } from 'lucide-react';
import { LucideIcon } from './IconPicker';
import { Category } from '../../lib/api/categories';
import { cn } from '../../lib/utils/cn';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isDeleting: boolean;
}

export function CategoryRow({ category, onEdit, onDelete, isDeleting }: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-control border border-gray-200 hover:border-gray-300 transition-colors">

      {/* Color dot + icon */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 text-white"
        style={{ backgroundColor: category.color }}
      >
        <LucideIcon name={category.icon} size={16} />
      </div>

      {/* Name + type badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {category.name}
          </span>
          {category.isDefault && (
            <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              <Lock size={10} />
              default
            </span>
          )}
        </div>
        <span
          className={cn(
            'text-xs font-medium capitalize',
            category.type === 'income' ? 'text-green-600' : 'text-red-500',
          )}
        >
          {category.type}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          title="Edit category"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(category)}
          disabled={category.isDefault || isDeleting}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            category.isDefault
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50',
          )}
          title={category.isDefault ? 'Default categories cannot be deleted' : 'Delete category'}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
