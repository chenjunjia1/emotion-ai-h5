"use client";

import Link from "next/link";
import { ChevronRight, Flame, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { HOT_TOPICS_PLATFORM_TAGS } from "@/lib/hot-topics/hot-topics-platforms";

/** 今日热点页顶栏 — 合并标题 + 行动引导 */
export function HotTopicsPageHero() {
  const { tr } = useApp();

  return (
    <section className="relative mb-3 overflow-hidden rounded-[22px] shadow-[0_10px_32px_rgba(255,79,139,0.22)] ring-1 ring-white/40">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B6E] via-[#FF6B9D] to-[#FF9A4D]" />
      <span
        className="pointer-events-none absolute -right-4 -top-6 h-28 w-28 rounded-full bg-white/20 blur-2xl"
        aria-hidden
      />

      <div className="relative px-4 pb-3.5 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1 text-[10px] font-bold text-white/85">
              <Flame size={12} />
              {tr("hotTopicsPageTitle")}
            </p>
            <h1 className="mt-0.5 text-[18px] font-black leading-tight text-white">
              {tr("hotTopicsHeroTitle")}
            </h1>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/90">
              {tr("hotTopicsHeroDescShort")}
            </p>
          </div>
          <Link
            href="/publish-pack"
            className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-black text-[#FF4F8B] shadow-sm active:scale-95"
          >
            直接出包
            <ChevronRight size={12} />
          </Link>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          <Zap size={10} className="text-[#FFE8A8]" fill="#FFE8A8" />
          {HOT_TOPICS_PLATFORM_TAGS.map((p) => (
            <span
              key={p}
              className="rounded-md bg-black/12 px-1.5 py-0.5 text-[8px] font-bold text-white/95"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
