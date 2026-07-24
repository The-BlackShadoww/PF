'use client';

import { Check } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

// Preset colors — cover common use cases while keeping the UI clean.
// These are Tailwind 600-level colors for consistent vibrancy.
export const PRESET_COLORS = [
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#d97706', // amber-600
  '#65a30d', // lime-600
  '#16a34a', // green-600
  '#0891b2', // cyan-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#0284c7', // sky-600
  '#6b7280', // gray-500 (neutral default)
  '#1e293b', // slate-800 (dark)
];

interface ColorPickerProps {
  value: string;       // currently selected hex color
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      {/* Preset color swatches */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'w-8 h-8 rounded-full transition-all focus:outline-none',
              'focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
              value === color && 'ring-2 ring-offset-2 ring-gray-600 scale-110',
            )}
            style={{ backgroundColor: color }}
            title={color}
          >
            {value === color && (
              <Check
                size={14}
                className="mx-auto text-white drop-shadow-sm"
                strokeWidth={3}
              />
            )}
          </button>
        ))}
      </div>

      {/* Custom color input for colors outside the preset palette */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200"
          title="Custom color"
        />
        <span className="text-sm text-gray-500 font-mono">{value}</span>
        <span className="text-xs text-gray-400">or pick a custom color</span>
      </div>
    </div>
  );
}
