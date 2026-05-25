import {
  fetchAllDailyHotTopicsWithStats,
  fetchPlatformHotTopics,
  type PlatformFetchStats,
} from "@/lib/hot-topics/daily-hot-api-client";
import {
  filterRawTopics,
  prioritizeCreatorTopics,
} from "@/lib/hot-topics/filters";
import { fetchTianApiHotTopicsWithStats } from "@/lib/hot-topics/tianapi-client";
import type { RawHotFromApi } from "@/lib/hot-topics/types";

const DAILY_ONLY_PLATFORMS = ["bilibili", "zhihu"] as const;

export type HotFetchSource = "tianapi" | "dailyhotapi" | "hybrid";

export type HotFetchResult = {
  items: RawHotFromApi[];
  stats: PlatformFetchStats;
  source: HotFetchSource;
  primary: "tianapi" | "dailyhotapi";
  fallbackUsed: boolean;
  error?: string;
};

/** TianAPI 主源；失败 / 空数据 / 额度不足时切 DailyHotApi；B站/知乎用 DailyHot 补量 */
export async function fetchHotTopicsFromProviders(): Promise<HotFetchResult> {
  const tian = await fetchTianApiHotTopicsWithStats();
  const tianTotal = tian.items.length;

  /** 部分平台未申请(160)时仍保留 Tian 已拉到的数据，仅全空或缺 key 才切备用源 */
  const needDailyFallback =
    tianTotal === 0 || Boolean(tian.error?.includes("missing"));

  if (needDailyFallback) {
    console.warn(
      "[hot-topics] TianAPI unavailable, switching to DailyHotApi",
      tian.error ?? tian.stats
    );
    const daily = await fetchAllDailyHotTopicsWithStats();
    const items = prioritizeCreatorTopics(filterRawTopics(daily.items));
    return {
      items,
      stats: daily.stats,
      source: "dailyhotapi",
      primary: "dailyhotapi",
      fallbackUsed: true,
      error: tian.error,
    };
  }

  let items = [...tian.items];
  const stats: PlatformFetchStats = { ...tian.stats };

  const supplement = await Promise.all(
    DAILY_ONLY_PLATFORMS.map(async (p) => {
      const rows = await fetchPlatformHotTopics(p);
      stats[p] = rows.length;
      return rows;
    })
  );
  items.push(...supplement.flat());

  items = prioritizeCreatorTopics(filterRawTopics(items));

  const usedSupplement = supplement.some((s) => s.length > 0);
  return {
    items,
    stats,
    source: usedSupplement ? "hybrid" : "tianapi",
    primary: "tianapi",
    fallbackUsed: false,
  };
}
