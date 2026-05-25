"use client";

import { Crown, Sparkles, Zap } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import type { ProductDef } from "@/lib/types/v1";
import { cn } from "@/lib/utils";

const STORE_META: Record<
  string,
  { short: string; tag?: string; icon: "crown" | "zap"; highlight?: boolean }
> = {
  "Pro会员 30天": { short: "Pro 月卡", tag: "推荐", icon: "crown", highlight: true },
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

  const featured = products.find((p) => STORE_META[p.productName]?.highlight) ?? products[0];
  const others = products.filter((p) => p.productName !== featured?.productName);

  const renderBuy = (p: ProductDef, large = false) => (
    <button
      type="button"
      onClick={() => onBuy(p)}
      className={cn(
        "shrink-0 rounded-full font-black text-white active:scale-95",
        large
          ? "bg-white px-4 py-2 text-[13px] text-[#FF4F8B] shadow-md"
          : "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-3 py-1.5 text-[11px] shadow-sm"
      )}
    >
      ¥{p.amount}
      {large ? null : <Sparkles size={10} className="ml-0.5 inline text-[#FFE8A8]" />}
    </button>
  );

  const featuredMeta = featured
    ? (STORE_META[featured.productName] ?? { short: featured.productName, icon: "zap" as const })
    : null;

  return (
    <section id="membership" className="scroll-mt-24">
      <div className="mb-2.5 px-0.5">
        <h3 className="text-[14px] font-black text-[#1F2937]">{tr("profileStoreTitle")}</h3>
        <p className="mt-0.5 text-[10px] text-[#8A94A6]">{tr("profileStoreDesc")}</p>
      </div>

      {featured && featuredMeta ? (
        <article className="rounded-[20px] bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] p-4 text-white shadow-[0_8px_24px_rgba(255,79,139,0.28)]">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Crown size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[16px] font-black">{featuredMeta.short}</span>
                {featuredMeta.tag ? (
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black">
                    {featuredMeta.tag}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-white/90">{featured.desc}</p>
            </div>
            {renderBuy(featured, true)}
          </div>
        </article>
      ) : null}

      {others.length > 0 ? (
        <div className="mt-2 space-y-2">
          {others.map((p) => {
            const meta = STORE_META[p.productName] ?? {
              short: p.productName,
              icon: "zap" as const,
            };
            const Icon = meta.icon === "crown" ? Crown : Zap;
            return (
              <article
                key={p.productName}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#FFE8F0]"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white",
                    meta.icon === "crown"
                      ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF7AAE]"
                      : "bg-gradient-to-br from-[#FFC46B] to-[#FF9A4D]"
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-[#1F2937]">{meta.short}</span>
                    {meta.tag ? (
                      <span className="rounded-full bg-[#FFF0F5] px-1.5 py-0.5 text-[8px] font-black text-[#FF5C8A]">
                        {meta.tag}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8A94A6]">{p.desc}</p>
                </div>
                {renderBuy(p)}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
