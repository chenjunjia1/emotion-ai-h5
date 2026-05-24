"use client";

import { Shield, Sparkles, Gift } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

const ITEMS = [
  { icon: Shield, labelKey: "loginTrustSafe" as const, color: "text-emerald-500" },
  { icon: Sparkles, labelKey: "loginTrustFast" as const, color: "text-[#FF7AAE]" },
  { icon: Gift, labelKey: "loginTrustGift" as const, color: "text-amber-500" },
] as const;

/** 登录弹窗底部：简洁信任说明（无小图/月桂） */
export function LoginTrustFooter() {
  const { tr } = useApp();

  return (
    <div className="mt-4 space-y-2.5">
      <div
        className={cn(
          "flex items-stretch justify-between gap-1 rounded-2xl",
          "bg-gradient-to-r from-[#FFF8F5] via-white to-orange-50/90 px-2 py-3 ring-1 ring-orange-100/70"
        )}
      >
        {ITEMS.map(({ icon: Icon, labelKey, color }, i) => (
          <div
            key={labelKey}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 px-0.5 text-center",
              i < ITEMS.length - 1 && "border-r border-orange-100/80"
            )}
          >
            <Icon size={16} className={color} strokeWidth={2.2} />
            <span className="text-[10px] font-bold leading-tight text-slate-600">
              {tr(labelKey)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] leading-relaxed text-slate-400">
        {tr("loginTrustNote")}
      </p>
    </div>
  );
}
