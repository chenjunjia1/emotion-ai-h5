"use client";

import { useMemo } from "react";
import { ShortVideoCover } from "@/components/ui/short-video-cover";
import { coverPresetForListItem } from "@/lib/content/unique-topic-covers";
import type { ShortVideoCoverPreset } from "@/lib/content/short-video-covers";

type CoverItem = {
  coverImage?: string;
  title?: string;
  topic?: string;
  track?: string;
  category?: string;
  accountType?: string;
  id?: string;
  coverGradient?: string;
  displayTitle?: string;
};

/** 热点卡片封面 — 优先传入的去重 preset，否则按标题+id 匹配 */
export function HotTopicCover({
  item,
  preset: presetProp,
  className,
  priority = false,
  iconSize: _iconSize,
}: {
  item: CoverItem;
  preset?: ShortVideoCoverPreset;
  className?: string;
  iconSize?: number;
  priority?: boolean;
}) {
  void _iconSize;

  const preset = useMemo(() => {
    if (presetProp) return presetProp;
    const title = item.displayTitle ?? item.title ?? item.topic ?? "";
    const category = item.category ?? item.track ?? "";
    return coverPresetForListItem({
      id: item.id ?? title,
      title,
      category,
      track: item.track,
    });
  }, [presetProp, item]);

  return (
    <ShortVideoCover
      preset={preset}
      className={className}
      priority={priority}
      fill
    />
  );
}
