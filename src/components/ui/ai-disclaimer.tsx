"use client";

import { useApp } from "@/contexts/app-context";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ className }: { className?: string }) {
  const { tr } = useApp();
  return (
    <p
      className={cn(
        "rounded-2xl border px-3 py-2.5 text-[11px] leading-5 text-slate-500",
        theme.border,
        theme.softOrange,
        className
      )}
    >
      {tr("aiDisclaimer")}
    </p>
  );
}
