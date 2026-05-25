"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Megaphone } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";
import { getXhsHotNotesClientCache } from "@/lib/xhs/xhs-hot-notes-cache";

export function HomeDailyStrip() {
  const { tr } = useApp();
  const [count, setCount] = useState(30211);
  const [hotCount, setHotCount] = useState<number | null>(null);

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

  useEffect(() => {
    const cached = getXhsHotNotesClientCache();
    if (cached?.data?.length) {
      setHotCount(cached.data.length);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/xhs/hot-notes");
        if (!res.ok) return;
        const data = (await res.json()) as { data?: unknown[] };
        if (cancelled) return;
        const total = data.data?.length;
        if (typeof total === "number" && total > 0) setHotCount(total);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hotLabel =
    hotCount != null && hotCount >= 20
      ? tr("homeDailyStripHotCount").replace("{count}", String(hotCount))
      : tr("homeDailyStripHot");

  return (
    <div
      className="flex items-center gap-2 rounded-[16px] bg-white/80 px-3 py-2.5 shadow-[0_2px_10px_rgba(255,107,138,0.06)] ring-1 ring-[#FFE8F0]"
      aria-live="polite"
    >
      <Megaphone size={13} className="shrink-0 text-[#FF4F8B]" strokeWidth={2.5} />
      <p className="min-w-0 flex-1 text-[10px] font-medium leading-snug text-[#6B7280]">
        <span className="font-bold text-[#FF4F8B]">{hotLabel}</span>
        <span className="mx-1 text-[#D1D5DB]">·</span>
        {tr("homeDailyStripCreators").replace("{count}", formatInspirationCount(count))}
      </p>
      <Link
        href="/hot-topics"
        className="flex shrink-0 items-center gap-0.5 text-[10px] font-black text-[#FF4F8B] active:scale-95"
      >
        {tr("homeDailyStripView")}
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}
