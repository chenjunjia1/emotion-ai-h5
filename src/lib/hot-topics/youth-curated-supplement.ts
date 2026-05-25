import { buildMockHotTopicRows } from "@/lib/hot-topics/mock-hot-topics-seed";
import { looksLikeNewsOrHardToFilm } from "@/lib/hot-topics/youth-content-policy";
import type { HotTopicInsert } from "@/lib/server/db/hot-topics-db";

/** 今日热点 Tab 最少可展示条数（含 API + 精选补齐） */
export const MIN_ACTIVE_HOT_TOPICS = 48;

/**
 * 当 TianAPI + AI 过滤后条数不足时，用预置青年向选题补齐，保证用户打开就能用。
 * 仅补充不重复 display_title 的条目。
 */
export function buildYouthCuratedSupplement(
  batchDate: string,
  existing: HotTopicInsert[],
  targetTotal = MIN_ACTIVE_HOT_TOPICS
): HotTopicInsert[] {
  const active = existing.filter((r) => r.status === "active");
  const need = Math.max(0, targetTotal - active.length);
  if (need === 0) return [];

  const seen = new Set(active.map((r) => r.display_title.trim()));
  const pool = buildMockHotTopicRows(batchDate).filter(
    (r) =>
      r.status === "active" &&
      !seen.has(r.display_title.trim()) &&
      !looksLikeNewsOrHardToFilm(r.display_title, r.raw_title)
  );

  return pool.slice(0, need).map((r, i) => ({
    ...r,
    summary: `【精选灵感】${r.summary.replace(/（来源：[^）]+）/g, "")}`,
    is_new: i < 2,
    safe_score: Math.max(85, r.safe_score ?? 85),
    content_value_score: Math.max(65, r.content_value_score ?? 70),
  }));
}
