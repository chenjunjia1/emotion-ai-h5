"use client";

import { ChevronRight, Sparkles, Heart, Bookmark, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { XhsHotNote } from "@/lib/xhs/types";
import { type XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { xhsCardButtonLabel } from "@/lib/xhs/xhs-tab-ui";
import { formatXhsCount } from "@/lib/xhs/xhs-feed-filters";
import { formatXhsVibeLabel } from "@/lib/xhs/xhs-vibe-labels";
import { buildXhsCardCopy, buildMomentsCardCopy } from "@/lib/xhs/xhs-display-copy";
import { InspirationNoteCover } from "@/components/expression/inspiration-note-cover";
import { saveInspirationPick } from "@/lib/inspiration/inspiration-create-bridge";
import { cn } from "@/lib/utils";

export function buildInspirationRewriteHref(note: XhsHotNote, tab: XhsFeedTab): string {
  const copy = tab === "moments" ? buildMomentsCardCopy(note) : buildXhsCardCopy(note);
  const platform =
    tab === "moments" || note.contentType === "朋友圈文案" ? "朋友圈" : "小红书";
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
  q.set("from", "inspiration");
  q.set("returnTo", tab === "hot" ? "/inspiration?tab=hot" : `/inspiration?tab=${tab}`);
  return `/publish-pack?${q.toString()}`;
}

type Props = {
  note: XhsHotNote;
  index: number;
  tab: XhsFeedTab;
  locked?: boolean;
  compact?: boolean;
  /** 首页横滑卡：固定宽度容器内铺满 */
  slide?: boolean;
};

/** 灵感页 / 首页共用的热门图文卡片（左图右文 + 互动数据） */
export function XhsInspirationNoteCard({
  note,
  index,
  tab,
  locked,
  compact,
  slide,
}: Props) {
  const router = useRouter();
  const isMoments = tab === "moments";
  const isLife = tab === "life";
  const isWeekend = tab === "weekend";
  const isFashion = tab === "fashion";
  const isWork = tab === "work";
  const copy = isMoments ? buildMomentsCardCopy(note) : buildXhsCardCopy(note);

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
    <article
      className={cn(
        "isolate overflow-hidden rounded-[18px] bg-white shadow-[0_2px_14px_rgba(255,120,150,0.08)] ring-1 ring-inset ring-[#FFE8F0] transition-transform duration-300 active:scale-[0.99]",
        locked && "pointer-events-none select-none blur-[2px] opacity-60",
        tab === "hot" &&
          index === 0 &&
          (slide || !compact) &&
          "inspiration-feed-card-hot border-2 border-[#FF4F8B]/35",
        slide && "h-full"
      )}
    >
      <div className={cn("flex h-full gap-3", compact || slide ? "p-2" : "p-2.5")}>
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-[18px] bg-gradient-to-br from-[#FFF0F5] to-[#FFE8F0]",
            compact ? "h-[88px] w-[88px]" : "h-[96px] w-[96px]"
          )}
        >
          <InspirationNoteCover note={note} priority={index < 4} variant="thumb" />
          <span
            className={cn(
              "absolute left-1 top-1 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[9px] font-black text-white shadow-sm",
              index === 0
                ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D]"
                : index === 1
                  ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF9A4D]"
                  : index === 2
                    ? "bg-[#F59E0B]/90"
                    : "bg-black/55"
            )}
          >
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

          <h3
            className={cn(
              "mt-1 line-clamp-2 font-black leading-snug text-[#1F2937]",
              compact ? "text-[12px]" : "text-[13px]"
            )}
          >
            {copy.headline}
          </h3>

          <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8A94A6]">{copy.subline}</p>

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
            onClick={() => {
              saveInspirationPick(note, tab === "moments" ? "moments" : "xhs");
              router.push(buildInspirationRewriteHref(note, tab));
            }}
            className={cn(
              "inspiration-cta-shine mt-2 inline-flex w-full items-center justify-center gap-1 rounded-full font-black text-white shadow-sm active:scale-[0.98]",
              compact ? "py-2 text-[10px]" : "py-2.5 text-[11px]",
              isMoments
                ? "bg-gradient-to-r from-[#10B981] to-[#34D399]"
                : "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D]"
            )}
          >
            <Sparkles size={compact ? 11 : 12} />
            {xhsCardButtonLabel(tab)}
            <ChevronRight size={12} className="opacity-90" />
          </button>
        </div>
      </div>
    </article>
  );
}
