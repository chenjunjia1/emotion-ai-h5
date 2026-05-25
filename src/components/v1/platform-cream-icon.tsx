"use client";

import {
  PlatformIconByKey,
  resolvePlatformIconKey,
  type PlatformIconKey,
} from "@/components/v1/platform-icons";
import { cn } from "@/lib/utils";

export type CreamPlatformKey = PlatformIconKey;

export function resolveCreamPlatform(platform: string): CreamPlatformKey {
  return resolvePlatformIconKey(platform);
}

export type CreamIconSize = "banner" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<CreamIconSize, number> = {
  banner: 34,
  sm: 40,
  md: 48,
  lg: 56,
  xl: 72,
};

/** 全站统一：高识别度简化平台图标（选中态不加图标描边，由外层卡片体现） */
export function CreamPlatformIcon({
  platform,
  size = "lg",
  pixelSize,
  active: _active = false,
  className,
}: {
  platform: string;
  size?: CreamIconSize;
  pixelSize?: number;
  /** @deprecated 选中态请只给卡片加边框，图标不再加 ring */
  active?: boolean;
  className?: string;
}) {
  void _active;
  const key = resolveCreamPlatform(platform);
  const px = pixelSize ?? SIZE_PX[size];

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <PlatformIconByKey platformKey={key} size={px} />
    </span>
  );
}

export const HOME_BANNER_PLATFORMS = [
  { key: "xiaohongshu" as const, name: "小红书" },
  { key: "douyin" as const, name: "抖音" },
  { key: "video_channel" as const, name: "视频号" },
  { key: "moments" as const, name: "朋友圈" },
] as const;

export const CREAM_PLATFORM_LIST = [
  { key: "douyin", name: "抖音", desc: "短视频脚本" },
  { key: "xiaohongshu", name: "小红书", desc: "种草笔记" },
  { key: "video_channel", name: "视频号", desc: "短视频脚本" },
  { key: "moments", name: "朋友圈", desc: "朋友圈文案" },
  { key: "kuaishou", name: "快手", desc: "短视频脚本" },
  { key: "bilibili", name: "B站", desc: "中长视频脚本" },
] as const;
