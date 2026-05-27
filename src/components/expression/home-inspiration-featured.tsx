"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { HotTopicsFeedToolbar } from "@/components/hot-topics/hot-topics-feed-toolbar";
import { XhsInspirationNoteCard } from "@/components/hot-topics/xhs-inspiration-note-card";
import { useMounted } from "@/lib/hooks/use-mounted";
import {
  apiGetInspirationPool,
  inspirationTabRailPreview,
} from "@/lib/xhs/xhs-client-api";
import { prefetchXhsCovers } from "@/lib/xhs/inspiration-cover-cache";
import { readInspirationPoolCache } from "@/lib/xhs/inspiration-pool-client-cache";
import { type XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import type { XhsHotNote } from "@/lib/xhs/types";
import { cn } from "@/lib/utils";

/** 横滑展示条数（与灵感页同源筛选后的前 N 条） */
const HOME_SLIDE_COUNT = 8;
const SLIDE_CARD_CLASS = "w-[min(82vw,292px)] shrink-0 snap-start snap-always";

function SlideSkeleton() {
  return (
    <div className="flex gap-2.5 overflow-hidden px-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            SLIDE_CARD_CLASS,
            "h-[112px] animate-pulse rounded-[18px] bg-white/90 ring-1 ring-[#FFE8F0]"
          )}
        />
      ))}
    </div>
  );
}

export function HomeInspirationFeatured() {
  const mounted = useMounted();
  const [tab, setTab] = useState<XhsFeedTab>("hot");
  const [notes, setNotes] = useState<XhsHotNote[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cached = readInspirationPoolCache(0);
    if (cached?.length) {
      setNotes(cached);
      setReady(true);
    }

    let cancelled = false;
    void apiGetInspirationPool().then((res) => {
      if (!cancelled) {
        setNotes(res.success && res.data?.length ? res.data : []);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => inspirationTabRailPreview(notes, tab, HOME_SLIDE_COUNT),
    [notes, tab]
  );

  useEffect(() => {
    if (!filtered.length) return;
    prefetchXhsCovers(filtered, 0, HOME_SLIDE_COUNT);
  }, [filtered]);

  const showSkeleton = !mounted || !ready;

  return (
    <section className="home-inspiration-panel relative z-10 overflow-hidden rounded-[20px] px-3 pb-3 pt-3">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/95 via-[#FFFBFC] to-[#FFF5F0]/90"
        aria-hidden
      />

      <div className="relative z-10 mb-2 flex items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-[0_4px_12px_rgba(255,79,139,0.35)]">
              <Sparkles size={15} strokeWidth={2.5} />
            </span>
            <h2 className="text-[16px] font-black text-[#1F2937]">今日灵感精选</h2>
          </div>
          <p className="mt-1 pl-10 text-[11px] text-[#9CA3AF]">
            小红书爆款同款 · 横滑看更多
          </p>
        </div>
        <Link
          href={`/inspiration?tab=${encodeURIComponent(tab)}`}
          prefetch
          className="mb-0.5 flex shrink-0 items-center gap-0.5 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[11px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0] active:scale-95"
        >
          更多
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="relative z-10 mb-2">
        <HotTopicsFeedToolbar tab={tab} onTabChange={setTab} compact />
      </div>

      <div className="relative z-10 -mx-3">
        {showSkeleton ? (
          <SlideSkeleton />
        ) : filtered.length === 0 ? (
          <div className="mx-3 rounded-[16px] bg-white/90 px-4 py-8 text-center ring-1 ring-[#FFE8F0]">
            <p className="text-[12px] text-[#9CA3AF]">
              暂无内容，请确认已配置 TIKHUB_API_KEY 或稍后再试
            </p>
            <Link
              href="/inspiration"
              className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-2 text-[11px] font-black text-white"
            >
              去灵感页看看
            </Link>
          </div>
        ) : (
          <div
            key={tab}
            className="home-inspiration-rail flex items-stretch gap-2.5 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-1 scrollbar-none snap-x snap-mandatory"
          >
            {filtered.map((note, i) => (
              <div key={note.noteId} className={SLIDE_CARD_CLASS}>
                <XhsInspirationNoteCard
                  note={note}
                  index={i}
                  tab={tab}
                  compact
                  slide
                />
              </div>
            ))}
            <div className="w-1 shrink-0 snap-none" aria-hidden />
          </div>
        )}
      </div>
    </section>
  );
}
