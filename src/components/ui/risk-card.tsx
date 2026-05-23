"use client";

import { ShieldCheck } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { riskLevelLabel } from "@/lib/i18n/form-options";
import { cn } from "@/lib/utils";
import type { RiskResult } from "@/lib/types/v1";

export function RiskCard({ risk }: { risk: RiskResult | null }) {
  const { tr } = useApp();
  if (!risk) return null;
  const isHigh = risk.level === "高";
  const isMid = risk.level === "中";
  const levelText = riskLevelLabel(tr, risk.level);
  const words =
    risk.words.length > 0 ? risk.words.join("、") : tr("riskNone");

  return (
    <div
      className={cn(
        "rounded-3xl border p-4",
        isHigh
          ? "border-rose-200 bg-rose-50"
          : isMid
            ? "border-amber-200 bg-amber-50"
            : "border-green-200 bg-green-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "rounded-2xl p-2",
            isHigh
              ? "bg-rose-100 text-rose-600"
              : isMid
                ? "bg-amber-100 text-amber-600"
                : "bg-green-100 text-green-600"
          )}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="font-semibold">
            {tr("riskCheckTitle")}：{levelText}
            {tr("riskLevelSuffix")}
          </div>
          <div className="mt-1 text-xs leading-6 text-slate-600">
            {tr("riskWords")}：{words}。{risk.reason}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-800">
            {tr("riskSuggest")}：{risk.suggestion}
          </div>
        </div>
      </div>
    </div>
  );
}
