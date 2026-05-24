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
} from "@/lib/hot-topics/types";
import { buildMockHotTopicRows } from "@/lib/hot-topics/mock-hot-topics-seed";
import { isServerBackendEnabled } from "@/lib/server/config";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function mockItems(limit: number): HotTopicItem[] {
  return buildMockHotTopicRows(todayDate())
    .slice(0, limit)
    .map((r, i) =>
      recordToItem({
        ...r,
        id: `mock-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );
}

export async function fetchHotTopicsForApi(opts: {
  platform?: string;
  category?: string;
  limit?: number;
  page?: number;
}) {
  if (!isServerBackendEnabled()) {
    const items = mockItems(opts.limit ?? HOT_TOPIC_LIST_LIMIT);
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
  const { items, batchDate, isToday } = await listActiveHotTopics(opts);

  if (items.length === 0) {
    const fallback = mockItems(opts.limit ?? HOT_TOPIC_LIST_LIMIT);
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
    items: items.map(recordToItem),
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
