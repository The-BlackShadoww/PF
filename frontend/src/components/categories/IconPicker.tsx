'use client';

import { Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils/cn';

// The list of icon identifiers we support.
// These are lucide-react icon names in kebab-case.
// We support a curated list — not all 1,000+ lucide icons.
export const SUPPORTED_ICONS = [
  'briefcase', 'laptop', 'trending-up', 'plus-circle',
  'shopping-cart', 'home', 'zap', 'car', 'film',
  'heart', 'more-horizontal', 'tag', 'coffee', 'utensils',
  'book', 'plane', 'gift', 'music', 'dumbbell',
  'baby', 'dog', 'graduation-cap', 'stethoscope', 'wrench',
  'smartphone', 'tv', 'wifi', 'shield', 'piggy-bank',
] as const;

export type IconName = typeof SUPPORTED_ICONS[number];

// Convert kebab-case icon name to PascalCase for lucide-react import.
// 'shopping-cart' → 'ShoppingCart'
function toPascalCase(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Render a single lucide icon by string name.
// We look it up from the imported Icons namespace.
function LucideIcon({ name, size = 18 }: { name: string; size?: number }) {
  const pascalName = toPascalCase(name);
  const IconComponent = (Icons as Record<string, React.ComponentType<{ size?: number }>>)[pascalName];
  if (!IconComponent) return <span style={{ width: size, height: size }} />;
  return <IconComponent size={size} />;
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
      {SUPPORTED_ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          title={icon}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-all',
            'hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400',
            value === icon
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-white text-gray-600 border border-gray-200',
          )}
        >
          <LucideIcon name={icon} size={16} />
        </button>
      ))}
    </div>
  );
}

// Also export the LucideIcon renderer — other components need it
// to display a category's icon by its stored string name.
export { LucideIcon };
