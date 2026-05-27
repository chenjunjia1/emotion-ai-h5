"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";
import { bannerLibraryLabel } from "@/lib/home/banner-hot-display";
import {
  HOME_FEATURE_CARDS,
  HOME_HERO_SUB,
  HOME_HERO_TITLE,
  HOME_LIVE_TICKERS,
  HOME_ROTATING_PLACEHOLDERS,
} from "@/lib/mock/expression-assistant";
import { XHS_HOME_INSPIRATION_CATEGORIES } from "@/lib/xhs/xhs-home-categories";
import { cn } from "@/lib/utils";

const QUICK_PLATFORM_CHIPS = [
  { label: "朋友圈", href: "/expression/moments", emoji: "💬" },
  { label: "小红书", href: "/expression/xhs-note", emoji: "📕" },
  { label: "短视频", href: "/publish-pack", emoji: "🎬" },
  { label: "聊天回复", href: "/emotion-chat", emoji: "💡" },
];

type HomeHeroZoneProps = {
  input: string;
  onInputChange: (v: string) => void;
  generating: boolean;
  onGenerate: (prompt?: string) => void;
};

export function HomeHeroZone({
  input,
  onInputChange,
  generating,
  onGenerate,
}: HomeHeroZoneProps) {
  const [creatorCount, setCreatorCount] = useState(30211);
  const [libraryTotal, setLibraryTotal] = useState<number | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const featured = HOME_FEATURE_CARDS.find((c) => c.featured);
  const restCards = HOME_FEATURE_CARDS.filter((c) => !c.featured);
  const libraryLabel = bannerLibraryLabel(libraryTotal);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/hot-topics/meta", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((meta: { total?: number; libraryTotal?: number } | null) => {
        const n = meta?.libraryTotal ?? meta?.total;
        if (!cancelled && typeof n === "number" && n > 0) setLibraryTotal(n);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refresh = () => setCreatorCount(getTodayInspirationCount());
    refresh();
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeoutId = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextInspirationTick());
    };
    schedule();
    const fallbackId = setInterval(refresh, 60_000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(fallbackId);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTickerIdx((i) => (i + 1) % HOME_LIVE_TICKERS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % HOME_ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const placeholder =
    input.trim().length > 0
      ? undefined
      : HOME_ROTATING_PLACEHOLDERS[placeholderIdx];

  return (
    <section className="home-hero-zone relative overflow-hidden rounded-[26px] shadow-[0_12px_40px_rgba(255,100,140,0.18)] ring-1 ring-[#FFE8F0]/90">
      {/* 背景光晕 */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFF0F8] via-[#FFFBF8] to-[#FFF5EC]"
        aria-hidden
      />
      <div
        className="home-hero-mesh pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full bg-[#FF9EC4]/35 blur-3xl"
        aria-hidden
      />
      <div
        className="home-hero-mesh pointer-events-none absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-[#FFC46B]/25 blur-3xl"
        aria-hidden
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative z-10 p-3.5">
        {/* 实时氛围条 */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="home-live-pill inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B] shadow-sm ring-1 ring-[#FFE8F0]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4F8B] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FF4F8B]" />
            </span>
            实时
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B]/10 to-[#FF9A4D]/10 px-2.5 py-1 text-[10px] font-bold text-[#374151]">
            <Users size={11} className="text-[#FF4F8B]" />
            今日 {formatInspirationCount(creatorCount)} 人在生成
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-[#6B7280] ring-1 ring-[#FFE8F0]/80">
            <Zap size={11} className="text-amber-500" />
            热点库 {libraryLabel}
          </span>
        </div>

        <p
          key={tickerIdx}
          className="home-ticker-fade mb-3 truncate rounded-xl bg-black/[0.03] px-2.5 py-1.5 text-[10px] font-medium text-[#6B7280]"
        >
          {HOME_LIVE_TICKERS[tickerIdx]}
        </p>

        {/* 主标题 + 吉祥物 */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[24px] font-black leading-[1.15] tracking-tight">
              <span className="bg-gradient-to-r from-[#FF4F8B] via-[#C084FC] to-[#FF9A4D] bg-clip-text text-transparent">
                {HOME_HERO_TITLE}
              </span>
            </h2>
            <p className="mt-1.5 text-[13px] font-semibold text-[#6B7280]">{HOME_HERO_SUB}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["更自然", "更高级", "更易获赞"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="home-mascot-float relative shrink-0" aria-hidden>
            <span className="flex h-[80px] w-[80px] items-center justify-center rounded-[24px] bg-gradient-to-br from-[#FFB8D9] via-[#FF9EC4] to-[#FFC8E8] text-[42px] shadow-[0_10px_28px_rgba(255,120,150,0.4)] ring-4 ring-white/50">
              ☁️
            </span>
            <span className="absolute -bottom-1 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow-md">
              💗
            </span>
            <Sparkles
              size={14}
              className="absolute -left-1 top-2 text-[#FF9A4D] opacity-90"
              fill="#FF9A4D"
            />
          </div>
        </div>

        {/* 搜索 */}
        <div className="home-search-glow relative mb-2.5 rounded-[20px] bg-white p-1 shadow-[0_6px_24px_rgba(255,79,139,0.12)] ring-1 ring-[#FFE8F0]">
          <div className="flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#FFFBFC] to-[#FFF8F5] px-3 py-2.5">
            <Search size={18} className="shrink-0 text-[#FF4F8B]" />
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#1F2937] outline-none placeholder:text-[#B0B8C4]"
              onKeyDown={(e) => {
                if (e.key === "Enter") onGenerate();
              }}
            />
            <button
              type="button"
              disabled={generating}
              onClick={() => onGenerate()}
              className="home-cta-shimmer flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-2.5 text-[12px] font-black text-white shadow-[0_4px_16px_rgba(255,79,139,0.45)] disabled:opacity-60"
            >
              <Sparkles size={14} />
              {generating ? "生成中" : "一键生成"}
            </button>
          </div>
        </div>

        {/* 场景快捷入口 */}
        <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {QUICK_PLATFORM_CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#374151] shadow-sm ring-1 ring-[#FFE8F0] active:scale-[0.97]"
            >
              <span>{chip.emoji}</span>
              {chip.label}
            </Link>
          ))}
        </div>

        {/* Bento 功能区 */}
        <div className="space-y-2">
          {featured ? (
            <Link
              href={featured.href}
              className="home-feature-card relative flex overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FF4F8B]/12 via-[#FFF0F5] to-[#FFE8D6] p-3.5 ring-1 ring-[#FF4F8B]/20 active:scale-[0.99]"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FF4F8B]/15 blur-2xl" />
              <div className="relative z-10 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2 py-0.5 text-[9px] font-black text-white shadow">
                    <Flame size={10} fill="currentColor" />
                    {featured.badge}
                  </span>
                  {featured.stat ? (
                    <span className="text-[9px] font-bold text-[#9CA3AF]">{featured.stat}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-[17px] font-black text-[#1F2937]">{featured.title}</p>
                <p className="mt-0.5 text-[11px] text-[#6B7280]">{featured.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {XHS_HOME_INSPIRATION_CATEGORIES.slice(0, 5).map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-white/80 px-1.5 py-0.5 text-[8px] font-bold text-[#FF4F8B]"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-[8px] font-bold text-[#9CA3AF]">
                    +3
                  </span>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FF4F8B] px-3 py-1.5 text-[11px] font-black text-white shadow-md">
                  {featured.cta}
                  <ArrowRight size={14} />
                </span>
              </div>
              <div className="relative z-10 flex flex-col items-end justify-between pl-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#FF6B6B] to-[#FF8A7A] text-3xl shadow-lg">
                  {featured.emoji}
                </span>
                <div className="mt-2 flex items-end gap-0.5 opacity-80" aria-hidden>
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-t-sm bg-gradient-to-t from-[#FF4F8B] to-[#FF9EC4]"
                      style={{ height: `${h * 0.28}px` }}
                    />
                  ))}
                </div>
              </div>
            </Link>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            {restCards.slice(0, 4).map((card, i) => (
              <Link
                key={card.id}
                href={card.href}
                className={cn(
                  "home-feature-card relative flex min-h-[100px] flex-col overflow-hidden rounded-[18px] p-3 active:scale-[0.98]",
                  "bg-gradient-to-br ring-1 ring-white/90 shadow-[0_4px_16px_rgba(255,120,150,0.1)]",
                  card.cardBg ?? "from-white to-[#FFFBFC]"
                )}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span
                  className={cn(
                    "absolute -bottom-3 -right-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-2xl opacity-90 shadow-md",
                    card.gradient
                  )}
                  aria-hidden
                >
                  {card.emoji}
                </span>
                <div className="relative z-10 min-w-0 pr-10">
                  <p className="text-[14px] font-black text-[#1F2937]">{card.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#9CA3AF]">
                    {card.desc}
                  </p>
                  {card.pills?.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {card.pills.map((pill) => (
                        <span
                          key={pill}
                          className="rounded-full bg-white/85 px-1.5 py-0.5 text-[8px] font-bold text-[#6B7280]"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="relative z-10 mt-auto flex items-center gap-0.5 pt-2 text-[10px] font-black text-[#FF4F8B]">
                  {card.cta}
                  <TrendingUp size={11} />
                </span>
              </Link>
            ))}
          </div>

          {restCards[4] ? (
            <Link
              href={restCards[4].href}
              className="home-feature-card flex items-center gap-3 rounded-[18px] bg-gradient-to-r from-[#FFFBEB] via-white to-[#FFF5F8] p-3 ring-1 ring-[#FFE8F0] active:scale-[0.99]"
            >
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br text-2xl shadow-md",
                  restCards[4].gradient
                )}
              >
                {restCards[4].emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-black text-[#1F2937]">{restCards[4].title}</p>
                <p className="text-[10px] text-[#9CA3AF]">{restCards[4].desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#FFF0F5] px-3 py-1.5 text-[11px] font-bold text-[#FF4F8B]">
                {restCards[4].cta} →
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
