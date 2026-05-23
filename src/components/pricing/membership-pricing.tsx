"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import { MEMBERSHIP_MARKETING, type MembershipPlan } from "@/lib/constants/v1";
import type { PlanType, ProductDef } from "@/lib/types/v1";
import { PlanTierIcon } from "@/components/pricing/plan-tier-icon";
import { theme } from "@/lib/theme";
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
    card: "from-[#FFF5F0] via-white to-[#FFF0F5] ring-[#FF7AAE]/35 shadow-[0_10px_32px_rgba(255,107,107,0.14)]",
    accent: "from-[#FF6B6B] to-[#FF7AAE]",
    price: "text-[#FF5C8A]",
    tag: "推荐",
    tagClass: "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white",
    quotaBg: "bg-[#FFF0F3] text-[#FF5C8A]",
  },
  premium: {
    card: "from-[#FAF5FF] via-white to-[#FFF8EE] ring-[#C084FC]/30 shadow-[0_10px_32px_rgba(192,132,252,0.12)]",
    accent: "from-[#A855F7] via-[#FF7AAE] to-[#FFC46B]",
    price: "text-[#9B4DFF]",
    tag: "进阶",
    tagClass: "bg-gradient-to-r from-[#A855F7] to-[#FF7AAE] text-white",
    quotaBg: "bg-[#F3E8FF] text-[#7C3AED]",
  },
  studio: {
    card: "from-[#F5F3FF] via-white to-[#FFF5EC] ring-[#5B4FCF]/25 shadow-[0_12px_36px_rgba(91,79,207,0.15)]",
    accent: "from-[#5B4FCF] via-[#9B4DFF] to-[#FFC46B]",
    price: "text-[#5B4FCF]",
    tag: "工作室",
    tagClass: "bg-gradient-to-r from-[#5B4FCF] to-[#9B4DFF] text-white",
    quotaBg: "bg-[#EDE9FE] text-[#5B4FCF]",
  },
};

function planShortName(productName: string, plan: MembershipPlan) {
  if (plan === "pro") return "Pro";
  if (plan === "premium") return "高级";
  return "工作室";
}

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
  const membership = products.filter(
    (p): p is ProductDef & { plan: MembershipPlan } =>
      p.productType === "membership" &&
      (p.plan === "pro" || p.plan === "premium" || p.plan === "studio")
  );

  return (
    <div className="pb-4">
      <button
        type="button"
        className="mb-3 text-sm font-bold text-[#FF7AAE] active:opacity-70"
        onClick={onBack}
      >
        {tr("backProfile")}
      </button>

      <section
        className={cn(
          "relative mb-5 overflow-hidden rounded-[1.5rem] p-4",
          "bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
          "shadow-[0_12px_36px_rgba(255,107,107,0.25)] ring-1 ring-white/40"
        )}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-32 rounded-full bg-[#FFE8A8]/20 blur-xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
            <Sparkles size={11} /> {tr("pricingEyebrow")}
          </span>
          <h1 className="mt-2 text-xl font-black text-white">{tr("pricing")}</h1>
          <p className="mt-1 text-[11px] leading-relaxed text-white/90">{tr("pricingDesc")}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["灵感每日补充", "成功才扣", "主推 Pro"].map((chip) => (
              <span
                key={chip}
                className="rounded-lg bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white ring-1 ring-white/25"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-4">
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
                isRecommended && "ring-[#FF7AAE]/50"
              )}
            >
              {isRecommended ? (
                <div
                  className={cn(
                    "absolute right-4 top-0 rounded-b-xl px-3 py-1 text-[9px] font-black shadow-sm",
                    style.tagClass
                  )}
                >
                  {style.tag}
                </div>
              ) : style.tag ? (
                <span
                  className={cn(
                    "absolute right-4 top-3 rounded-full px-2 py-0.5 text-[9px] font-black",
                    style.tagClass
                  )}
                >
                  {style.tag}
                </span>
              ) : null}

              <div className="flex items-start gap-3">
                <PlanTierIcon plan={plan} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      {planShortName(p.productName, plan)}
                      <span className="ml-1 text-xs font-bold text-slate-500">30天</span>
                    </h2>
                    {isCurrent ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                        当前方案
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                    {p.productName}
                  </p>
                  <div
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black",
                      style.quotaBg
                    )}
                  >
                    <Zap size={11} className="fill-current" />
                    每日 {p.quota ?? 0} 点灵感
                  </div>
                </div>
                <div className="shrink-0 text-right pt-1">
                  <div className={cn("text-2xl font-black tabular-nums", style.price)}>
                    ¥{p.amount}
                  </div>
                  <div className="text-[9px] font-medium text-slate-400">/月</div>
                </div>
              </div>

              <p className="mt-3 text-[12px] font-black leading-snug text-slate-800">
                {marketing.tagline}
              </p>

              <ul className="mt-2.5 space-y-1.5">
                {marketing.perks.map((perk, perkIdx) => (
                  <li
                    key={`${plan}-perk-${perkIdx}`}
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-2.5 py-2 text-[10px] leading-relaxed ring-1",
                      perkIdx === 0
                        ? "bg-white font-semibold text-slate-800 shadow-sm ring-slate-200/90"
                        : "bg-white/65 font-medium text-slate-600 ring-white/80"
                    )}
                  >
                    <Check
                      size={12}
                      className={cn("mt-0.5 shrink-0", style.price)}
                      strokeWidth={3}
                    />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-[9px] font-medium text-slate-400">{marketing.forWho}</p>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => onBuy(p)}
                className={cn(
                  "banner-cta-breathe mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-md disabled:opacity-55",
                  `bg-gradient-to-r ${style.accent}`,
                  theme.shadow
                )}
              >
                {isCurrent ? "已开通此档" : tr("buy")}
                {!isCurrent ? <Sparkles size={14} className="text-[#FFE8A8]" /> : null}
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
