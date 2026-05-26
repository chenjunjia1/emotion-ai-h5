"use client";

import { ArrowRight, Bot, Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import { BUDDY_CAPABILITY_TAGS } from "@/lib/operation-chat/buddy-prompts";
import { cn } from "@/lib/utils";

type Tr = (key: I18nKey) => string;

export function AiAssistantHeroBanner({
  tr,
  totalQuota,
  cost,
  featuredLabel,
  featuredEmoji,
  onPrimaryClick,
  disabled,
}: {
  tr: Tr;
  totalQuota: number;
  cost: number;
  featuredLabel: string;
  featuredEmoji: string;
  onPrimaryClick: () => void;
  disabled?: boolean;
}) {
  const playsLeft = cost > 0 ? Math.floor(totalQuota / cost) : 0;

  return (
    <section className="buddy-hero-banner relative overflow-hidden rounded-[24px] shadow-[0_12px_36px_rgba(255,79,139,0.35)] ring-1 ring-white/30">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B6E] via-[#FF6B9D] to-[#FF9A4D]" />
      <span
        className="buddy-hero-orb pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/25 blur-2xl"
        aria-hidden
      />
      <span
        className="buddy-hero-orb pointer-events-none absolute -bottom-10 left-4 h-28 w-28 rounded-full bg-[#FFE8A8]/40 blur-2xl"
        aria-hidden
        style={{ animationDelay: "1.2s" }}
      />
      <span
        className="buddy-hero-shine pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-6 top-14 text-[28px] opacity-30"
        aria-hidden
      >
        ✨
      </span>
      <span
        className="pointer-events-none absolute left-[42%] top-3 text-[18px] opacity-25"
        aria-hidden
      >
        🎬
      </span>

      <div className="relative px-4 pb-3.5 pt-4">
        <div className="flex items-start gap-3">
          <div className="buddy-hero-icon-float relative flex h-14 w-14 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-[18px] bg-white/25 blur-[2px]" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-white/35 to-white/10 ring-2 ring-white/40 backdrop-blur-md">
              <Bot size={28} className="text-white drop-shadow-sm" strokeWidth={2} />
            </span>
            <Sparkles
              size={14}
              className="absolute -right-0.5 -top-0.5 text-[#FFE8A8]"
              fill="#FFE8A8"
            />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-bold tracking-wide text-white/80">
              {tr("buddyChatBannerEyebrow")}
            </p>
            <h2 className="mt-0.5 text-[19px] font-black leading-[1.15] tracking-tight text-white drop-shadow-sm">
              {tr("buddyChatBannerHook")}
            </h2>
            <p className="mt-1 line-clamp-1 text-[11px] text-white/88">
              {tr("buddyChatHeroSub")}
            </p>
          </div>

          {totalQuota > 0 ? (
            <span className="shrink-0 rounded-full bg-white/22 px-2.5 py-1 text-[10px] font-black text-white ring-1 ring-white/30 backdrop-blur-sm">
              {totalQuota} 灵感
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {BUDDY_CAPABILITY_TAGS.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white ring-1 ring-white/20"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onPrimaryClick}
          className={cn(
            "buddy-hero-cta mt-3 flex w-full items-center gap-3 rounded-[18px] bg-white px-3.5 py-3 text-left shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition active:scale-[0.98]",
            disabled && "opacity-60"
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#FFE0C8] text-[20px]">
            {featuredEmoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[8px] font-black uppercase tracking-wider text-[#FF4F8B]">
              {tr("buddyChatBannerCtaTag")}
            </span>
            <span className="mt-0.5 block text-[13px] font-black leading-tight text-[#1F2937]">
              {tr("buddyChatBannerCta").replace("{label}", featuredLabel)}
            </span>
            <span className="mt-0.5 block text-[9px] font-medium text-[#8A94A6]">
              点一下直接出建议，约 10 秒
            </span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md">
            <ArrowRight size={18} strokeWidth={2.5} />
          </span>
        </button>

        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-black/12 px-3 py-1.5 backdrop-blur-sm">
          <span className="flex items-center gap-1 text-[9px] font-bold text-white/90">
            <Zap size={11} fill="currentColor" className="text-[#FFE8A8]" />
            {tr("buddyChatCapabilityHint")}
          </span>
          {playsLeft > 0 ? (
            <span className="text-[9px] font-black text-white/90">
              {tr("buddyChatBannerQuota").replace("{n}", String(playsLeft))}
            </span>
          ) : totalQuota > 0 ? (
            <span className="text-[9px] font-black text-white/90">剩余 {totalQuota} 灵感</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
