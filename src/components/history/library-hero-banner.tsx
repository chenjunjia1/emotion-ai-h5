"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { HistoryTypeIcon } from "@/components/history/history-type-icon";
import {
  LIBRARY_STAT_METAS,
  type LibraryFilter,
} from "@/lib/history/library-meta";
import type { I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STAT_KEYS = ["treehole", "pack", "topic", "emotion", "review"] as const;

const PERK_KEYS = [
  "libraryHeroPerk1",
  "libraryHeroPerk2",
  "libraryHeroPerk3",
] as const satisfies readonly I18nKey[];

type Stats = {
  total: number;
  pack: number;
  topic: number;
  emotion: number;
  treehole: number;
  review: number;
};

type Tr = (key: I18nKey) => string;

function heroMood(total: number, tr: Tr): { headline: string; sub: string } {
  if (total === 0) {
    return {
      headline: tr("libraryHeroHeadlineEmpty"),
      sub: tr("libraryHeroSubEmpty"),
    };
  }
  if (total >= 30) {
    return {
      headline: tr("libraryHeroHeadlinePro"),
      sub: tr("libraryHeroSubPro"),
    };
  }
  return {
    headline: tr("libraryHeroHeadline"),
    sub: tr("libraryHeroSub"),
  };
}

export function LibraryHeroBanner({
  stats,
  filter,
  onFilterChange,
  tr,
}: {
  stats: Stats;
  filter: LibraryFilter;
  onFilterChange: (f: LibraryFilter) => void;
  tr: Tr;
}) {
  const mood = heroMood(stats.total, tr);

  return (
    <section className="library-hero-banner relative mb-3 overflow-hidden rounded-[24px] shadow-[0_14px_40px_rgba(255,79,139,0.28)] ring-2 ring-white/50">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B6E] via-[#FF6B9D] to-[#FFB347]" />
      <div className="library-hero-aurora pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <span
        className="library-hero-orb pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/25 blur-3xl"
        aria-hidden
      />
      <span
        className="library-hero-orb pointer-events-none absolute -bottom-10 left-4 h-28 w-28 rounded-full bg-[#FFE8A8]/35 blur-2xl"
        aria-hidden
        style={{ animationDelay: "1.5s" }}
      />
      <span
        className="pointer-events-none absolute right-4 top-3 text-4xl opacity-25"
        aria-hidden
      >
        📚
      </span>

      <div className="relative px-4 pb-4 pt-4 text-white">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black ring-1 ring-white/30 backdrop-blur-sm">
            <Sparkles size={10} className="fill-white/40" />
            {tr("libraryHeroTag")}
          </span>
          <span className="rounded-full bg-[#FFE8A8]/25 px-2 py-0.5 text-[9px] font-bold text-[#FFF8E0] ring-1 ring-white/20">
            {tr("libraryHeroBadge")}
          </span>
        </div>

        <h2 className="mt-2.5 max-w-[92%] text-[18px] font-black leading-snug tracking-tight">
          {mood.headline}
        </h2>
        <p className="mt-1 max-w-[95%] text-[11px] font-medium leading-relaxed text-white/88">
          {mood.sub}
        </p>

        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className="mt-3 flex w-full items-end justify-between rounded-[18px] bg-white/12 px-3.5 py-3 text-left ring-1 ring-white/25 backdrop-blur-sm active:scale-[0.99]"
        >
          <div>
            <p className="text-[10px] font-bold text-white/75">{tr("libraryHeroCountLabel")}</p>
            <p className="mt-0.5 flex items-baseline gap-1">
              <span className="text-[36px] font-black leading-none tabular-nums drop-shadow-sm">
                {stats.total}
              </span>
              <span className="pb-1 text-sm font-bold text-white/90">
                {tr("libraryHeroCountUnit")}
              </span>
            </p>
          </div>
          <span className="mb-1 flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black text-[#FF4F8B] shadow-md">
            {tr("libraryHeroCta")}
            <ArrowRight size={12} />
          </span>
        </button>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {PERK_KEYS.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-0.5 rounded-full bg-black/12 px-2 py-0.5 text-[9px] font-bold text-white/95 ring-1 ring-white/15"
            >
              <Zap size={9} className="text-[#FFE8A8]" fill="#FFE8A8" />
              {tr(key)}
            </span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {STAT_KEYS.map((key) => {
            const meta = LIBRARY_STAT_METAS[key];
            const value = stats[key];
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(key)}
                className={cn(
                  "library-stat-cell rounded-[16px] py-2 text-center outline-none transition active:scale-[0.96] focus:outline-none focus-visible:outline-none",
                  active
                    ? "bg-white/28 ring-2 ring-white shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
                    : "bg-white/12 hover:bg-white/18"
                )}
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <HistoryTypeIcon meta={meta} className="text-white" size="md" />
                </div>
                <div className="text-[17px] font-black leading-none tabular-nums">{value}</div>
                <div className="mt-0.5 text-[8px] font-semibold leading-tight text-white/90">
                  {meta.shortLabel}
                </div>
              </button>
            );
          })}
        </div>

        {stats.total === 0 ? (
          <Link
            href="/create"
            className="inspiration-hero-cta mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-[12px] font-black text-[#FF4F8B] shadow-lg active:scale-[0.98]"
          >
            {tr("libraryHeroStartCta")}
            <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
