import { fetchAllDailyHotTopicsWithStats } from "@/lib/hot-topics/daily-hot-api-client";
import {
  processHotTopicsWithAi,
  toInsertRow,
} from "@/lib/hot-topics/ai-process-hot-topics";
import { HOT_TOPIC_LIST_LIMIT, DAILY_HOT_PLATFORMS } from "@/lib/hot-topics/types";
import {
  buildMockHotTopicRows,
  buildMockRawFromRows,
} from "@/lib/hot-topics/mock-hot-topics-seed";
import { sampleHotTopicsPerPlatform } from "@/lib/hot-topics/platform-sampling";
import { buildXhsInspirationRows } from "@/lib/hot-topics/xhs-inspiration";
import {
  countActiveHotTopics,
  replaceHotTopicsBatch,
  type HotTopicInsert,
} from "@/lib/server/db/hot-topics-db";
import type { RawHotFromApi } from "@/lib/hot-topics/types";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export type UpdateHotTopicsResult = {
  ok: boolean;
  source: "dailyhotapi" | "mock" | "hybrid" | "fallback";
  count: number;
  batchDate: string;
  platformStats?: Record<string, number>;
  error?: string;
};

function mockRawForPlatform(batchDate: string, platform: string, count = 4): RawHotFromApi[] {
  return buildMockHotTopicRows(batchDate)
    .filter((r) => r.platform === platform)
    .slice(0, count)
    .map((r) => ({
      title: r.raw_title,
      desc: r.summary,
      hot: r.heat_score,
      platform: r.platform,
      url: r.source_url ?? undefined,
    }));
}

/** 各平台至少保留 perPlatform 条；API 某平台为空时用 mock 补齐 */
function buildRawWithPlatformFallback(
  apiItems: RawHotFromApi[],
  stats: Record<string, number>,
  batchDate: string,
  perPlatform = 4
): { raw: RawHotFromApi[]; usedMockPlatforms: string[] } {
  const sampled = sampleHotTopicsPerPlatform(apiItems, perPlatform);
  const usedMockPlatforms: string[] = [];
  const out = [...sampled];

  for (const platform of DAILY_HOT_PLATFORMS) {
    const have = out.filter((r) => r.platform === platform).length;
    if (have >= perPlatform) continue;
    const need = perPlatform - have;
    const filler = mockRawForPlatform(batchDate, platform, need);
    if (filler.length) usedMockPlatforms.push(platform);
    out.push(...filler);
  }

  const apiTotal = Object.values(stats).reduce((a, b) => a + b, 0);
  if (apiTotal === 0) {
    return {
      raw: buildMockRawFromRows(buildMockHotTopicRows(batchDate)),
      usedMockPlatforms: [...DAILY_HOT_PLATFORMS],
    };
  }

  return { raw: out, usedMockPlatforms };
}

/** 拉取 → 按平台采样 → AI 加工 → 入库 */
export async function runHotTopicsUpdatePipeline(
  batchDate = todayDate()
): Promise<UpdateHotTopicsResult> {
  const { items, stats } = await fetchAllDailyHotTopicsWithStats();
  const apiTotal = Object.values(stats).reduce((a, b) => a + b, 0);

  if (apiTotal === 0) {
    const mockRows = buildMockHotTopicRows(batchDate);
    const xhsRows = buildXhsInspirationRows(
      mockRows.map((r) => ({
        raw_title: r.raw_title,
        display_title: r.display_title,
        summary: r.summary,
        category: r.category,
        tags: r.tags,
        target_users: r.target_users,
        recommend_angles: r.recommend_angles,
        viral_score: r.viral_score,
        platform: r.platform,
      })),
      buildMockRawFromRows(mockRows),
      batchDate,
      6,
      new Set(mockRows.filter((r) => r.platform === "douyin").map((r) => r.raw_title))
    );
    const merged = [...mockRows, ...xhsRows];
    const save = await replaceHotTopicsBatch(batchDate, merged);
    return {
      ok: save.ok,
      source: "mock",
      count: save.count,
      batchDate,
      platformStats: stats,
      error: save.error,
    };
  }

  const { raw, usedMockPlatforms } = buildRawWithPlatformFallback(items, stats, batchDate, 4);
  const processed = await processHotTopicsWithAi(raw, 28);

  const rows: HotTopicInsert[] = processed.map((p, i) => {
    const rawItem = raw.find((r) => r.title === p.raw_title && r.platform === p.platform) ?? raw[i] ?? raw[0];
    return toInsertRow(p, rawItem, batchDate, i);
  });

  const xhsRows = buildXhsInspirationRows(
    processed,
    raw,
    batchDate,
    6,
    new Set(rows.filter((r) => r.platform === "douyin").map((r) => r.raw_title))
  );
  const merged: HotTopicInsert[] = [...rows];
  const seenTitles = new Set(rows.map((r) => r.display_title));
  for (const x of xhsRows) {
    if (merged.length >= HOT_TOPIC_LIST_LIMIT) break;
    if (seenTitles.has(x.display_title)) continue;
    seenTitles.add(x.display_title);
    merged.push(x);
  }

  if (merged.length === 0) {
    const mockRows = buildMockHotTopicRows(batchDate);
    const save = await replaceHotTopicsBatch(batchDate, mockRows);
    return {
      ok: save.ok,
      source: "fallback",
      count: save.count,
      batchDate,
      platformStats: stats,
      error: save.error,
    };
  }

  const save = await replaceHotTopicsBatch(batchDate, merged);
  return {
    ok: save.ok,
    source: usedMockPlatforms.length ? "hybrid" : "dailyhotapi",
    count: save.count,
    batchDate,
    platformStats: stats,
    error: save.error,
  };
}

let refreshInFlight: Promise<UpdateHotTopicsResult> | null = null;

/** 若今日批次未更新则触发一次刷新（并发去重） */
export async function ensureHotTopicsFresh(batchDate = todayDate()): Promise<void> {
  const { getLatestBatchDate } = await import("@/lib/server/db/hot-topics-db");
  const latest = await getLatestBatchDate();
  if (latest === batchDate) return;

  if (!refreshInFlight) {
    refreshInFlight = runHotTopicsUpdatePipeline(batchDate).finally(() => {
      refreshInFlight = null;
    });
  }
  await refreshInFlight;
}

export async function ensureHotTopicsSeeded(): Promise<boolean> {
  const n = await countActiveHotTopics();
  if (n >= 3) {
    void ensureHotTopicsFresh().catch((e) => console.warn("[ensureHotTopicsFresh]", e));
    return true;
  }
  const r = await runHotTopicsUpdatePipeline();
  return r.ok && r.count > 0;
}
