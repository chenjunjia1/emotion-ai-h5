"use client";

import {
  LibraryTypeIcon,
  type LibraryIconKind,
  type LibraryIconSize,
} from "@/components/icons/library-type-icons";
import type { HistoryTypeMeta } from "@/lib/history/library-meta";
import { cn } from "@/lib/utils";

function toLibSize(list?: boolean): LibraryIconSize {
  return list ? "lg" : "md";
}

export function HistoryTypeIcon({
  meta,
  list,
  className,
  size,
}: {
  meta: HistoryTypeMeta;
  list?: boolean;
  className?: string;
  size?: LibraryIconSize;
}) {
  const resolved = size ?? toLibSize(list);

  if (meta.icon !== "emoji") {
    return (
      <LibraryTypeIcon
        kind={meta.icon as LibraryIconKind}
        size={resolved}
        className={cn("play-icon-spark", className ?? "text-white")}
      />
    );
  }

  return (
    <span className={cn(list ? "text-lg" : "text-sm", className)}>{meta.emoji}</span>
  );
}

/** 统计区 / 列表左侧：渐变底 + 统一图标容器 */
export function HistoryTypeIconBadge({
  meta,
  list,
}: {
  meta: HistoryTypeMeta;
  list?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-[0_4px_14px_rgba(255,107,107,0.22)] ring-2 ring-white",
        meta.grad,
        list ? "h-12 w-12 rounded-[18px]" : "h-8 w-8 rounded-xl"
      )}
    >
      <HistoryTypeIcon meta={meta} list={list} size={list ? "lg" : "md"} />
    </div>
  );
}
