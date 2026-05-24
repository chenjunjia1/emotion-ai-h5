import type { HotTopicItem } from "@/lib/hot-topics/types";
import { normalizeHeat, type HeatLevel } from "@/lib/content/heat-level";
import { resolveHotTopicCover } from "@/lib/content/hot-topic-covers";

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 爆/高/中 → 98.6w 风格展示热度（同一 id 稳定） */
export function formatHeatValue(heat: string, seed: string): string {
  const level = normalizeHeat(heat);
  const h = hashStr(seed);
  const decimal = (h % 10) / 10;

  if (level === "爆") return `${(88 + (h % 12) + decimal).toFixed(1)}w`;
  if (level === "高") return `${(52 + (h % 28) + decimal).toFixed(1)}w`;
  return `${(18 + (h % 22) + decimal).toFixed(1)}w`;
}

/** 由热度等级推导爆款概率 */
export function deriveViralScore(heat: string, seed: string): number {
  const level = normalizeHeat(heat);
  const h = hashStr(seed);
  if (level === "爆") return 78 + (h % 18);
  if (level === "高") return 65 + (h % 16);
  return 55 + (h % 14);
}

function extractPlatform(desc: string, fallback = "抖音"): string {
  const platforms = ["抖音", "小红书", "视频号", "微博", "B站"];
  for (const p of platforms) {
    if (desc.includes(p)) return p;
  }
  return fallback;
}

/** 补齐封面、热度数值、爆款概率等展示字段（不覆盖已有值） */
export function ensureHotTopicFields(item: HotTopicItem): HotTopicItem {
  const seed = item.id || item.title;
  const heat = normalizeHeat(item.heat);

  return {
    ...item,
    heat,
    coverImage: item.coverImage ?? resolveHotTopicCover(item),
    heatValue: item.heatValue ?? formatHeatValue(item.heat, seed),
    viralScore: item.viralScore ?? deriveViralScore(item.heat, seed),
    platform: item.platform ?? extractPlatform(item.desc),
  };
}

export function ensureHotTopicFieldsList(items: HotTopicItem[]): HotTopicItem[] {
  return items.map(ensureHotTopicFields);
}

export type { HeatLevel };
