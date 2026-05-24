import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { DAILY_HOT_PLATFORMS } from "@/lib/hot-topics/types";
import {
  dedupeRawTopics,
  filterRawTopics,
  prioritizeCreatorTopics,
} from "@/lib/hot-topics/filters";

/** 每个平台保留 N 条，保证 Tab 下内容来自对应平台热榜 */
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
  for (const platform of DAILY_HOT_PLATFORMS) {
    const picked = prioritizeCreatorTopics(
      filterRawTopics(dedupeRawTopics(grouped.get(platform) ?? []))
    ).slice(0, perPlatform);
    out.push(...picked);
  }
  return dedupeRawTopics(out);
}
