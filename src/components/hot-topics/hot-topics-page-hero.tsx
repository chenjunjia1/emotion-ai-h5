"use client";

import Link from "next/link";
import { ArrowRight, Clock, Flame, Sparkles, Wand2, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { HOT_TOPICS_PLATFORM_TAGS } from "@/lib/hot-topics/hot-topics-platforms";

/** 灵感 / 热点页顶栏 — 信息合并在一卡，紧凑吸睛 */
export function HotTopicsPageHero() {
  const { tr } = useApp();

  return (
    <section className="inspiration-hero inspiration-hero--compact group relative overflow-hidden rounded-2xl shadow-[0_10px_32px_rgba(255,45,90,0.28)] ring-1 ring-white/45 active:scale-[0.99]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D6A] via-[#FF4F8B] to-[#FF9A4D]" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_12%_0%,rgba(255,255,255,0.32),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,196,107,0.35),transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/30">
            <Flame size={10} strokeWidth={2.5} />
            {tr("hotTopicsPageTitle")}
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FFE08A] px-2 py-0.5 text-[9px] font-bold text-[#9A3412]">
            <Zap size={9} fill="#9A3412" strokeWidth={2.5} />
            30 秒出稿
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-2 py-0.5 text-[9px] font-semibold text-white/95 ring-1 ring-white/20">
            <Clock size={9} strokeWidth={2.5} />
            {tr("hotTopicsDailyBadge")}
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-white/14 px-2 py-0.5 text-[9px] font-semibold text-white/95 ring-1 ring-white/20">
            <Sparkles size={9} strokeWidth={2.5} />
            {tr("hotTopicsStripLibrary")}
          </span>
          <span className="rounded-full bg-white/14 px-2 py-0.5 text-[9px] font-semibold text-white/95 ring-1 ring-white/20">
            {tr("hotTopicsStripToday")}
          </span>
        </div>

        <h1 className="mt-2 text-[18px] font-black leading-[1.15] tracking-tight text-white">
          {tr("hotTopicsHeroTitle")}
        </h1>
        <p className="mt-1 line-clamp-1 text-[11px] font-medium text-white/88">
          {tr("hotTopicsHeroDescShort")}
        </p>

        <Link
          href="/publish-pack"
          className="inspiration-hero-cta mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[13px] font-bold text-[#FF2D6A] shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]"
        >
          <Wand2 size={16} strokeWidth={2.5} />
          直接出包
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="shrink-0 text-[9px] font-semibold text-white/65">
            {tr("hotTopicsStripPlatforms")}
          </span>
          {HOT_TOPICS_PLATFORM_TAGS.map((p) => (
            <span
              key={p}
              className="rounded-full bg-black/12 px-1.5 py-px text-[8px] font-medium text-white/90 ring-1 ring-white/12"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
