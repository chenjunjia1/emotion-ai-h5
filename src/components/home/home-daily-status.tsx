"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";

/** Beta 提示条下方：每日更新状态 + 今日生成人数 */
export function HomeDailyStatus() {
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
      className="daily-status-shimmer flex items-center gap-2 rounded-2xl border border-[#FFE0EC]/80 bg-gradient-to-r from-[#FFF4F7] to-[#FFF3E8] px-3.5 py-2.5"
      aria-live="polite"
    >
      <Sparkles size={15} className="shrink-0 text-[#FF4F8B]" strokeWidth={2.5} />
      <p className="text-[11px] font-bold leading-snug text-[#1F2937]">
        <span className="text-[#FF4F8B]">{tr("bannerTickerHot")}</span>
        <span className="mx-1.5 text-[#8A94A6]">·</span>
        {tr("bannerTickerInspiration").replace("{count}", formatInspirationCount(count))}
      </p>
    </div>
  );
}
