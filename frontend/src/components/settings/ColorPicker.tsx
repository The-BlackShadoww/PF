"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const CATEGORY_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#84cc16", "#06b6d4", "#f43f5e", "#d946ef",
];

type ColorPickerProps = {
  value?: string | null;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all",
            value === color ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "hover:scale-110 ring-1 ring-black/10 dark:ring-white/10"
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
        </button>
      ))}
    </div>
  );
}
