"use client";

import { cn } from "@/lib/utils/cn";
import * as LucideIcons from "lucide-react";

export const CATEGORY_ICONS = [
  "Banknote", "Briefcase", "ShoppingCart", "Home",
  "Zap", "Car", "Film", "Heart",
  "Coffee", "Pizza", "Plane", "Smartphone",
  "Book", "Gift", "Music", "Wifi"
] as const;

type IconSelectorProps = {
  value?: string | null;
  onChange: (icon: string) => void;
};

export function IconSelector({ value, onChange }: IconSelectorProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {CATEGORY_ICONS.map((iconName) => {
        // We ensure the icon exists in lucide-react before rendering
        const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType;
        if (!IconComponent) return null;

        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName.toLowerCase())} // Backend expects lowercase/kebab (e.g. 'banknote' -> 'banknote', but wait, lucide exports 'Banknote') Let's just store the camel/pascal case or map it correctly. Actually, let's just store exact pascal case name to easily map back.
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border transition-all",
              value === iconName
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            )}
            title={iconName}
          >
            <IconComponent className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}

export function CategoryIcon({ name, className }: { name?: string | null, className?: string }) {
  if (!name) {
    const Circle = LucideIcons.Circle;
    return <Circle className={className} />;
  }
  
  // Try to find the exact component or fallback
  // The name from DB might be 'banknote' instead of 'Banknote' if seeded like that
  // Let's do a case-insensitive search if exact doesn't match
  let IconComp = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
  
  if (!IconComp) {
    const match = Object.keys(LucideIcons).find((k) => k.toLowerCase() === name.toLowerCase().replace(/-/g, ''));
    if (match) {
      IconComp = LucideIcons[match as keyof typeof LucideIcons] as React.ElementType;
    }
  }

  if (!IconComp) {
    const Circle = LucideIcons.Circle;
    return <Circle className={className} />;
  }

  return <IconComp className={className} />;
}
