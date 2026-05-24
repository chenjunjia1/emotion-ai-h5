"use client";

import { useApp } from "@/contexts/app-context";
import { isClientServerMode } from "@/lib/client/server-api";
import { cn } from "@/lib/utils";

export function HomeBetaBanner() {
  const { tr } = useApp();
  if (!isClientServerMode()) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-[10px] leading-[1.45] text-amber-900"
      )}
    >
      <span className="mt-0.5 shrink-0 rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[9px] font-bold">
        Beta
      </span>
      <p>
        <b>{tr("betaBannerTitle")}</b>
        <span className="opacity-90"> — {tr("betaBannerDesc")}</span>
      </p>
    </div>
  );
}
