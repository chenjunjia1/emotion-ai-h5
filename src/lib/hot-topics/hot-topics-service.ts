import { ensureHotTopicsSeeded } from "@/lib/hot-topics/update-pipeline";
import {
  getHotTopicById,
  getLatestBatchDate,
  getRelatedHotTopics,
  listActiveHotTopics,
} from "@/lib/server/db/hot-topics-db";
import {
  HOT_TOPIC_LIST_LIMIT,
  HOT_TOPIC_TOP_LIMIT,
  recordToItem,
  type HotTopicItem,
  type HotTopicRecord,
} from "@/lib/hot-topics/types";
import { buildMockHotTopicRows } from "@/lib/hot-topics/mock-hot-topics-seed";
import { buildXhsInspirationRows } from "@/lib/hot-topics/xhs-inspiration";
import { ensureHotTopicFields } from "@/lib/content/hot-topic-fields";
import { isServerBackendEnabled } from "@/lib/server/config";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 推荐列表按 raw_title 去重，保留爆款分最高的一条 */
function dedupeRecommendRows(rows: HotTopicRecord[]): HotTopicRecord[] {
  const map = new Map<string, HotTopicRecord>();
  for (const row of rows) {
    const key = row.raw_title.trim();
    const prev = map.get(key);
    if (!prev || row.viral_score > prev.viral_score) map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.viral_score - a.viral_score || b.heat_score - a.heat_score);
}

function toDisplayItems(rows: HotTopicRecord[]): HotTopicItem[] {
  return rows.map((row) => ensureHotTopicFields(recordToItem(row)));
}

function mockItems(limit: number, platform?: string, category?: string): HotTopicItem[] {
  const batchDate = todayDate();
  const mockRows = buildMockHotTopicRows(batchDate);
  const xhs = buildXhsInspirationRows(
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
    mockRows.map((r) => ({ title: r.raw_title, platform: r.platform, hot: r.heat_score })),
    batchDate,
    6
  );
  let all = [...mockRows, ...xhs];
  if (platform && platform !== "all") {
    if (platform === "xhs") all = all.filter((r) => r.platform === "xiaohongshu_inspiration");
    else if (platform === "web")
      all = all.filter((r) =>
        ["weibo", "baidu", "zhihu", "toutiao", "bilibili"].includes(r.platform)
      );
    else all = all.filter((r) => r.platform === platform);
  }
  if (category && category !== "全部") {
    all = all.filter((r) => `${r.display_title}${r.category}${r.summary}`.includes(category));
  }
  return all.slice(0, limit).map((r, i) =>
    ensureHotTopicFields(
      recordToItem({
        ...r,
        id: `mock-${platform ?? "all"}-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    )
  );
}

export async function fetchHotTopicsForApi(opts: {
  platform?: string;
  category?: string;
  limit?: number;
  page?: number;
}) {
  if (!isServerBackendEnabled()) {
    const items = mockItems(opts.limit ?? HOT_TOPIC_LIST_LIMIT, opts.platform, opts.category);
    return {
      items,
      meta: {
        batchDate: todayDate(),
        isToday: true,
        stale: false,
        total: items.length,
        updatedAt: `${todayDate()} 08:00`,
      },
    };
  }

  await ensureHotTopicsSeeded();
  let { items, batchDate, isToday } = await listActiveHotTopics(opts);

  if (!opts.platform || opts.platform === "all") {
    items = dedupeRecommendRows(items);
  }

  if (items.length === 0) {
    const fallback = mockItems(opts.limit ?? HOT_TOPIC_LIST_LIMIT, opts.platform, opts.category);
    return {
      items: fallback,
      meta: {
        batchDate: todayDate(),
        isToday: false,
        stale: true,
        total: fallback.length,
        updatedAt: `${todayDate()} 08:00`,
        message: "热点数据正在更新中，先为你展示最近热点。",
      },
    };
  }

  return {
    items: toDisplayItems(items),
    meta: {
      batchDate: batchDate ?? todayDate(),
      isToday,
      stale: !isToday,
      total: items.length,
      updatedAt: `${batchDate ?? todayDate()} 08:00`,
      message: isToday ? undefined : "热点数据正在更新中，先为你展示最近热点。",
    },
  };
}

export async function fetchHotTopicsTopForApi(limit = HOT_TOPIC_TOP_LIMIT) {
  const r = await fetchHotTopicsForApi({ limit });
  return {
    items: r.items.slice(0, limit),
    meta: r.meta,
  };
}

export async function fetchHotTopicDetailForApi(id: string) {
  if (!isServerBackendEnabled()) {
    const item = mockItems(20).find((t) => t.id === id) ?? mockItems(1)[0];
    return {
      item,
      related: mockItems(4).filter((t) => t.id !== item.id).slice(0, 3),
      meta: { isToday: true, stale: false },
    };
  }

  await ensureHotTopicsSeeded();
  const row = await getHotTopicById(id);
  if (!row) {
    const fallback = mockItems(1)[0];
    return {
      item: fallback,
      related: mockItems(4).slice(1, 4),
      meta: { isToday: false, stale: true },
    };
  }

  const relatedRows = await getRelatedHotTopics(row.id, row.category, 3);
  const batchDate = await getLatestBatchDate();
  const isToday = batchDate === todayDate();

  return {
    item: recordToItem(row),
    related: relatedRows.map(recordToItem),
    meta: { isToday, stale: !isToday, batchDate },
  };
}
