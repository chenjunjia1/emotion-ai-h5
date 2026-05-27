"use client";

import { Sparkles } from "lucide-react";
import { HOME_VALUE_STATS } from "@/lib/mock/home-shortcuts";
import { HOT_TOPICS_PLATFORM_TAGS } from "@/lib/hot-topics/hot-topics-platforms";

/** 首页 · 能力规模 + 覆盖平台（亮眼数据条） */
export function HomeValueStrip() {
  return (
    <section className="home-value-strip home-section-enter relative z-10 overflow-hidden rounded-[22px] p-[1px] shadow-[0_10px_36px_rgba(255,79,139,0.14)]">
      <div className="home-value-strip-bg relative overflow-hidden rounded-[21px] px-3.5 py-3.5">
        <div
          className="home-value-strip-shine pointer-events-none absolute inset-0 rounded-[21px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#FF9A4D]/25 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-6 left-0 h-20 w-24 rounded-full bg-[#FF4F8B]/15 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-[0_4px_12px_rgba(255,79,139,0.35)]">
              <Sparkles size={12} strokeWidth={2.5} />
            </span>
            <p className="text-[12px] font-black text-[#1F2937]">全平台创作者都在用</p>
          </div>
          <span className="home-value-live rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-black text-[#FF4F8B] ring-1 ring-[#FFE8F0]">
            今日已更新
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-4 gap-2">
          {HOME_VALUE_STATS.map((s, i) => (
            <div
              key={s.label}
              className="home-value-stat flex flex-col items-center rounded-[14px] bg-white/75 px-1 py-2.5 text-center ring-1 ring-white/80 backdrop-blur-sm"
              style={{ animationDelay: `${0.04 + i * 0.05}s` }}
            >
              <span className="text-[15px] leading-none" aria-hidden>
                {s.icon}
              </span>
              <p className="home-value-stat-num mt-1 text-[18px] font-black tabular-nums leading-none">
                {s.value}
              </p>
              <p className="mt-1 text-[9px] font-bold leading-tight text-[#374151]">{s.label}</p>
              <span className="mt-1 rounded-md bg-[#FFF0F5] px-1 py-px text-[7px] font-bold text-[#FF5C8A]">
                {s.chip}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black text-[#FF4F8B]">覆盖</span>
          {HOT_TOPICS_PLATFORM_TAGS.map((p, i) => (
            <span
              key={p}
              className="home-platform-chip rounded-full bg-gradient-to-r from-[#FFF0F5] to-[#FFF8F0] px-2.5 py-0.5 text-[9px] font-black text-[#FF4F8B] ring-1 ring-[#FFE8F0] shadow-sm"
              style={{ animationDelay: `${0.15 + i * 0.03}s` }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
