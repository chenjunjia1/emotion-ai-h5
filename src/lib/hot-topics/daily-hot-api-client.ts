import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { DAILY_HOT_PLATFORMS } from "@/lib/hot-topics/types";
import { parseHeatScore } from "@/lib/hot-topics/filters";

const DEFAULT_BASE = "https://api-hot.imsyy.top";

function getBaseUrl(): string {
  return (process.env.DAILY_HOT_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

type DailyHotResponse = {
  code?: number;
  data?: Array<{
    title?: string;
    desc?: string;
    description?: string;
    hot?: number | string;
    url?: string;
    mobileUrl?: string;
  }>;
};

export async function fetchPlatformHotTopics(platform: string): Promise<RawHotFromApi[]> {
  const base = getBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(`${base}/${platform}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as DailyHotResponse;
    const list = json.data ?? [];
    return list
      .map((row) => ({
        title: String(row.title ?? "").trim(),
        desc: String(row.desc ?? row.description ?? "").trim(),
        hot: parseHeatScore(row.hot, 50000),
        url: row.url ?? row.mobileUrl,
        platform,
      }))
      .filter((r) => r.title.length >= 2);
  } catch (e) {
    console.warn(`[DailyHotApi] ${platform} failed`, e);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAllDailyHotTopics(): Promise<RawHotFromApi[]> {
  const batches = await Promise.all(
    DAILY_HOT_PLATFORMS.map((p) => fetchPlatformHotTopics(p))
  );
  return batches.flat();
}
