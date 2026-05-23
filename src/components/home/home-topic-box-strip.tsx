"use client";

import Link from "next/link";
import { ChevronRight, Gift } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { cn } from "@/lib/utils";

/** 选题盲盒：Banner 与主玩法区之间的「每日一抽」入口 */
export function HomeTopicBoxStrip() {
  const { tr } = useApp();
  const { dailyUsage, featureLimits } = useProduct();
  const remain = Math.max(0, featureLimits.topicBox - dailyUsage.topicBox);

  return (
    <Link
      href="/topic-box"
      className={cn(
        "group flex items-center gap-3 overflow-hidden rounded-[22px] p-3.5",
        "bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
        "shadow-[0_10px_28px_rgba(255,107,107,0.28)] ring-1 ring-white/40 active:scale-[0.99]"
      )}
    >
      <div className="play-box-shake flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 ring-2 ring-white/50">
        <Gift size={26} className="text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-black text-white">{tr("topicBoxStripTitle")}</span>
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-black text-[#FF5C8A]">
            {tr("topicBoxStripBadge")}
          </span>
          <span className="rounded-full bg-black/15 px-2 py-0.5 text-[9px] font-bold text-white">
            剩余 {remain}/{featureLimits.topicBox}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-medium text-white/90">{tr("topicBoxStripDesc")}</p>
      </div>
      <span className="flex shrink-0 items-center gap-0.5 text-xs font-black text-white">
        {tr("topicBoxStripCta")}
        <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
