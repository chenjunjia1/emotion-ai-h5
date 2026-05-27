"use client";

import Link from "next/link";
import { ChevronRight, Copy, Sparkles } from "lucide-react";
import { HistoryTypeIconBadge } from "@/components/history/history-type-icon";
import { formatHistoryWhen, historyDetailHref, historyTypeMeta } from "@/lib/history/library-meta";
import type { HistoryItem } from "@/lib/types/v1";
import { cn } from "@/lib/utils";

type Props = {
  item: HistoryItem;
  index: number;
  onCopy: (text: string) => void;
};

export function LibraryHistoryCard({ item, index, onCopy }: Props) {
  const meta = historyTypeMeta(item.type);
  const href = historyDetailHref(item.id);
  const preview = item.topic || "未命名内容";
  const isRecent = index === 0;

  const body = (
    <article
      className={cn(
        "library-list-item group relative overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(255,122,174,0.1)] ring-1 transition active:scale-[0.99]",
        meta.ring,
        isRecent && "library-card-recent ring-2 ring-[#FF4F8B]/35"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className={cn("h-1 w-full bg-gradient-to-r", meta.grad)} aria-hidden />
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl bg-gradient-to-br",
          meta.grad
        )}
        aria-hidden
      />

      <div className="relative flex items-start gap-3 p-3.5">
        <HistoryTypeIconBadge meta={meta} list />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isRecent ? (
              <span className="rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-1.5 py-px text-[8px] font-black text-white shadow-sm">
                最近
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ring-1",
                "bg-[#FFF5F9] text-[#FF5C8A] ring-[#FF7AAE]/15"
              )}
            >
              {meta.shortLabel}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[15px] font-black leading-snug text-[#1F2937]">
            {preview}
          </p>
          <p className="mt-1 text-[10px] font-medium text-[#9CA3AF]">
            {formatHistoryWhen(item.createdAt)}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {href ? (
              <span className="inspiration-cta-shine inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_4px_12px_rgba(255,79,139,0.3)]">
                <Sparkles size={11} />
                继续创作
                <ChevronRight size={12} />
              </span>
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCopy(preview);
              }}
              className="inline-flex items-center gap-0.5 rounded-full bg-[#FFF5F9] px-2 py-1 text-[10px] font-bold text-[#FF5C8A] ring-1 ring-[#FFE8F0] active:scale-95"
            >
              <Copy size={11} />
              复制
            </button>
          </div>
        </div>
        {href ? (
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0F5] to-[#FFE8F0] text-[#FF4F8B] ring-1 ring-[#FFE8F0] transition group-active:scale-95">
            <ChevronRight size={18} />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}
