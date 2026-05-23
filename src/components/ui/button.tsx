import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex touch-manipulation select-none items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          `bg-gradient-to-r ${theme.primary} text-white shadow-lg ${theme.shadow}`,
        variant === "secondary" &&
          cn("border bg-white text-slate-800 shadow-sm", theme.border),
        variant === "ghost" && "text-slate-600 hover:bg-orange-50/80",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
