import { ensureHotTopicsSeeded } from "@/lib/hot-topics/update-pipeline";
import {
  getHotTopicById,
  getLatestBatchDate,
  getRelatedHotTopics,
  listActiveHotTopics,
  countActiveHotTopics,
  countFeaturedHotTopics,
} from "@/lib/server/db/hot-topics-db";
import {
  HOT_TOPIC_API_MAX_LIMIT,
  HOT_TOPIC_PAGE_SIZE,
  HOT_TOPIC_TOP_LIMIT,
  recordToItem,
  type HotTopicItem,
  type HotTopicRecord,
} from "@/lib/hot-topics/types";
import { ensureHotTopicFields } from "@/lib/content/hot-topic-fields";
import { isServerBackendEnabled } from "@/lib/server/config";
import { buildFullHotTopicLibrary } from "@/lib/hot-topics/bulk-library-generator";
import { hotTopicLibraryMeta } from "@/lib/hot-topics/library-display";

export type HotTopicsListMeta = ReturnType<typeof hotTopicLibraryMeta> & {
  batchDate: string;
  isToday: boolean;
  stale: boolean;
  total: number;
  todayFeatured?: number;
  updatedAt: string;
  message?: string;
  sources?: string[];
};

function metaWithLibrary(todayActive: number, base: Omit<HotTopicsListMeta, keyof ReturnType<typeof hotTopicLibraryMeta> | "total">): HotTopicsListMeta {
  return { ...hotTopicLibraryMeta(todayActive), ...base, total: todayActive };
}

export const HOT_TOPICS_DISPLAY_NOTE =
  "每日 8 点更新 · 跟拍就能火 · 抖音 / 小红书 / 朋友圈";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 推荐列表按展示标题去重（同题只留爆款分最高的一条） */
function dedupeRecommendRows(rows: HotTopicRecord[]): HotTopicRecord[] {
  const map = new Map<string, HotTopicRecord>();
  for (const row of rows) {
    const key = row.display_title.trim();
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
  let all = buildFullHotTopicLibrary(batchDate);
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

async function recoverFromDatabase(limit: number, platform?: string, category?: string) {
  const broad = await listActiveHotTopics({
    platform,
    category,
    limit: Math.max(limit, HOT_TOPIC_API_MAX_LIMIT),
  });
  if (broad.items.length > 0) {
    const batchDate = broad.batchDate ?? (await getLatestBatchDate());
    return {
      items: toDisplayItems(broad.items),
      batchDate,
      isToday: batchDate === todayDate(),
      stale: batchDate !== todayDate(),
    };
  }
  return null;
}

export async function fetchHotTopicsForApi(opts: {
  platform?: string;
  category?: string;
  limit?: number;
  page?: number;
}) {
  if (!isServerBackendEnabled()) {
    const pageSize = opts.limit ?? HOT_TOPIC_PAGE_SIZE;
    const items = mockItems(pageSize, opts.platform, opts.category);
    const libRows = buildFullHotTopicLibrary(todayDate());
    return {
      items,
      meta: {
        ...metaWithLibrary(libRows.length, {
          batchDate: todayDate(),
          isToday: true,
          stale: false,
          updatedAt: `${todayDate()} 08:00`,
          message: HOT_TOPICS_DISPLAY_NOTE,
          sources: ["TianAPI", "DailyHotApi", "AI"],
        }),
        todayFeatured: libRows.filter((r) => r.is_new).length,
      },
    };
  }

  await ensureHotTopicsSeeded();
  let { items, batchDate, isToday } = await listActiveHotTopics(opts);

  if (!opts.platform || opts.platform === "all") {
    items = dedupeRecommendRows(items);
  }

  if (items.length === 0) {
    const recovered = await recoverFromDatabase(
      opts.limit ?? HOT_TOPIC_API_MAX_LIMIT,
      opts.platform,
      opts.category
    );
    if (recovered && recovered.items.length > 0) {
      const total = await countActiveHotTopics();
      const n = total || recovered.items.length;
      return {
        items: recovered.items,
        meta: metaWithLibrary(n, {
          batchDate: recovered.batchDate ?? todayDate(),
          isToday: recovered.isToday,
          stale: true,
          updatedAt: `${recovered.batchDate ?? todayDate()} 08:00`,
          message: "热点源暂时不可用，展示数据库最近一次成功更新",
          sources: ["TianAPI", "DailyHotApi", "AI"],
        }),
      };
    }

    const fallback = mockItems(opts.limit ?? HOT_TOPIC_PAGE_SIZE, opts.platform, opts.category);
    return {
      items: fallback,
      meta: metaWithLibrary(fallback.length, {
        batchDate: todayDate(),
        isToday: false,
        stale: true,
        updatedAt: `${todayDate()} 08:00`,
        message: "热点数据正在更新中，先为你展示演示热点",
        sources: ["TianAPI", "DailyHotApi", "AI"],
      }),
    };
  }

  const display = toDisplayItems(items);
  const batchForCount = batchDate ?? todayDate();
  const libraryTotal = await countActiveHotTopics(batchForCount);
  const todayFeatured = await countFeaturedHotTopics(batchForCount);

  return {
    items: display,
    meta: metaWithLibrary(libraryTotal || display.length, {
      todayFeatured,
      batchDate: batchDate ?? todayDate(),
      isToday,
      stale: !isToday,
      updatedAt: `${batchDate ?? todayDate()} 08:00`,
      message: isToday ? HOT_TOPICS_DISPLAY_NOTE : "展示数据库最近一次成功更新 · 每日8点自动刷新",
      sources: ["TianAPI", "DailyHotApi", "AI"],
    }),
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
    const recovered = await recoverFromDatabase(20);
    const item = recovered?.items[0] ?? mockItems(1)[0];
    return {
      item,
      related: (recovered?.items ?? mockItems(4)).filter((t) => t.id !== item.id).slice(0, 3),
      meta: { isToday: false, stale: true },
    };
  }

  const relatedRows = await getRelatedHotTopics(row.id, row.category, 3);
  const latestBatch = await getLatestBatchDate();
  const isToday = latestBatch === todayDate();

  return {
    item: recordToItem(row),
    related: relatedRows.map(recordToItem),
    meta: {
      isToday,
      stale: !isToday,
      batchDate: latestBatch ?? row.updated_batch_date,
    },
  };
}
