"use client";

import { Clock, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { HOT_TOPICS_PLATFORM_TAGS } from "@/lib/hot-topics/hot-topics-platforms";

/** 热点页数据条 — 固定展示口径：早 8 点更新 · 10万+ 规模 */
export function HotTopicsStatsStrip() {
  const { tr } = useApp();

  return (
    <div className="mb-3 space-y-2 rounded-[14px] bg-white/90 px-3 py-2.5 shadow-[0_2px_12px_rgba(255,100,140,0.08)] ring-1 ring-[#FFE8F0]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[10px] font-black text-[#FF4F8B]">
          <Clock size={11} strokeWidth={2.5} className="shrink-0" />
          {tr("hotTopicsDailyBadge")}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#374151]">
          <Sparkles size={11} className="shrink-0 text-[#FF9A4D]" />
          {tr("hotTopicsStripLibrary")}
        </span>
        <span className="inline-flex shrink-0 rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[11px] font-black text-[#FF4F8B]">
          {tr("hotTopicsStripToday")}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] font-bold text-[#9CA3AF]">{tr("hotTopicsStripPlatforms")}</span>
        {HOT_TOPICS_PLATFORM_TAGS.map((p) => (
          <span
            key={p}
            className="rounded-md bg-[#FFF5F8] px-2 py-0.5 text-[9px] font-black text-[#FF6B8A]"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
