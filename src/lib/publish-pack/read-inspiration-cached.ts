import { STORAGE_DAILY_INSPIRATION } from "@/lib/constants/v1";
import { getDailyInspirationTitles } from "@/lib/publish-pack/resolve-daily-inspiration";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function readInspirationTitlesForToday(batch = 0): string[] {
  if (typeof window === "undefined") return [];
  const key = todayKey();
  try {
    const raw = localStorage.getItem(STORAGE_DAILY_INSPIRATION);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        date?: string;
        titles?: string[];
        batch?: number;
      };
      if (
        parsed.date === key &&
        Array.isArray(parsed.titles) &&
        parsed.titles.length >= 30 &&
        (parsed.batch ?? 0) === batch
      ) {
        return parsed.titles;
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_DAILY_INSPIRATION);
  }
  return getDailyInspirationTitles(key, batch, 30);
}
