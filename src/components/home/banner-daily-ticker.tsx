"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";

/** Banner 顶部：每日8点更新爆品 + 今日灵感人数（3 万基准，0 点起每 5 分钟 +1） */
export function BannerDailyTicker() {
  const { tr } = useApp();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(getTodayInspirationCount());

    refresh();
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timeoutId = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextInspirationTick());
    };

    schedule();
    const fallbackId = setInterval(refresh, 60_000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(fallbackId);
    };
  }, []);

  return (
    <div
      className="flex w-full justify-center px-0.5"
      aria-live="polite"
    >
      <div className="flex max-w-full items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 shadow-[0_4px_14px_rgba(255,77,148,0.18)] ring-1 ring-white/80">
        <Bell size={13} className="shrink-0 text-[#FF4D94]" strokeWidth={2.5} />
        <p className="truncate text-[10px] font-black leading-tight text-[#FF4D94] sm:text-[11px]">
          {tr("bannerTickerHot")}
          <span className="mx-1 font-bold text-[#FF7AAE]/80">·</span>
          {tr("bannerTickerInspiration").replace(
            "{count}",
            formatInspirationCount(count)
          )}
        </p>
      </div>
    </div>
  );
}
