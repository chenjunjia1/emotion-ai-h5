import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { DAILY_HOT_PLATFORMS } from "@/lib/hot-topics/types";
import { parseHeatScore } from "@/lib/hot-topics/filters";

/** DailyHotApi 镜像（按顺序尝试） */
const API_MIRRORS = [
  process.env.DAILY_HOT_API_BASE_URL,
  "https://api-hot.imsyy.top",
  "https://hotapi.dianqianm.com",
].filter(Boolean) as string[];

type DailyHotResponse = {
  code?: number;
  data?: Array<{
    title?: string;
    name?: string;
    desc?: string;
    description?: string;
    hot?: number | string;
    url?: string;
    mobileUrl?: string;
    link?: string;
  }>;
};

function parseList(json: DailyHotResponse): DailyHotResponse["data"] {
  if (Array.isArray(json.data)) return json.data;
  return [];
}

export async function fetchPlatformHotTopics(platform: string): Promise<RawHotFromApi[]> {
  for (const baseRaw of API_MIRRORS) {
    const base = baseRaw.replace(/\/$/, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(`${base}/${platform}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "emotion-ai-h5/1.0",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = (await res.json()) as DailyHotResponse;
      const list = parseList(json) ?? [];
      const items = list
        .map((row) => ({
          title: String(row.title ?? row.name ?? "").trim(),
          desc: String(row.desc ?? row.description ?? "").trim(),
          hot: parseHeatScore(row.hot, 50000),
          url: row.url ?? row.mobileUrl ?? row.link,
          platform,
        }))
        .filter((r) => r.title.length >= 2);
      if (items.length > 0) {
        console.info(`[DailyHotApi] ${platform} ok via ${base} (${items.length})`);
        return items;
      }
    } catch {
      /* try next mirror */
    } finally {
      clearTimeout(timer);
    }
  }
  console.warn(`[DailyHotApi] ${platform} all mirrors failed`);
  return [];
}

export async function fetchAllDailyHotTopics(): Promise<RawHotFromApi[]> {
  const batches = await Promise.all(
    DAILY_HOT_PLATFORMS.map((p) => fetchPlatformHotTopics(p))
  );
  return batches.flat();
}

export type PlatformFetchStats = Record<string, number>;

export async function fetchAllDailyHotTopicsWithStats(): Promise<{
  items: RawHotFromApi[];
  stats: PlatformFetchStats;
  source: "dailyhotapi" | "empty";
}> {
  const stats: PlatformFetchStats = {};
  const items: RawHotFromApi[] = [];
  await Promise.all(
    DAILY_HOT_PLATFORMS.map(async (p) => {
      const rows = await fetchPlatformHotTopics(p);
      stats[p] = rows.length;
      items.push(...rows);
    })
  );
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return { items, stats, source: total > 0 ? "dailyhotapi" : "empty" };
}
