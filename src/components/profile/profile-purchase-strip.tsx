"use client";

import { Crown, Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import type { ProductDef } from "@/lib/types/v1";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const STORE_META: Record<
  string,
  { short: string; tag?: string; icon: "crown" | "zap" }
> = {
  "Pro会员 30天": { short: "Pro 月卡", tag: "推荐", icon: "crown" },
  "Pro年卡 365天": { short: "Pro 年卡", tag: "省17%", icon: "crown" },
  "灵感加油包 50点": { short: "灵感加油包", tag: "随买随用", icon: "zap" },
};

export function ProfilePurchaseStrip({
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
    <section id="membership" className="scroll-mt-24">
      <div className="mb-2 flex items-end justify-between px-0.5">
        <div>
          <h3 className="text-sm font-black text-slate-900">{tr("profileStoreTitle")}</h3>
          <p className="mt-0.5 text-[10px] text-slate-500">{tr("profileStoreDesc")}</p>
        </div>
        <span className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-bold text-[#FF5C8A]">
          3 档
        </span>
      </div>

      <div className="space-y-2">
        {products.map((p) => {
          const meta = STORE_META[p.productName] ?? {
            short: p.productName,
            icon: "zap" as const,
          };
          const Icon = meta.icon === "crown" ? Crown : Zap;
          return (
            <article
              key={p.productName}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-orange-100/90 shadow-sm"
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                  meta.icon === "crown"
                    ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF7AAE]"
                    : "bg-gradient-to-br from-[#FFC46B] to-[#FF9A6B]"
                )}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900">{meta.short}</span>
                  {meta.tag ? (
                    <span className="rounded-full bg-[#FFF0F5] px-1.5 py-0.5 text-[8px] font-black text-[#FF5C8A]">
                      {meta.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{p.desc}</p>
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
                <Sparkles size={11} className="ml-0.5 inline text-[#FFE8A8]" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
