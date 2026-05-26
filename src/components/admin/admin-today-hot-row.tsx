"use client";

import { ExternalLink } from "lucide-react";
import type { AdminTodayHotQueryRow } from "@/lib/admin/today-hot-query-types";
import { formatXhsCount } from "@/lib/xhs/xhs-feed-filters";
import { cn } from "@/lib/utils";

export function AdminTodayHotRowCard({
  row,
  tabHot,
  onEdit,
}: {
  row: AdminTodayHotQueryRow;
  tabHot: boolean;
  onEdit?: () => void;
}) {
  const { note, rank, displayHeadline, displaySubline, globalRank } = row;
  const cover = note.images[0];
  const isLocalCover = Boolean(cover?.startsWith("/"));

  return (
    <div className="flex w-full items-start gap-3 rounded-xl border border-orange-100/80 bg-white p-2.5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#FFE8F0] to-[#FFF0E8]">
        {cover ? (
          <img
            src={cover}
            alt=""
            className={cn(
              "h-full w-full",
              isLocalCover ? "object-contain p-2" : "object-cover"
            )}
            loading="lazy"
            referrerPolicy={isLocalCover ? undefined : "no-referrer"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/hot/default.svg";
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#FFD6EC] to-[#FFE0C8]" />
        )}
        <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[9px] font-black text-white">
          {rank}
        </span>
        {tabHot && rank === 1 ? (
          <span className="absolute right-0.5 top-0.5 rounded bg-[#FF4F8B] px-0.5 text-[7px] font-bold text-white">
            最多人点
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded-md bg-[#FFF0F5] px-1.5 py-0.5 text-[8px] font-bold text-[#FF4F8B]">
            种草方向
          </span>
          <span className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[8px] font-bold text-[#6B7280]">
            {note.category}
          </span>
          <span className="text-[9px] text-slate-400">库序 #{globalRank}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-800">{displayHeadline}</p>
        <p className="line-clamp-1 text-[10px] text-slate-500">{displaySubline}</p>
        <p className="mt-0.5 truncate text-[9px] text-slate-400" title={note.title}>
          原标题：{note.title}
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-[9px] font-bold text-slate-500">
          <span>赞 {formatXhsCount(note.likedCount)}</span>
          <span>藏 {formatXhsCount(note.collectedCount)}</span>
          <span>评 {formatXhsCount(note.commentCount)}</span>
          <span className="text-slate-400">ID {note.noteId.slice(0, 10)}…</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-800"
          >
            编辑
          </button>
        ) : null}
        <a
          href="/hot-topics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-0.5 rounded-lg border border-orange-100 px-2 py-1 text-[10px] text-slate-600"
          title="用户端今日热点"
        >
          <ExternalLink size={10} />
          预览
        </a>
      </div>
    </div>
  );
}
