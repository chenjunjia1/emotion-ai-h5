import { STORAGE_DAILY_INSPIRATION } from "@/lib/constants/v1";
import {
  getDailyInspirationItems,
  type InspirationTitleItem,
} from "@/lib/publish-pack/resolve-daily-inspiration";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function readInspirationItemsForToday(batch = 0): InspirationTitleItem[] {
  if (typeof window === "undefined") return [];
  const key = todayKey();
  try {
    const raw = localStorage.getItem(STORAGE_DAILY_INSPIRATION);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        date?: string;
        titles?: string[];
        items?: InspirationTitleItem[];
        batch?: number;
      };
      if (parsed.date === key && (parsed.batch ?? 0) === batch) {
        if (Array.isArray(parsed.items) && parsed.items.length >= 30) {
          return parsed.items;
        }
        if (Array.isArray(parsed.titles) && parsed.titles.length >= 30) {
          return getDailyInspirationItems(key, batch, 30);
        }
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_DAILY_INSPIRATION);
  }
  return getDailyInspirationItems(key, batch, 30);
}

/** @deprecated 使用 readInspirationItemsForToday */
export function readInspirationTitlesForToday(batch = 0): string[] {
  return readInspirationItemsForToday(batch).map((item) => item.title);
}
