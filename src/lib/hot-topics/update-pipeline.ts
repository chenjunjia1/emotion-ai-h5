import { fetchAllDailyHotTopics } from "@/lib/hot-topics/daily-hot-api-client";
import {
  processHotTopicsWithAi,
  toInsertRow,
} from "@/lib/hot-topics/ai-process-hot-topics";
import {
  filterRawTopics,
  prioritizeCreatorTopics,
} from "@/lib/hot-topics/filters";
import { HOT_TOPIC_LIST_LIMIT } from "@/lib/hot-topics/types";
import { buildMockHotTopicRows } from "@/lib/hot-topics/mock-hot-topics-seed";
import {
  countActiveHotTopics,
  replaceHotTopicsBatch,
} from "@/lib/server/db/hot-topics-db";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export type UpdateHotTopicsResult = {
  ok: boolean;
  source: "dailyhotapi" | "mock" | "fallback";
  count: number;
  batchDate: string;
  error?: string;
};

/** 拉取 → 过滤 → AI 加工 → 入库 */
export async function runHotTopicsUpdatePipeline(
  batchDate = todayDate()
): Promise<UpdateHotTopicsResult> {
  let raw = await fetchAllDailyHotTopics();
  let source: UpdateHotTopicsResult["source"] = raw.length ? "dailyhotapi" : "mock";

  if (raw.length === 0) {
    raw = buildMockHotTopicRows(batchDate).map((r) => ({
      title: r.raw_title,
      desc: r.summary,
      hot: r.heat_score,
      platform: r.platform,
      url: r.source_url ?? undefined,
    }));
    source = "mock";
  }

  const filtered = prioritizeCreatorTopics(filterRawTopics(raw)).slice(0, 40);
  const processed = await processHotTopicsWithAi(filtered, HOT_TOPIC_LIST_LIMIT + 4);

  const rows = processed.slice(0, HOT_TOPIC_LIST_LIMIT).map((p, i) => {
    const rawItem = filtered.find((r) => r.title === p.raw_title) ?? filtered[i] ?? filtered[0];
    return toInsertRow(p, rawItem, batchDate, i);
  });

  if (rows.length === 0) {
    const mockRows = buildMockHotTopicRows(batchDate);
    const save = await replaceHotTopicsBatch(batchDate, mockRows);
    return {
      ok: save.ok,
      source: "fallback",
      count: save.count,
      batchDate,
      error: save.error,
    };
  }

  const save = await replaceHotTopicsBatch(batchDate, rows);
  return {
    ok: save.ok,
    source,
    count: save.count,
    batchDate,
    error: save.error,
  };
}

export async function ensureHotTopicsSeeded(): Promise<boolean> {
  const n = await countActiveHotTopics();
  if (n >= 3) return true;
  const r = await runHotTopicsUpdatePipeline();
  return r.ok && r.count > 0;
}
