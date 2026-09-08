import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const acebuilderActiveClasses =
  "bg-linear-to-b from-tertiary to-[var(--primary-color)] text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset] ring ring-white/20 ring-inset ring-offset-2 ring-offset-[var(--primary-color)] hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-white/40";

export const acebuilderButtonClass =
  `inline-flex cursor-pointer font-display items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${acebuilderActiveClasses} gap-1 has-[>svg]:pl-2 h-8 rounded-full px-3.5`;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        className={cn(acebuilderButtonClass, className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
