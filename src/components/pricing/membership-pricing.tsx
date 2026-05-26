"use client";

import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import {
  MEMBERSHIP_MARKETING,
  MEMBERSHIP_TIER_PRODUCT_NAMES,
  type MembershipPlan,
} from "@/lib/constants/v1";
import type { PlanType, ProductDef } from "@/lib/types/v1";
import { PlanTierIcon } from "@/components/pricing/plan-tier-icon";
import { cn } from "@/lib/utils";

const TIER_STYLE: Record<
  MembershipPlan,
  {
    card: string;
    accent: string;
    price: string;
    tag?: string;
    tagClass?: string;
    quotaBg: string;
  }
> = {
  pro: {
    card: "from-[#FFF5F0] via-white to-[#FFF0F5] ring-[#FF7AAE]/45 shadow-[0_12px_36px_rgba(255,107,107,0.18)]",
    accent: "from-[#FF6B6B] to-[#FF7AAE]",
    price: "text-[#FF5C8A]",
    tag: "很多人选",
    tagClass: "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white",
    quotaBg: "bg-[#FFF0F3] text-[#FF5C8A]",
  },
  premium: {
    card: "from-[#FAF5FF] via-white to-[#FFF8EE] ring-[#C084FC]/35 shadow-[0_10px_32px_rgba(192,132,252,0.12)]",
    accent: "from-[#A855F7] via-[#FF7AAE] to-[#FFC46B]",
    price: "text-[#9B4DFF]",
    tag: "稳步成长",
    tagClass: "bg-gradient-to-r from-[#A855F7] to-[#FF7AAE] text-white",
    quotaBg: "bg-[#F3E8FF] text-[#7C3AED]",
  },
  studio: {
    card: "from-[#F5F3FF] via-white to-[#FFF5EC] ring-[#5B4FCF]/30 shadow-[0_12px_36px_rgba(91,79,207,0.15)]",
    accent: "from-[#5B4FCF] via-[#9B4DFF] to-[#FFC46B]",
    price: "text-[#5B4FCF]",
    tag: "团队适用",
    tagClass: "bg-gradient-to-r from-[#5B4FCF] to-[#9B4DFF] text-white",
    quotaBg: "bg-[#EDE9FE] text-[#5B4FCF]",
  },
};

const PLAN_LABEL: Record<MembershipPlan, string> = {
  pro: "Pro",
  premium: "高级",
  studio: "工作室",
};

export function MembershipPricing({
  products,
  currentPlan,
  onBack,
  onBuy,
  tr,
}: {
  products: ProductDef[];
  currentPlan: PlanType;
  onBack: () => void;
  onBuy: (p: ProductDef) => void;
  tr: (key: I18nKey) => string;
}) {
  const membership = MEMBERSHIP_TIER_PRODUCT_NAMES.map((name) =>
    products.find((p) => p.productName === name)
  ).filter((p): p is ProductDef & { plan: MembershipPlan } => Boolean(p));

  return (
    <div className="pb-4">
      <button
        type="button"
        className="mb-3 text-sm font-bold text-[#FF7AAE] active:opacity-70"
        onClick={onBack}
      >
        {tr("backProfile")}
      </button>

      <section className="relative mb-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#FF4F8B] via-[#FF6B9D] to-[#FF9A4D] p-4 shadow-[0_12px_36px_rgba(255,79,139,0.28)] ring-1 ring-white/40">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-black text-white">
            <Sparkles size={11} /> {tr("pricingEyebrow")}
          </span>
          <h1 className="mt-2 text-[22px] font-black leading-tight text-white">{tr("pricing")}</h1>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/95">{tr("pricingDesc")}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[tr("pricingHeroChip1"), tr("pricingHeroChip2"), tr("pricingHeroChip3")].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold text-white ring-1 ring-white/25"
                >
                  {chip}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <div className="space-y-3.5">
        {membership.map((p) => {
          const plan = p.plan as MembershipPlan;
          const style = TIER_STYLE[plan];
          const marketing = MEMBERSHIP_MARKETING[plan];
          const isCurrent = currentPlan === plan;
          const isRecommended = plan === "pro";

          return (
            <article
              key={p.productName}
              className={cn(
                "relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-4 ring-2 transition active:scale-[0.99]",
                style.card,
                isRecommended && "scale-[1.01] ring-[#FF7AAE]/55"
              )}
            >
              {style.tag ? (
                <div
                  className={cn(
                    "absolute right-4 top-0 rounded-b-xl px-3 py-1 text-[9px] font-black shadow-sm",
                    style.tagClass
                  )}
                >
                  {style.tag}
                </div>
              ) : null}

              <div className="flex items-start gap-3 pr-2">
                <PlanTierIcon plan={plan} className="h-12 w-12 shrink-0 [&_svg]:scale-90" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[17px] font-black text-slate-900">
                      {PLAN_LABEL[plan]}
                      <span className="ml-1 text-xs font-bold text-slate-500">· 30 天</span>
                    </h2>
                    {isCurrent ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                        当前方案
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] font-black leading-snug text-slate-800">
                    {marketing.hook}
                  </p>
                  <div
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black",
                      style.quotaBg
                    )}
                  >
                    <Zap size={11} className="fill-current" />
                    每日 {p.quota ?? 0} 灵感
                    {marketing.dailyHint ? (
                      <span className="font-semibold opacity-80">· {marketing.dailyHint}</span>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0 pt-1 text-right">
                  <div className={cn("text-[26px] font-black tabular-nums leading-none", style.price)}>
                    ¥{p.amount}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">/月</div>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {marketing.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2 text-[11px] font-medium leading-snug text-slate-700"
                  >
                    <Check size={14} className={cn("mt-0.5 shrink-0", style.price)} strokeWidth={3} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-[10px] font-semibold text-slate-400">{marketing.forWho}</p>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => onBuy(p)}
                className={cn(
                  "mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50",
                  `bg-gradient-to-r ${style.accent}`,
                  isRecommended && !isCurrent && "banner-cta-breathe"
                )}
              >
                {isCurrent ? "已开通此档" : marketing.cta}
                {!isCurrent ? <ArrowRight size={16} strokeWidth={2.5} /> : null}
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400">
        支付即视为同意
        <a href="/agreement/rights" className="font-bold text-[#FF7AAE]">
          《会员与灵感规则》
        </a>
      </p>
    </div>
  );
}
