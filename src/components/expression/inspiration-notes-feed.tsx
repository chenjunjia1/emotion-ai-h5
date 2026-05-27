"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMounted } from "@/lib/hooks/use-mounted";
import { Loader2, RefreshCw } from "lucide-react";
import {
  XHS_HOME_INSPIRATION_TABS,
  type XhsHomeInspirationTab,
} from "@/lib/xhs/xhs-home-categories";
import {
  apiGetInspirationPool,
  apiGetXhsHotNotesMeta,
} from "@/lib/xhs/xhs-client-api";
import { buildMomentsCardCopy, buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import {
  countInspirationFeedByTab,
  filterNotesByInspirationPlatform,
  filterXhsNotesForInspirationFeed,
  type InspirationPlatformFilter,
} from "@/lib/xhs/xhs-feed-filters";
import {
  getXhsHotNotesClientCache,
  setXhsHotNotesClientCache,
} from "@/lib/xhs/xhs-hot-notes-cache";
import { INSPIRATION_POOL_TARGET } from "@/lib/xhs/inspiration-pool";
import {
  hasFullInspirationPoolCache,
  readInspirationPoolCache,
  writeInspirationPoolCache,
} from "@/lib/xhs/inspiration-pool-client-cache";
import {
  XHS_INSPIRATION_CATEGORY_MAX,
  XHS_INSPIRATION_PAGE_SIZE,
} from "@/lib/xhs/xhs-keywords";
import { prefetchXhsCovers } from "@/lib/xhs/inspiration-cover-cache";
import { InspirationNoteCard } from "@/components/expression/inspiration-note-card";
import type { XhsHotNote } from "@/lib/xhs/types";
import { cn } from "@/lib/utils";

function isValidTab(id: string | null): id is XhsHomeInspirationTab {
  if (!id) return false;
  return XHS_HOME_INSPIRATION_TABS.some((t) => t.id === id);
}

type Props = {
  initialTab?: string | null;
  query?: string;
  platform?: InspirationPlatformFilter;
};

export function InspirationNotesFeed({
  initialTab,
  query = "",
  platform = "all",
}: Props) {
  const [tab, setTab] = useState<XhsHomeInspirationTab>(() => {
    const id = initialTab ?? null;
    return isValidTab(id) ? id : "all";
  });
  const mounted = useMounted();
  const [notes, setNotes] = useState<XhsHotNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(XHS_INSPIRATION_PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (force = false) => {
    setError(null);

    let serverRevision: string | null = null;
    try {
      const meta = await apiGetXhsHotNotesMeta();
      serverRevision = meta.dataRevision;
    } catch {
      /* 元数据失败仍继续 */
    }

    let hadCache = false;

    if (!force) {
      const sessionHit = readInspirationPoolCache(0) ?? [];
      if (sessionHit.length >= INSPIRATION_POOL_TARGET) {
        hadCache = true;
        setNotes(sessionHit);
        setLoading(false);
        prefetchXhsCovers(sessionHit, 0, 28);
      }

      const legacyHit = getXhsHotNotesClientCache(serverRevision);
      if (legacyHit?.data?.length && legacyHit.data.length >= INSPIRATION_POOL_TARGET) {
        hadCache = true;
        setNotes(legacyHit.data);
        writeInspirationPoolCache(legacyHit.data, legacyHit.dataRevision);
        setLoading(false);
        prefetchXhsCovers(legacyHit.data, 0, 28);
        if (serverRevision && legacyHit.dataRevision === serverRevision) return;
      } else if (hasFullInspirationPoolCache()) {
        void apiGetInspirationPool(false).then((res) => {
          if (res.success && res.data?.length) {
            setNotes(res.data);
            writeInspirationPoolCache(res.data, res.dataRevision);
            setXhsHotNotesClientCache(res);
            prefetchXhsCovers(res.data, 0, 28);
          }
        });
        return;
      }
    }

    if (!hadCache) setLoading(true);

    const res = await apiGetInspirationPool(force);
    if (!res.success || !res.data?.length) {
      if (!hadCache) {
        setNotes([]);
        setError(res.message ?? "暂无热门图文，请稍后再试");
      }
    } else {
      setNotes(res.data);
      writeInspirationPoolCache(res.data, res.dataRevision);
      setXhsHotNotesClientCache(res);
      prefetchXhsCovers(res.data, 0, 28);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const cached = readInspirationPoolCache(0);
    if (cached?.length) {
      setNotes(cached);
      setLoading(cached.length < INSPIRATION_POOL_TARGET);
    }
    void load(false);
  }, [load, mounted]);

  useEffect(() => {
    const id = initialTab ?? null;
    if (isValidTab(id)) setTab(id);
  }, [initialTab]);

  useEffect(() => {
    setVisibleCount(XHS_INSPIRATION_PAGE_SIZE);
    tabScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [tab, query, platform]);

  const platformNotes = useMemo(
    () => filterNotesByInspirationPlatform(notes, platform),
    [notes, platform]
  );

  const feedsByTab = useMemo(() => {
    const m = new Map<XhsHomeInspirationTab, XhsHotNote[]>();
    for (const t of XHS_HOME_INSPIRATION_TABS) {
      m.set(
        t.id,
        filterXhsNotesForInspirationFeed(
          platformNotes,
          t.id,
          XHS_INSPIRATION_CATEGORY_MAX,
          platform
        )
      );
    }
    return m;
  }, [platformNotes, platform]);

  const feedCounts = useMemo(() => countInspirationFeedByTab(platformNotes), [platformNotes]);

  const filtered = useMemo(() => {
    let list = feedsByTab.get(tab) ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((n) => {
      const copy =
        platform === "moments" ? buildMomentsCardCopy(n) : buildXhsCardCopy(n);
      const hay = `${copy.headline}${copy.subline}${n.title}${n.category}${n.desc}`.toLowerCase();
      return hay.includes(q);
    });
  }, [feedsByTab, tab, query, platform]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const next = Math.min(visibleCount + XHS_INSPIRATION_PAGE_SIZE, filtered.length);
    prefetchXhsCovers(filtered, visibleCount, XHS_INSPIRATION_PAGE_SIZE + 8);
    requestAnimationFrame(() => {
      setVisibleCount(next);
      setLoadingMore(false);
    });
  }, [filtered, visibleCount, hasMore, loadingMore]);

  useEffect(() => {
    if (!filtered.length) return;
    prefetchXhsCovers(filtered, 0, Math.min(visibleCount + 12, filtered.length));
  }, [filtered, visibleCount]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "240px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore, tab, filtered.length]);

  return (
    <div className="space-y-3">
      <div
        ref={tabScrollRef}
        className="sticky top-0 z-20 -mx-0.5 flex gap-2 overflow-x-auto bg-gradient-to-b from-[#FFF6FA] via-[#FFFBFC]/95 to-transparent pb-2 pt-0.5 scrollbar-none backdrop-blur-sm"
      >
        {XHS_HOME_INSPIRATION_TABS.map((t) => {
          const count =
            t.id === "all"
              ? (feedCounts.get("all") ?? 0)
              : (feedCounts.get(t.id) ?? 0);
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "home-tab-chip flex shrink-0 items-center gap-1 rounded-full py-1.5 pl-3 pr-2.5 text-[11px] font-bold transition-all",
                active
                  ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-[0_4px_12px_rgba(255,79,139,0.3)]"
                  : "bg-white/90 text-[#6B7280] ring-1 ring-[#FFE8F0]"
              )}
            >
              <span>{t.label}</span>
              {!loading && count > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[9px] font-black tabular-nums",
                    active ? "bg-white/25 text-white" : "bg-[#FFF0F5] text-[#FF4F8B]"
                  )}
                >
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {!loading && platformNotes.length > 0 ? (
        <p className="px-0.5 text-[10px] text-[#9CA3AF]">
          {platform === "xhs"
            ? "小红书向"
            : platform === "moments"
              ? "朋友圈向"
              : ""}
          共 {filtered.length} 条灵感 · 下滑自动加载
        </p>
      ) : null}

      {loading && visible.length === 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-[14px] bg-gradient-to-br from-[#FFE8F0] to-[#FFF5F8]"
            />
          ))}
        </div>
      ) : null}

      {error && !loading && visible.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#FFD0E8] bg-white/90 px-4 py-10 text-center">
          <p className="text-[13px] font-bold text-[#374151]">{error}</p>
          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FFF0F5] px-4 py-2 text-[12px] font-bold text-[#FF4F8B]"
          >
            <RefreshCw size={14} />
            重新加载
          </button>
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="py-10 text-center text-[12px] text-[#9CA3AF]">没有匹配的灵感，换个分类试试～</p>
      ) : null}

      {visible.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            {visible.map((note, i) => (
              <InspirationNoteCard
                key={note.noteId}
                note={note}
                index={i}
                platform={platform}
                compact
                showTodayBadge={tab === "all" && i === 0 && !query.trim()}
              />
            ))}
          </div>

          <div ref={loadMoreRef} className="flex min-h-[44px] items-center justify-center py-2">
            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F5] px-4 py-2 text-[11px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0] active:scale-95"
              >
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                {loadingMore
                  ? "加载中…"
                  : `加载更多（${filtered.length - visibleCount} 条）`}
              </button>
            ) : filtered.length > 0 ? (
              <p className="text-[10px] text-[#C4C9D4]">已经到底啦</p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
