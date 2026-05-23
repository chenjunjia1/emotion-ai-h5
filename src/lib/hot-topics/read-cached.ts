import type { HotTopicItem } from "@/lib/server/db/product-v1";
import { STORAGE_HOT_TOPICS } from "@/lib/constants/v1";
import { mockHotTopics } from "@/lib/mock/content-v1";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** 浏览器端同步读取：缓存 → 本地池，避免首屏 0 条 */
export function readHotTopicsForToday(batch = 0): HotTopicItem[] {
  if (typeof window === "undefined") return [];
  const key = todayKey();
  try {
    const raw = localStorage.getItem(STORAGE_HOT_TOPICS);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        date?: string;
        items?: HotTopicItem[];
        batch?: number;
      };
      if (
        parsed.date === key &&
        Array.isArray(parsed.items) &&
        parsed.items.length >= 30 &&
        (parsed.batch ?? 0) === batch
      ) {
        return parsed.items;
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_HOT_TOPICS);
  }
  return mockHotTopics(key, batch);
}
