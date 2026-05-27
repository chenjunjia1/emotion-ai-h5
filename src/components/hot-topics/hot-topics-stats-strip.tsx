"use client";

import { Clock, Sparkles } from "lucide-react";
import { useAppUi } from "@/contexts/app-ui-context";
import { HOT_TOPICS_PLATFORM_TAGS } from "@/lib/hot-topics/hot-topics-platforms";

type Props = {
  /** compact：与 full 相同布局（兼容旧调用） */
  variant?: "full" | "compact";
};

/** 灵感页 — 更新节奏 · 规模 · 覆盖平台 */
export function HotTopicsStatsStrip({ variant: _variant = "full" }: Props) {
  const { tr } = useAppUi();

  return (
    <div className="inspiration-stats-enter overflow-hidden rounded-[20px] p-[1px] shadow-[0_8px_28px_rgba(255,79,139,0.12)]">
      <div className="inspiration-stats-strip-bg relative overflow-hidden rounded-[19px] px-3.5 py-3">
        <div
          className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[#FF9A4D]/20 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-[#FF4F8B] shadow-sm ring-1 ring-[#FFE8F0]">
            <Clock size={11} strokeWidth={2.5} className="shrink-0" />
            {tr("hotTopicsDailyBadge")}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_4px_12px_rgba(255,79,139,0.28)]">
            <Sparkles size={11} className="shrink-0" strokeWidth={2.5} />
            {tr("hotTopicsStripLibrary")}
          </span>
          <span className="inline-flex shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-[#FF4F8B] ring-1 ring-[#FFE8F0]">
            {tr("hotTopicsStripToday")}
          </span>
        </div>

        <div className="relative z-10 mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="shrink-0 text-[10px] font-black text-[#FF4F8B]">
            {tr("hotTopicsStripPlatforms")}
          </span>
          {HOT_TOPICS_PLATFORM_TAGS.map((p, i) => (
            <span
              key={p}
              className="inspiration-platform-tag rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-black text-[#FF5C8A] ring-1 ring-[#FFE8F0] shadow-sm"
              style={{ animationDelay: `${0.12 + i * 0.05}s` }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
