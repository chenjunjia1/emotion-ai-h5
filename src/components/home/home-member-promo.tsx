"use client";

import Link from "next/link";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { PRODUCTS, PLAN_QUOTA } from "@/lib/constants/v1";
import { cn } from "@/lib/utils";

const BENEFIT_KEYS = [
  "memberPromoBenefit1",
  "memberPromoBenefit2",
  "memberPromoBenefit3",
] as const;

const PRO_PRODUCT = PRODUCTS.find((p) => p.plan === "pro");

/** 首页会员入口：渐变大卡 + 明确 CTA，仅免费/未登录展示 */
export function HomeMemberPromo() {
  const { tr, user, setLoginOpen } = useApp();

  if (user && user.plan !== "free") {
    return null;
  }

  const proQuota = PLAN_QUOTA.pro;
  const price = PRO_PRODUCT?.amount ?? 39;

  const href = "/profile?pricing=1";

  const content = (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.35rem]",
        "bg-gradient-to-br from-[#FFB347] via-[#FF6B8A] to-[#FF5C7A]",
        "shadow-[0_12px_36px_rgba(255,107,107,0.35)] ring-2 ring-[#FFE8A8]/50"
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-28 rounded-full bg-[#FFE8A8]/25 blur-xl" />

      <div className="relative p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="banner-gift-bounce flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE8A8] to-[#FFC46B] shadow-lg ring-2 ring-white/60">
            <Crown size={28} className="text-[#FF5C2A]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-sm">
                👑 {tr("memberPromoBadge")}
              </span>
              <span className="rounded-full bg-[#FFE8A8] px-2 py-0.5 text-[9px] font-black text-[#FF5C2A]">
                {tr("memberPromoPrice")}
              </span>
            </div>
            <h3 className="mt-1.5 text-[17px] font-black leading-tight text-white drop-shadow-sm">
              {tr("memberPromoTitle")}
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-white/90">
              {tr("memberPromoSub")}
            </p>
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {BENEFIT_KEYS.map((key) => (
            <span
              key={key}
              className="rounded-xl bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/30 backdrop-blur-sm"
            >
              ✓ {tr(key)}
            </span>
          ))}
          <span className="rounded-xl bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#FF5C8A]">
            每日 {proQuota} 灵感 · 现仅 ¥{price}
          </span>
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <span className="banner-cta-breathe flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-[#FF5C8A] shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
          <Zap size={16} className="fill-[#FF5C8A]" />
          {tr("memberPromoCta")}
          <Sparkles size={14} className="text-[#FFC46B]" />
        </span>
      </div>
    </section>
  );

  if (!user) {
    return (
      <button type="button" className="block w-full text-left" onClick={() => setLoginOpen(true)}>
        {content}
        <p className="mt-1 text-center text-[10px] font-semibold text-[#FF7AAE]">
          {tr("memberPromoLoginHint")}
        </p>
      </button>
    );
  }

  return <Link href={href} className="block active:scale-[0.99]">{content}</Link>;
}
