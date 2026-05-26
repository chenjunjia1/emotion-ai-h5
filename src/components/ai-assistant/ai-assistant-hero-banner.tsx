"use client";

import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { PartnerAvatarArt } from "@/components/onboarding/partner-avatar-art";
import type { AiAvatarId } from "@/lib/onboarding/options";
import type { I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tr = (key: I18nKey) => string;

export function AiAssistantHeroBanner({
  tr,
  avatarId,
  totalQuota,
  cost,
  featuredLabel,
  featuredEmoji,
  onPrimaryClick,
  disabled,
}: {
  tr: Tr;
  avatarId: AiAvatarId;
  totalQuota: number;
  cost: number;
  featuredLabel: string;
  featuredEmoji: string;
  onPrimaryClick: () => void;
  disabled?: boolean;
}) {
  const playsLeft = cost > 0 ? Math.floor(totalQuota / cost) : 0;

  return (
    <section className="buddy-hero-banner relative overflow-hidden rounded-[22px] shadow-[0_10px_32px_rgba(255,79,139,0.28)] ring-1 ring-white/25">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FFB347]" />
      <span
        className="buddy-hero-orb pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl"
        aria-hidden
      />
      <span
        className="buddy-hero-shine pointer-events-none absolute inset-0 opacity-20"
        aria-hidden
      />

      <div className="relative z-[1] p-4">
        <div className="flex items-center gap-3">
          <div className="buddy-hero-icon-float shrink-0">
            <PartnerAvatarArt
              id={avatarId}
              size="lg"
              className="h-14 w-14 ring-[3px] ring-white/50 shadow-lg"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-white/85">
              {tr("buddyChatBannerEyebrow")}
            </p>
            <h2 className="mt-0.5 text-[20px] font-black leading-tight tracking-tight text-white">
              {tr("buddyChatBannerHook")}
            </h2>
            <p className="mt-1 text-[12px] leading-snug text-white/90">
              {tr("buddyChatHeroSub")}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onPrimaryClick}
          className={cn(
            "buddy-hero-cta mt-4 flex w-full items-center gap-3 rounded-2xl bg-white/95 px-3.5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.1)] backdrop-blur-sm transition active:scale-[0.98]",
            disabled && "opacity-60"
          )}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F5] to-[#FFE8CC] text-xl">
            {featuredEmoji}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-black text-[#FF4F8B]">
              <Sparkles size={10} className="fill-[#FF4F8B]" />
              {tr("buddyChatBannerCtaTag")}
            </span>
            <span className="mt-1 block text-[14px] font-black leading-snug text-[#1F2937]">
              {featuredLabel}
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md">
            <ArrowRight size={18} strokeWidth={2.5} />
          </span>
        </button>

        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[10px] font-semibold text-white/88">
          <span className="inline-flex items-center gap-1">
            <Zap size={11} className="text-[#FFE8A8]" fill="currentColor" />
            {tr("buddyChatCapabilityHint")}
          </span>
          {playsLeft > 0 ? (
            <span>{tr("buddyChatBannerQuota").replace("{n}", String(playsLeft))}</span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
