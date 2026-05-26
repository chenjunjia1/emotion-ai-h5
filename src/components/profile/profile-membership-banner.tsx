"use client";

import { ChevronRight, Crown, Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import { MEMBERSHIP_MARKETING, type MembershipPlan } from "@/lib/constants/v1";
import type { User } from "@/lib/types/v1";
import { cn } from "@/lib/utils";

type Tr = (key: I18nKey) => string;

const PERK_KEYS_FREE = [
  "memberPromoBenefit1",
  "memberPromoBenefit2",
  "memberPromoBenefit3",
] as const;

export function ProfileMembershipBanner({
  user,
  tr,
  onOpenPricing,
}: {
  user: User;
  tr: Tr;
  onOpenPricing: () => void;
}) {
  const isFree = user.plan === "free";
  const marketing = !isFree ? MEMBERSHIP_MARKETING[user.plan as MembershipPlan] : null;

  return (
    <button
      type="button"
      onClick={onOpenPricing}
      className={cn(
        "profile-membership-banner group relative w-full overflow-hidden rounded-[22px] text-left shadow-[0_10px_28px_rgba(255,79,139,0.32)] ring-2 ring-white/50 transition active:scale-[0.99]",
        isFree
          ? "bg-gradient-to-br from-[#FF4F8B] via-[#FF6B9D] to-[#FF9A4D]"
          : "bg-gradient-to-br from-[#FFB347] via-[#FF7AAE] to-[#FF4F8B]"
      )}
    >
      <span
        className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-6 left-2 h-20 w-20 rounded-full bg-[#FFE8A8]/30 blur-xl"
        aria-hidden
      />

      <div className="relative flex items-center gap-3 px-3.5 py-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-inner ring-2 ring-white/35 backdrop-blur-sm">
          <Crown size={26} className="text-white drop-shadow-sm" strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[15px] font-black text-white">
              {isFree ? tr("profileMemberBannerTitleFree") : tr("profileMemberBannerTitlePaid")}
            </span>
            {isFree ? (
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black text-white ring-1 ring-white/30">
                {tr("memberPromoPrice")}
              </span>
            ) : (
              <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-[#E85D04] shadow-sm">
                {user.plan === "pro"
                  ? tr("planPro")
                  : user.plan === "premium"
                    ? tr("planPremium")
                    : tr("planStudio")}
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-white/92">
            {isFree ? tr("memberPromoSub") : marketing?.hook ?? tr("profileMemberBannerSubPaid")}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {(isFree ? PERK_KEYS_FREE : []).map((key) => (
              <span
                key={key}
                className="rounded-lg bg-white/20 px-1.5 py-0.5 text-[8px] font-bold text-white ring-1 ring-white/25"
              >
                {tr(key)}
              </span>
            ))}
            {!isFree ? (
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-white/20 px-1.5 py-0.5 text-[8px] font-bold text-white ring-1 ring-white/25">
                <Zap size={9} className="text-[#FFE8A8]" fill="currentColor" />
                {tr("profileMemberBannerPerkQuota")}
              </span>
            ) : null}
          </div>
        </div>

        <span className="flex shrink-0 flex-col items-center gap-0.5">
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-3 py-2 text-[11px] font-black shadow-md transition group-active:scale-95",
              isFree ? "bg-white text-[#FF4F8B]" : "bg-white/95 text-[#E85D04]"
            )}
          >
            {isFree ? (
              <>
                <Sparkles size={12} />
                {tr("memberPromoCta")}
              </>
            ) : (
              tr("buyBenefitsRenew")
            )}
          </span>
          <ChevronRight size={16} className="text-white/80" />
        </span>
      </div>
    </button>
  );
}
