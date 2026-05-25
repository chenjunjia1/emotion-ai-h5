"use client";

import { Sparkles, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { QUOTA_COST } from "@/lib/constants/v1";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

/** 顶部灵感条：剩余多少、本条花多少、今天还能玩几次 */
export function QuotaPlayMeter({
  action = "publish_pack",
  className,
  compact,
}: {
  action?: keyof typeof QUOTA_COST | string;
  className?: string;
  compact?: boolean;
}) {
  const { tr, user } = useApp();
  if (!user) return null;

  const total = getTotalQuota(user);
  const cost = QUOTA_COST[action] ?? 30;
  const playsLeft = cost > 0 ? Math.floor(total / cost) : 0;
  const low = total < cost;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#FFF4F7] to-[#FFF8F0] px-3 py-2 ring-1 ring-[#FFE8F0]",
        low && "ring-[#FF4F8B]/35",
        className
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm">
        <Zap size={16} fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black text-[#1F2937]">
          {tr("quotaPlayRemain").replace("{n}", String(total))}
          <span className="mx-1 text-[#D1D5DB]">·</span>
          {tr("quotaPlayCost").replace("{n}", String(cost))}
        </p>
        {!compact ? (
          <p className={cn("text-[10px] font-bold", low ? "text-[#FF4F8B]" : "text-[#8A94A6]")}>
            {low
              ? tr("quotaPlayLow")
              : tr("quotaPlayLeft").replace("{n}", String(playsLeft))}
          </p>
        ) : null}
      </div>
      {low ? (
        <Sparkles size={14} className="shrink-0 text-[#FF9A4D] animate-pulse" />
      ) : (
        <span className="shrink-0 rounded-full bg-[#FF4F8B] px-2 py-0.5 text-[9px] font-black text-white">
          ×{playsLeft}
        </span>
      )}
    </div>
  );
}
