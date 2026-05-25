"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { ShortVideoCover } from "@/components/ui/short-video-cover";
import { useApp } from "@/contexts/app-context";
import {
  HOME_TRENDING_PICKS,
  bumpLiveUsers,
  buildPublishPackHref,
  formatLiveUsers,
} from "@/lib/content/home-feed-mock";

export function HomeTrendingSection() {
  const { tr } = useApp();
  const [tick, setTick] = useState(0);

  const items = useMemo(() => {
    void tick;
    return HOME_TRENDING_PICKS.map((item) => ({
      ...item,
      live: `${formatLiveUsers(bumpLiveUsers(item.baseUsers))} ${tr("homeTrendingUsing")}`,
      href: buildPublishPackHref({
        topic: item.topic,
        accountType: item.accountType,
        style: item.style,
        platform: item.platform,
        from: "home_trending",
      }),
    }));
  }, [tr, tick]);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  return (
    <section className="home-section-card home-section-enter p-3.5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeTrendingTitle")}</h2>
          <p className="mt-0.5 text-[10px] font-medium text-[#9CA3AF]">{tr("homeTrendingSub")}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#9CA3AF] active:scale-95"
        >
          <RefreshCw size={12} />
          刷新
        </button>
      </div>

      <div className="-mx-0.5 mt-2.5 flex gap-2.5 overflow-x-auto pb-1 pl-0.5 scrollbar-none">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={item.href}
            className="trend-card-enter w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-white ring-1 ring-[#FFE8F0] active:scale-[0.97]"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="relative aspect-square w-full">
              <ShortVideoCover
                preset={item.coverPreset}
                overlayTitle={item.label}
                className="!aspect-auto h-full rounded-none"
                fill
                priority={i < 2}
              />
            </div>
            <div className="px-2 py-1.5 text-center">
              <p className="flex items-center justify-center gap-0.5 text-[9px] font-bold text-[#FF6B8A]">
                <Users size={9} />
                {item.live}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
