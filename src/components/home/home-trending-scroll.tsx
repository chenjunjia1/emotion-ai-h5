"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Flame, Users } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  TRENDING_GENERATIONS,
  bumpLiveUsers,
  buildPublishPackHref,
  formatLiveUsers,
} from "@/lib/content/home-feed-mock";
import { cn } from "@/lib/utils";

export function HomeTrendingScroll() {
  const { tr } = useApp();

  const items = useMemo(
    () =>
      TRENDING_GENERATIONS.map((item) => ({
        ...item,
        liveUsers: bumpLiveUsers(item.baseUsers),
      })),
    []
  );

  return (
    <section className="home-section-enter overflow-hidden rounded-[26px] border border-[#FFD0E8]/70 bg-gradient-to-br from-white via-[#FFF8FB] to-[#FFF3E8] p-3.5 shadow-[0_8px_28px_rgba(255,79,139,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm">
              <Flame size={14} />
            </span>
            <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeTrendingTitle")}</h2>
          </div>
          <p className="mt-1 pl-8 text-[11px] text-[#8A94A6]">{tr("homeTrendingSub")}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF0F5] px-2 py-1 text-[9px] font-black text-[#FF4F8B] ring-1 ring-[#FFD0E8]">
          <span className="live-pulse-dot h-1.5 w-1.5 rounded-full bg-[#FF4F8B]" />
          实时
        </span>
      </div>

      <div className="-mx-0.5 flex gap-3 overflow-x-auto pb-1 pl-0.5 scrollbar-none">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={buildPublishPackHref({
              topic: item.topic,
              accountType: item.accountType,
              style: item.style,
              platform: item.platform,
              from: "home_trending",
            })}
            className="trend-card-enter group w-[148px] shrink-0 overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(255,79,139,0.1)] ring-1 ring-[#FFE8F0] active:scale-[0.97]"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={cn("relative h-[52px] bg-gradient-to-br px-3 pt-2.5", item.grad)}>
              <span className="text-xl drop-shadow-sm">{item.emoji}</span>
              <span className="absolute right-2 top-2 rounded-md bg-black/20 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                {item.contentType}
              </span>
            </div>
            <div className="p-3 pt-2.5">
              <h3 className="line-clamp-2 min-h-[2.5rem] text-[12px] font-black leading-snug text-[#1F2937] group-active:text-[#FF4F8B]">
                {item.label}
              </h3>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#FF4F8B]">
                <Users size={11} className="shrink-0" />
                {formatLiveUsers(item.liveUsers)} {tr("homeTrendingUsing")}
              </p>
              <p className="mt-1 text-[9px] font-bold text-[#8A94A6]">{item.chip}</p>
              <p className="mt-2 flex items-center justify-end gap-0.5 text-[9px] font-black text-[#FF9A4D]">
                去生成
                <ChevronRight size={10} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
