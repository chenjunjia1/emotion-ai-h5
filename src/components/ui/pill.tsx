"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

export function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-xs font-bold transition",
        active
          ? `border-transparent bg-gradient-to-r ${theme.primary} text-white shadow-sm ${theme.shadow}`
          : cn("border bg-white text-slate-600", theme.border)
      )}
    >
      {children}
    </button>
  );
}
