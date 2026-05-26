"use client";

import { Pencil } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/admin-shell";
import type { AdminHotTopicRow } from "@/lib/client/server-api";
import { cn } from "@/lib/utils";

function coverSrc(url: string): string {
  if (!url?.trim()) return "/images/hot/default.svg";
  return url;
}

export function AdminHotTopicRowCard({
  row,
  index,
  selected,
  onEdit,
}: {
  row: AdminHotTopicRow;
  index: number;
  selected: boolean;
  onEdit: () => void;
}) {
  const src = coverSrc(row.cover_image);

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-2.5 text-left transition",
        selected
          ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200"
          : "border-orange-100/80 bg-white hover:bg-orange-50/40"
      )}
    >
      <button type="button" className="relative shrink-0" onClick={onEdit}>
        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-[#FFE8F0] to-[#FFF0E8]">
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/hot/default.svg";
            }}
          />
          <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[9px] font-black text-white">
            {row.display_order || index + 1}
          </span>
          {row.badge_label ? (
            <span className="absolute bottom-0.5 right-0.5 max-w-[56px] truncate rounded bg-[#FF4F8B] px-0.5 text-[7px] font-bold text-white">
              {row.badge_label}
            </span>
          ) : null}
        </div>
      </button>

      <button type="button" className="min-w-0 flex-1 text-left" onClick={onEdit}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="line-clamp-2 text-sm font-bold text-slate-800">
            {row.display_title}
          </span>
          <AdminStatusBadge
            status={row.status}
            map={{
              active: "上架",
              inactive: "下架",
              rejected: "拒绝",
            }}
          />
        </div>
        <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
          <span className="rounded bg-[#FFF0F5] px-1 py-0.5 font-medium text-[#FF4F8B]">
            {row.category}
          </span>
          <span className="mx-1">·</span>
          {row.platform}
          <span className="mx-1">·</span>
          {row.heat_value}
        </p>
        {(row.likes_label || row.saves_label || row.comments_label) && (
          <p className="mt-0.5 text-[10px] text-slate-400">
            {row.likes_label && `赞 ${row.likes_label}`}
            {row.saves_label && ` · 藏 ${row.saves_label}`}
            {row.comments_label && ` · 评 ${row.comments_label}`}
          </p>
        )}
      </button>

      <button
        type="button"
        aria-label="编辑"
        onClick={onEdit}
        className="shrink-0 rounded-lg bg-orange-100 p-2.5 text-orange-700 active:scale-95"
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}
