import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
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
        "inline-flex items-center justify-center font-semibold transition disabled:opacity-50",
        variant === "primary" &&
          "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-600",
        variant === "ghost" && "bg-stone-100 text-stone-600 hover:bg-stone-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
