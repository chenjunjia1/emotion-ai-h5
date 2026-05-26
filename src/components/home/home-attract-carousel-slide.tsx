"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Gift, Sparkles, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

const FLOAT_TOPICS = [
  { emoji: "🔥", label: "爆款" },
  { emoji: "💼", label: "职场" },
  { emoji: "🐱", label: "萌宠" },
] as const;

function AttractBannerHero() {
  return (
    <div className="relative mx-auto h-[108px] w-[96px]">
      <span className="banner-pulse-ring pointer-events-none absolute left-1/2 top-[44%] h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
      <span className="banner-orb-drift-c pointer-events-none absolute -right-1 top-0 h-10 w-10 rounded-full bg-[#FFE8A8]/45 blur-md" />

      {FLOAT_TOPICS.map((t, i) => (
        <span
          key={t.label}
          className="invite-chibi-hop absolute z-20 flex items-center gap-0.5 rounded-xl bg-white px-1.5 py-1 shadow-md ring-1 ring-white/80"
          style={{
            animationDelay: `${i * 0.3}s`,
            top: i === 0 ? "2%" : i === 1 ? "36%" : "14%",
            left: i === 0 ? "-2%" : i === 1 ? "-6%" : "auto",
            right: i === 2 ? "-4%" : "auto",
            transform: `rotate(${i === 0 ? -10 : i === 1 ? 8 : 12}deg)`,
          }}
        >
          <span className="text-[10px]">{t.emoji}</span>
          <span className="text-[7px] font-black text-[#FF5C8A]">{t.label}</span>
        </span>
      ))}

      <div className="banner-gift-bounce absolute left-1/2 top-[18%] z-10 flex h-[54px] w-[54px] -translate-x-1/2 items-center justify-center rounded-[18px] bg-gradient-to-br from-white/60 to-white/25 shadow-[0_8px_22px_rgba(255,255,255,0.28)] ring-2 ring-white/55 backdrop-blur-sm">
        <Gift size={28} className="text-white drop-shadow" strokeWidth={1.6} />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC46B] text-[8px] font-black text-white shadow-sm">
          ?
        </span>
      </div>

      <span className="banner-animate-float absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-white/95 px-2 py-1 shadow-md ring-1 ring-white">
        <Bot size={12} className="text-[#FF5C8A]" strokeWidth={2.2} />
        <span className="text-[7px] font-black text-[#FF5C8A]">10秒出稿</span>
      </span>

      <span className="banner-twinkle pointer-events-none absolute right-0 top-2 text-sm">
        ✨
      </span>
    </div>
  );
}

/**
 * 轮播第 2 屏：盲盒 + AI 助手（与首屏同款左文右图，双 CTA 更清晰）
 */
export function HomeAttractCarouselSlide() {
  const router = useRouter();
  const { tr, showToast } = useApp();

  return (
    <div className="flex h-full flex-col px-3.5 pb-9 pt-2.5">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_96px] gap-1.5">
        <div className="flex min-w-0 flex-col justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <span className="banner-shimmer-tag inline-flex max-w-full items-center gap-1 truncate rounded-full bg-white/28 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              🎁 {tr("bannerAttractTag")}
            </span>
            <span className="rounded-full bg-[#FFC46B]/95 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
              {tr("bannerAttractHighlight")}
            </span>
          </div>

          <div className="min-w-0 py-0.5">
            <h2 className="text-[19px] font-black leading-[1.12] text-white">
              {tr("bannerAttractLine1")}
              <br />
              <span className="text-[13px] font-bold leading-[1.2] text-white/95">
                {tr("bannerAttractLine2")}
              </span>
            </h2>
            <p className="mt-1 text-[10px] leading-[1.35] text-white/90">
              {tr("bannerAttractDesc")}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {[tr("bannerAttractPerk1"), tr("bannerAttractPerk2")].map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg bg-white/22 px-1.5 py-0.5 text-[8px] font-bold text-white ring-1 ring-white/25"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/topic-box"
              onClick={(e) => {
                e.stopPropagation();
                showToast(tr("bannerBlindboxToast"));
              }}
              className={cn(
                "banner-cta-breathe flex flex-1 items-center justify-center gap-1 rounded-full bg-white py-2 text-[11px] font-black text-[#FF5C8A] shadow-md active:scale-[0.98]"
              )}
            >
              <Gift size={13} className="text-[#FF5C8A]" strokeWidth={2.2} />
              {tr("bannerAttractCtaBlindbox")}
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showToast(tr("bannerAttractAssistantToast"));
                router.push("/emotion-chat");
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/22 py-2 text-[11px] font-black text-white ring-1 ring-white/45 backdrop-blur-sm active:scale-[0.98]"
            >
              <Sparkles size={12} />
              {tr("bannerAttractCtaAssistant")}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center pr-0.5">
          <AttractBannerHero />
        </div>
      </div>

      <p className="mt-1 flex items-center justify-center gap-1 text-center text-[8px] font-semibold text-white/80">
        <Zap size={9} className="text-[#FFE8A8]" fill="currentColor" />
        开盒抽方向 · 助手改标题与口播 · 再去发布包出图
      </p>
    </div>
  );
}
