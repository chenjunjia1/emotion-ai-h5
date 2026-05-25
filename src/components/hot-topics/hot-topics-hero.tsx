"use client";

import { Clock, Sparkles } from "lucide-react";
import { CreamPlatformIcon } from "@/components/v1/platform-cream-icon";
import { useApp } from "@/contexts/app-context";
import { formatLibraryCountLabel } from "@/lib/hot-topics/library-display";

export function HotTopicsHero({
  libraryTotal,
  todayFeatured,
  updatedAt,
  libraryLabel,
}: {
  libraryTotal: number;
  todayFeatured: number;
  updatedAt: string;
  libraryLabel?: string;
}) {
  const { tr } = useApp();
  const timeLabel = updatedAt.includes("08") ? "08:00" : updatedAt.split(" ").pop() ?? "08:00";
  const lib = libraryLabel ?? formatLibraryCountLabel(libraryTotal);

  return (
    <section className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#FF6B8A] via-[#FF8FAB] to-[#FFCBA4] px-3.5 py-3 shadow-[0_6px_20px_rgba(255,100,140,0.22)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[9px] font-bold text-white/90">
            <Clock size={11} />
            {tr("hotTopicsDailyBadge")}
          </p>
          <h2 className="mt-1 text-[15px] font-black leading-snug text-white">
            {tr("hotTopicsHeroTitle")}
          </h2>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white">
            <Sparkles size={10} />
            {tr("hotTopicsHeroCount")
              .replace("{library}", lib)
              .replace("{today}", String(todayFeatured))}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 pt-0.5">
          <CreamPlatformIcon platform="抖音" size="banner" pixelSize={26} />
          <CreamPlatformIcon platform="小红书" size="banner" pixelSize={26} />
          <CreamPlatformIcon platform="朋友圈" size="banner" pixelSize={26} />
        </div>
      </div>
    </section>
  );
}
