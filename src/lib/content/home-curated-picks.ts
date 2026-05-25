/**
 * 首页展示用「运营灵感选题」— 固定精选，不拉 TianAPI / 热搜库
 * 真实热点仅在「今日热点」Tab 展示
 */

import { coverPresetForTopic } from "@/lib/content/scene-cover-presets";
import type { ShortVideoCoverPreset } from "@/lib/content/short-video-covers";
import { buildPublishPackHref } from "@/lib/content/home-feed-mock";

export type HomeCuratedPick = {
  id: string;
  title: string;
  topic: string;
  accountType: string;
  style: string;
  platform: string;
  heatValue: string;
  viralScore: number;
  coverPreset: ShortVideoCoverPreset;
  /** 小红书笔记首图（优先于 Pexels） */
  coverImageUrl?: string;
  /** 来自 XHS 今日爆款 */
  xhsNoteId?: string;
  xhsCategory?: string;
  xhsAngle?: string;
};

/** 兜底 TOP3 — 对齐设计稿示例（封面语义匹配） */
export const HOME_INSPIRATION_TOP3: HomeCuratedPick[] = [
  {
    id: "insp-1",
    title: "下班后的治愈时刻",
    topic: "下班后的治愈时刻",
    accountType: "治愈号",
    style: "松弛",
    platform: "抖音",
    heatValue: "98.6w",
    viralScore: 82,
    coverPreset: coverPresetForTopic("下班后的治愈时刻", "insp-1"),
  },
  {
    id: "insp-2",
    title: "多巴胺穿搭上镜公式",
    topic: "多巴胺穿搭上镜公式",
    accountType: "穿搭号",
    style: "反差",
    platform: "小红书",
    heatValue: "85.4w",
    viralScore: 78,
    coverPreset: coverPresetForTopic("多巴胺穿搭上镜公式", "insp-2"),
  },
  {
    id: "insp-3",
    title: "猫咪的迷惑行为大赏",
    topic: "猫咪的迷惑行为大赏",
    accountType: "宠物号",
    style: "温柔",
    platform: "抖音",
    heatValue: "74.3w",
    viralScore: 75,
    coverPreset: coverPresetForTopic("猫咪的迷惑行为大赏", "insp-3"),
  },
];

export function buildHomePickHref(pick: HomeCuratedPick): string {
  return buildPublishPackHref({
    topic: pick.topic,
    accountType: pick.accountType,
    style: pick.style,
    platform: pick.platform,
    from: "home_inspiration_top3",
  });
}
