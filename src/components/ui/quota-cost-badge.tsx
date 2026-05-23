"use client";

import { Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

export function QuotaCostBadge({
  cost,
  className,
}: {
  cost: number;
  className?: string;
}) {
  const { tr } = useApp();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[10px] font-bold text-[#FF5C8A] ring-1 ring-[#FF7AAE]/25",
        className
      )}
    >
      <Sparkles size={11} />
      {tr("createCostBadge").replace("{cost}", String(cost))}
    </span>
  );
}
