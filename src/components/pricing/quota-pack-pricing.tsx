"use client";

import { Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import type { ProductDef } from "@/lib/types/v1";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function QuotaPackPricing({
  products,
  onBuy,
  tr,
}: {
  products: ProductDef[];
  onBuy: (p: ProductDef) => void;
  tr: (key: I18nKey) => string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-sm font-black text-slate-800">{tr("quotaPackSectionTitle")}</h2>
      <p className="mt-0.5 text-[10px] text-slate-500">{tr("quotaPackSectionDesc")}</p>
      <div className="mt-3 grid gap-2.5">
        {products.map((p, i) => (
          <article
            key={p.productName}
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm",
              i === 0
                ? "ring-2 ring-[#FF7AAE]/40"
                : "ring-1 ring-orange-100/80"
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F3] to-[#FFF5EC]">
              <Zap size={20} className="text-[#FF5C8A]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-black text-slate-900">{p.productName}</span>
                {i === 0 ? (
                  <span className="rounded-full bg-[#FFF0F5] px-1.5 py-0.5 text-[8px] font-black text-[#FF5C8A]">
                    推荐
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">{p.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => onBuy(p)}
              className={cn(
                "banner-cta-breathe shrink-0 rounded-xl px-3 py-2 text-xs font-black text-white",
                `bg-gradient-to-r ${theme.primary}`,
                theme.shadow
              )}
            >
              ¥{p.amount}
              <Sparkles size={12} className="ml-1 inline text-[#FFE8A8]" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
