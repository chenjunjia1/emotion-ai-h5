import { fetchHotTopicsFromProviders } from "@/lib/hot-topics/fetch-hot-providers";
import { processHotTopicsWithAi } from "@/lib/hot-topics/ai-process-hot-topics";
import {
  buildBulkHotTopicLibrary,
  buildFullHotTopicLibrary,
  HOT_TOPIC_FEATURED_MAX,
  HOT_TOPIC_LIBRARY_MIN,
} from "@/lib/hot-topics/bulk-library-generator";
import { sampleHotTopicsPerPlatform } from "@/lib/hot-topics/platform-sampling";
import { buildXhsInspirationRows } from "@/lib/hot-topics/xhs-inspiration";
import { buildYouthCuratedSupplement } from "@/lib/hot-topics/youth-curated-supplement";
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
  source: "tianapi" | "dailyhotapi" | "mock" | "hybrid" | "fallback" | "cached";
  count: number;
  activeCount?: number;
  rejectedCount?: number;
  batchDate: string;
  platformStats?: Record<string, number>;
  filterStats?: {
    raw: number;
    keywordRejected: number;
    aiRejected: number;
    active: number;
  };
  primary?: string;
  fallbackUsed?: boolean;
  skippedUpdate?: boolean;
  error?: string;
  message?: string;
};

async function saveProcessedBatch(
  raw: RawHotFromApi[],
  batchDate: string,
  ingestSource: UpdateHotTopicsResult["source"],
  platformStats: Record<string, number>
): Promise<UpdateHotTopicsResult> {
  const { active, rejected, processed, stats } = await processHotTopicsWithAi(
    raw,
    72,
    batchDate
  );

  const xhsRows = buildXhsInspirationRows(
    processed,
    raw,
    batchDate,
    10,
    new Set(active.filter((r) => r.platform === "douyin").map((r) => r.raw_title))
  );

  const merged: HotTopicInsert[] = [...active];
  const seenTitles = new Set(active.map((r) => r.display_title));
  for (const x of xhsRows) {
    if (merged.filter((r) => r.status === "active").length >= HOT_TOPIC_FEATURED_MAX) break;
    if (seenTitles.has(x.display_title)) continue;
    seenTitles.add(x.display_title);
    merged.push({
      ...x,
      safe_score: Math.max(80, x.safe_score ?? 82),
      content_value_score: Math.max(60, x.content_value_score ?? 68),
      reject_reason: null,
    });
  }

  const activeSoFar = merged.filter((r) => r.status === "active");
  const supplement = buildYouthCuratedSupplement(batchDate, activeSoFar, HOT_TOPIC_FEATURED_MAX);
  for (const row of supplement) {
    if (merged.filter((r) => r.status === "active").length >= HOT_TOPIC_FEATURED_MAX) break;
    if (seenTitles.has(row.display_title)) continue;
    merged.push(row);
    seenTitles.add(row.display_title);
  }

  const featured = merged.filter((r) => r.status === "active");
  featured.forEach((r, i) => {
    r.is_new = i < 12;
  });

  const libraryRows = buildBulkHotTopicLibrary(batchDate, featured, HOT_TOPIC_LIBRARY_MIN);
  const allActive = [...featured, ...libraryRows];
  const allRows = [...allActive, ...rejected];

  if (allActive.length === 0) {
    const cached = await countActiveHotTopics();
    if (cached >= 3) {
      return {
        ok: true,
        source: "cached",
        count: cached,
        batchDate,
        platformStats,
        filterStats: stats,
        skippedUpdate: true,
        message: "过滤后无合格热点，保留数据库最近一次成功更新",
      };
    }
    const mockRows = buildFullHotTopicLibrary(batchDate);
    const save = await replaceHotTopicsBatch(batchDate, mockRows);
    return {
      ok: save.ok,
      source: "fallback",
      count: save.count,
      batchDate,
      platformStats,
      filterStats: stats,
      error: save.error,
    };
  }

  const save = await replaceHotTopicsBatch(batchDate, allRows);
  const activeCount = allActive.length;

  return {
    ok: save.ok,
    source: ingestSource,
    count: save.count,
    activeCount,
    rejectedCount: rejected.length,
    batchDate,
    platformStats,
    filterStats: stats,
    error: save.error,
    message:
      rejected.length > 0
        ? `已入库 ${activeCount} 条可展示热点，${rejected.length} 条已标记 rejected`
        : undefined,
  };
}

/** TianAPI → DailyHotApi 备用 → 过滤 → AI 加工 → 入库 */
export async function runHotTopicsUpdatePipeline(
  batchDate = todayDate()
): Promise<UpdateHotTopicsResult> {
  const fetched = await fetchHotTopicsFromProviders();
  const apiTotal = fetched.items.length;

  if (apiTotal === 0) {
    const cached = await countActiveHotTopics();
    if (cached >= 3) {
      console.warn(
        "[hot-topics] TianAPI + DailyHotApi both empty, keeping last successful batch:",
        cached
      );
      return {
        ok: true,
        source: "cached",
        count: cached,
        batchDate,
        platformStats: fetched.stats,
        primary: fetched.primary,
        fallbackUsed: fetched.fallbackUsed,
        skippedUpdate: true,
        message: "热点源暂时不可用，继续展示数据库最近一次成功更新",
        error: fetched.error,
      };
    }

    const merged = buildFullHotTopicLibrary(batchDate);
    const save = await replaceHotTopicsBatch(batchDate, merged);
    return {
      ok: save.ok,
      source: "mock",
      count: save.count,
      batchDate,
      platformStats: fetched.stats,
      error: save.error,
      message: "首次初始化使用演示热点，配置 TianAPI 后将自动切换真实数据",
    };
  }

  /** 仅用 API 真实数据，不再用 mock 补齐平台 */
  const raw = sampleHotTopicsPerPlatform(fetched.items, 8);

  const result = await saveProcessedBatch(raw, batchDate, fetched.source, fetched.stats);

  return {
    ...result,
    primary: fetched.primary,
    fallbackUsed: fetched.fallbackUsed,
  };
}

let refreshInFlight: Promise<UpdateHotTopicsResult> | null = null;

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
  if (n >= HOT_TOPIC_LIBRARY_MIN) {
    void ensureHotTopicsFresh().catch((e) => console.warn("[ensureHotTopicsFresh]", e));
    return true;
  }
  const r = await runHotTopicsUpdatePipeline();
  return r.ok && r.count > 0;
}
