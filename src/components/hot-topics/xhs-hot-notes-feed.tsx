"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, Heart, Bookmark, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { HotTopicsFeedToolbar } from "@/components/hot-topics/hot-topics-feed-toolbar";
import { useApp } from "@/contexts/app-context";
import type { XhsHotNote } from "@/lib/xhs/types";
import { type XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { xhsCardButtonLabel } from "@/lib/xhs/xhs-tab-ui";
import { filterXhsNotesByTab, formatXhsCount } from "@/lib/xhs/xhs-client-api";
import { formatXhsVibeLabel } from "@/lib/xhs/xhs-vibe-labels";
import { buildXhsCardCopy, buildMomentsCardCopy } from "@/lib/xhs/xhs-display-copy";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { cn } from "@/lib/utils";

function buildRewriteHref(note: XhsHotNote, tab: XhsFeedTab): string {
  const copy =
    tab === "moments" ? buildMomentsCardCopy(note) : buildXhsCardCopy(note);
  const platform = tab === "moments" || note.contentType === "朋友圈文案" ? "朋友圈" : "小红书";
  const q = new URLSearchParams({
    platform,
    topic: copy.headline.slice(0, 32),
    inspiration_mode: "xhs",
    inspiration_id: note.noteId,
    inspiration_category: note.category,
  });
  q.set(
    "inspiration_hint",
    tab === "moments"
      ? `${copy.angle}；请 AI 原创改写为朋友圈短文案（1–3 句），禁止照搬原文`
      : `${copy.angle}；请 AI 原创改写，禁止照搬原文与图片`
  );
  return `/publish-pack?${q.toString()}`;
}

function XhsNoteCard({
  note,
  index,
  locked,
  tab,
}: {
  note: XhsHotNote;
  index: number;
  locked?: boolean;
  tab: XhsFeedTab;
}) {
  const router = useRouter();
  const cover = note.images[0];
  const isMoments = tab === "moments";
  const isLife = tab === "life";
  const isWeekend = tab === "weekend";
  const isFashion = tab === "fashion";
  const isWork = tab === "work";
  const copy = isMoments ? buildMomentsCardCopy(note) : buildXhsCardCopy(note);
  const isLocalCover = Boolean(cover?.startsWith("/"));

  const vibeBadge = isMoments
    ? "朋友圈体"
    : isLife
      ? "生活感"
      : isWeekend
        ? "周末碎片"
        : isFashion
          ? "OOTD灵感"
          : isWork
            ? "打工人"
            : "种草方向";

  return (
    <li className="cv-auto">
      <article
        className={cn(
          "overflow-hidden rounded-[18px] bg-white shadow-[0_2px_14px_rgba(255,120,150,0.08)] ring-1 ring-[#FFE8F0]",
          locked && "pointer-events-none select-none blur-[2px] opacity-60",
          tab === "hot" && index === 0 && "ring-2 ring-[#FF4F8B]/40 shadow-[0_4px_20px_rgba(255,79,139,0.18)]"
        )}
      >
        <div className="flex gap-3 p-2.5">
          <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#FFF0F5] to-[#FFE8F0]">
            {cover ? (
              <img
                src={cover}
                alt=""
                width={96}
                height={96}
                className={cn(
                  "h-full w-full",
                  isLocalCover ? "object-contain p-3" : "object-cover"
                )}
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                referrerPolicy={isLocalCover ? undefined : "no-referrer"}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#FFD6EC] to-[#FFE0C8]" />
            )}
            <span className="absolute left-1 top-1 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-black/55 px-1 text-[9px] font-black text-white">
              {index + 1}
            </span>
            {tab === "hot" && index === 0 ? (
              <span className="absolute right-1 top-1 z-10 rounded-md bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-1 py-0.5 text-[7px] font-black text-white">
                最多人点
              </span>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col py-0.5">
            <div className="flex flex-wrap items-center gap-1">
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[8px] font-bold",
                  isMoments
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : isLife
                      ? "bg-[#FFF7ED] text-[#EA580C]"
                      : isWeekend
                        ? "bg-[#EFF6FF] text-[#2563EB]"
                        : isFashion
                          ? "bg-[#FDF2F8] text-[#DB2777]"
                          : isWork
                            ? "bg-[#EFF6FF] text-[#2563EB]"
                            : "bg-[#FFF0F5] text-[#FF4F8B]"
                )}
              >
                {vibeBadge}
              </span>
              <span className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[8px] font-bold text-[#6B7280]">
                {note.category}
              </span>
              <span className="rounded-md bg-[#EEF2FF] px-1.5 py-0.5 text-[8px] font-bold text-[#6366F1]">
                {formatXhsVibeLabel(note)}
              </span>
            </div>

            <h3 className="mt-1 line-clamp-2 text-[13px] font-black leading-snug text-[#1F2937]">
              {copy.headline}
            </h3>

            <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8A94A6]">
              {copy.subline}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] font-bold text-[#8A94A6]">
              <span className="inline-flex items-center gap-0.5">
                <Heart size={10} className="text-[#FF6B8A]" />
                {formatXhsCount(note.likedCount)}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Bookmark size={10} />
                {formatXhsCount(note.collectedCount)}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <MessageCircle size={10} />
                {formatXhsCount(note.commentCount)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => router.push(buildRewriteHref(note, tab))}
              className={cn(
                "mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full py-2.5 text-[11px] font-black text-white shadow-sm active:scale-[0.98]",
                isMoments
                  ? "bg-gradient-to-r from-[#10B981] to-[#34D399]"
                  : "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D]"
              )}
            >
              <Sparkles size={12} />
              {xhsCardButtonLabel(tab)}
              <ChevronRight size={12} className="opacity-90" />
            </button>
          </div>
        </div>
      </article>
    </li>
  );
}

export function XhsHotNotesFeed({
  notes,
  tab,
  onTabChange,
  onRetry,
  loading,
  error,
}: {
  notes: XhsHotNote[];
  tab: XhsFeedTab;
  onTabChange: (tab: XhsFeedTab) => void;
  onRetry?: () => void;
  loading: boolean;
  error: string | null;
}) {
  const { user, setQuotaModalOpen, tr } = useApp();
  const viewLimit = user ? FEATURE_LIMITS[user.plan].hotTopicView : 5;

  const filtered = useMemo(() => filterXhsNotesByTab(notes, tab), [notes, tab]);

  return (
    <section className="space-y-3">
      <HotTopicsFeedToolbar tab={tab} onTabChange={onTabChange} />

      {loading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[112px] animate-pulse rounded-[18px] bg-white/80 ring-1 ring-[#FFE8F0]"
            />
          ))}
          <p className="text-center text-[11px] text-[#9CA3AF]">正在拉取小红书热门图文…</p>
        </div>
      ) : null}

      {error && !loading ? (
        <div className="rounded-[16px] border border-dashed border-[#FFD0E8] bg-white/90 px-4 py-8 text-center">
          <p className="text-[13px] font-black text-[#1F2937]">{error}</p>
          <p className="mt-1 text-[10px] text-[#8A94A6]">请确认 TIKHUB_API_KEY 已配置并重启 dev</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-2 text-[11px] font-black text-white"
            >
              重试
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <div className="rounded-[16px] bg-white px-4 py-8 text-center ring-1 ring-[#FFE8F0]">
          <p className="text-[13px] font-black text-[#1F2937]">
            {tab === "life"
              ? "暂无生活感灵感"
              : tab === "weekend"
                ? "暂无周末碎片灵感"
                : tab === "moments"
                  ? "暂无适合朋友圈的灵感"
                  : tab === "work"
                    ? "暂无打工人灵感"
                    : "暂无该分类灵感"}
          </p>
          <p className="mt-1 text-[10px] text-[#8A94A6]">
            {tab === "life"
              ? "可先逛「今日爆款」或其他 Tab"
              : tab === "weekend"
                ? "周末内容更新中，可先逛「好吃好拍」"
                : tab === "moments"
                  ? "可先逛其他 Tab"
                  : tab === "work"
                    ? "可先逛「生活感」"
                    : "换个 Tab 试试"}
          </p>
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <ul className="space-y-2.5">
          {filtered.map((note, index) => {
            const locked = user?.plan === "free" && index >= viewLimit;
            const showProBanner = user?.plan === "free" && index === viewLimit;

            if (showProBanner) {
              return (
                <li key="xhs-pro-banner">
                  <div className="rounded-[16px] border border-[#FFD0E8] bg-gradient-to-r from-[#FFF4F7] to-[#FFF8F0] px-4 py-3.5 text-center">
                    <p className="text-[12px] font-black text-[#1F2937]">{tr("homeHotFreeLimit")}</p>
                    <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                      <Link
                        href="/invite"
                        className="rounded-full bg-white px-4 py-1.5 text-[11px] font-black text-[#FF4F8B] ring-1 ring-[#FFD0E8]"
                      >
                        {tr("hotTopicsUnlockInvite")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setQuotaModalOpen(true)}
                        className="rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-1.5 text-[11px] font-black text-white"
                      >
                        {tr("hotTopicsUnlockPro")}
                      </button>
                    </div>
                  </div>
                </li>
              );
            }

            return <XhsNoteCard key={note.id} note={note} index={index} locked={locked} tab={tab} />;
          })}
        </ul>
      ) : null}
    </section>
  );
}
