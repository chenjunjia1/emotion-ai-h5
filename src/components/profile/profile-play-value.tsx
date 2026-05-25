"use client";

import { Crown, Gift, Sparkles } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import type { PlanType } from "@/lib/types/v1";
import { QUOTA_COST } from "@/lib/constants/v1";
import { cn } from "@/lib/utils";

const PLAN_ROWS: { plan: PlanType | "free"; packs: number; hot: string; box: string }[] = [
  { plan: "free", packs: 1, hot: "5条", box: "1次" },
  { plan: "pro", packs: 6, hot: "无限", box: "不限" },
  { plan: "premium", packs: 4, hot: "无限", box: "不限" },
];

export function ProfilePlayValue({ tr, plan }: { tr: (k: I18nKey) => string; plan: PlanType }) {
  const packCost = QUOTA_COST.publish_pack ?? 30;
  const row = PLAN_ROWS.find((r) => r.plan === plan) ?? PLAN_ROWS[0];

  return (
    <section className="rounded-[20px] bg-gradient-to-br from-[#FFF4F7] to-white p-3.5 ring-1 ring-[#FFE8F0]">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[#FF4F8B]" />
        <h3 className="text-[12px] font-black text-[#1F2937]">{tr("profilePlayValueTitle")}</h3>
      </div>
      <p className="mt-1 text-[10px] leading-relaxed text-[#8A94A6]">
        {tr("profilePlayValueHint").replace("{cost}", String(packCost))}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {PLAN_ROWS.map((r) => {
          const active = r.plan === row.plan;
          return (
            <li
              key={r.plan}
              className={cn(
                "flex items-center justify-between rounded-xl px-2.5 py-2 text-[10px]",
                active ? "bg-white font-black text-[#FF4F8B] shadow-sm ring-1 ring-[#FFD0E8]" : "text-[#6B7280]"
              )}
            >
              <span className="flex items-center gap-1">
                {r.plan === "free" ? (
                  <Gift size={12} />
                ) : (
                  <Crown size={12} className={active ? "text-[#FF9A4D]" : ""} />
                )}
                {tr(
                  r.plan === "free"
                    ? "profilePlayFree"
                    : r.plan === "pro"
                      ? "profilePlayPro"
                      : "profilePlayPremium"
                )}
              </span>
              <span>
                {tr("profilePlayPacksDay").replace("{n}", String(r.packs))} · 热点{r.hot} · 盲盒{r.box}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
