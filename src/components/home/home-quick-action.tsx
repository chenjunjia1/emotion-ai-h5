"use client";

import Link from "next/link";
import { ChevronRight, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import type { I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function timeGreetingKey(): I18nKey {
  const hour = new Date().getHours();
  if (hour < 12) return "homeGreetMorning";
  if (hour < 18) return "homeGreetAfternoon";
  return "homeGreetEvening";
}

/** 首页主行动区 — 承接轮播，引导出发布包 */
export function HomeQuickAction() {
  const { tr } = useApp();

  return (
    <section
      aria-label={tr("homeQuickActionTitle")}
      className="home-section-enter overflow-hidden rounded-[22px] shadow-[0_8px_28px_rgba(255,79,139,0.14)] ring-1 ring-[#FFD0E8]/60"
    >
      <div className="relative bg-gradient-to-br from-[#FF4F8B] via-[#FF6B9D] to-[#FF9A4D] px-4 py-3.5">
        <span
          className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[10px] font-bold text-white/85">
              <Sparkles size={11} />
              {tr(timeGreetingKey())}
            </p>
            <h2 className="mt-0.5 text-[17px] font-black leading-tight text-white">
              {tr("homeQuickActionTitle")}
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-white/90">{tr("homeQuickActionSub")}</p>
          </div>
          <Link
            href="/publish-pack"
            className={cn(
              "flex shrink-0 flex-col items-center justify-center gap-1 rounded-[16px] bg-white px-3.5 py-2.5",
              "text-[#FF4F8B] shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.97]"
            )}
          >
            <Wand2 size={18} strokeWidth={2.4} />
            <span className="text-[10px] font-black leading-none">{tr("homeQuickActionBtn")}</span>
          </Link>
        </div>
        <Link
          href="/hot-topics"
          className="relative mt-2.5 flex items-center gap-1 text-[10px] font-bold text-white/90 active:opacity-80"
        >
          {tr("homeQuickHotTopics")}
          <ChevronRight size={12} />
        </Link>
      </div>
    </section>
  );
}
