"use client";

import Link from "next/link";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

export function HomeInviteRewards() {
  const { tr } = useApp();
  const items = [
    { label: tr("bannerRewardTitles"), bg: "bg-rose-50/90 text-rose-600" },
    { label: tr("bannerRewardPack"), bg: "bg-orange-50/90 text-orange-600" },
    { label: tr("bannerRewardLibrary"), bg: "bg-violet-50/90 text-violet-600" },
  ];

  return (
    <section className="rounded-[1.25rem] border border-orange-100/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">
          {tr("bannerInviteRewardsTitle")}
        </h3>
        <Link href="/invite" className="text-xs font-bold text-[#FF2D4D]">
          {tr("banner2Cta")} ›
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-xl px-2 py-2.5 text-center text-[11px] font-bold leading-tight",
              item.bg
            )}
          >
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}
