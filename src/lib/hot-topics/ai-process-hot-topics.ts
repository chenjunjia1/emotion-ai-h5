import type { AiProcessedHotTopic, RawHotFromApi } from "@/lib/hot-topics/types";
import {
  runHotTopicFilterPipeline,
  type FilterPipelineStats,
} from "@/lib/hot-topics/filter-pipeline";
import type { HotTopicInsert } from "@/lib/server/db/hot-topics-db";

export { toInsertRowFromFilter as toInsertRow } from "@/lib/hot-topics/filter-pipeline";

/** 完整过滤流水线：关键词 → AI 安全/创作价值 → 改写 */
export async function processHotTopicsWithAi(
  rawList: RawHotFromApi[],
  _maxCount = 28,
  batchDate?: string
): Promise<{
  active: HotTopicInsert[];
  rejected: HotTopicInsert[];
  processed: AiProcessedHotTopic[];
  stats: FilterPipelineStats;
}> {
  const date = batchDate ?? new Date().toISOString().slice(0, 10);
  return runHotTopicFilterPipeline(rawList, date, { maxAiItems: 72 });
}
