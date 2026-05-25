import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { YOUTH_PLATFORM_SAMPLE_LIMIT } from "@/lib/hot-topics/youth-content-policy";
import {
  dedupeRawTopics,
  filterRawTopics,
  prioritizeCreatorTopics,
} from "@/lib/hot-topics/filters";

const SAMPLE_ORDER = [
  "douyin",
  "xiaohongshu_inspiration",
  "bilibili",
  "zhihu",
  "weibo",
  "baidu",
  "toutiao",
] as const;

/** 按平台配额采样，优先短视频/生活类源，减少新闻感平台条数 */
export function sampleHotTopicsPerPlatform(
  raw: RawHotFromApi[],
  perPlatform = 4
): RawHotFromApi[] {
  const grouped = new Map<string, RawHotFromApi[]>();
  for (const item of raw) {
    const list = grouped.get(item.platform) ?? [];
    list.push(item);
    grouped.set(item.platform, list);
  }

  const out: RawHotFromApi[] = [];
  for (const platform of SAMPLE_ORDER) {
    const limit = YOUTH_PLATFORM_SAMPLE_LIMIT[platform] ?? perPlatform;
    const picked = prioritizeCreatorTopics(
      filterRawTopics(dedupeRawTopics(grouped.get(platform) ?? []))
    ).slice(0, limit);
    out.push(...picked);
  }

  for (const [platform, list] of grouped) {
    if ((SAMPLE_ORDER as readonly string[]).includes(platform)) continue;
    const picked = prioritizeCreatorTopics(filterRawTopics(dedupeRawTopics(list))).slice(
      0,
      perPlatform
    );
    out.push(...picked);
  }

  return dedupeRawTopics(out);
}
