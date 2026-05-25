import type { HotTopicRecord } from "@/lib/hot-topics/types";
import { HOT_TOPIC_API_MAX_LIMIT, HOT_TOPIC_PAGE_SIZE } from "@/lib/hot-topics/types";
import {
  CONTENT_VALUE_SCORE_MIN,
  SAFE_SCORE_MIN,
} from "@/lib/hot-topics/filter-pipeline";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapRow(row: Record<string, unknown>): HotTopicRecord {
  return {
    id: String(row.id),
    raw_title: String(row.raw_title ?? ""),
    display_title: String(row.display_title ?? ""),
    summary: String(row.summary ?? ""),
    platform: String(row.platform ?? "web"),
    heat_value: String(row.heat_value ?? "0"),
    heat_score: Number(row.heat_score ?? 0),
    cover_image: String(row.cover_image ?? "/images/hot/default.svg"),
    category: String(row.category ?? "生活"),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    target_users: Array.isArray(row.target_users) ? row.target_users.map(String) : [],
    recommend_angles: Array.isArray(row.recommend_angles)
      ? row.recommend_angles.map(String)
      : [],
    viral_score: Number(row.viral_score ?? 70),
    source_url: row.source_url ? String(row.source_url) : null,
    is_new: Boolean(row.is_new),
    status:
      row.status === "inactive"
        ? "inactive"
        : row.status === "rejected"
          ? "rejected"
          : "active",
    reject_reason: row.reject_reason ? String(row.reject_reason) : null,
    safe_score: Number(row.safe_score ?? 0),
    content_value_score: Number(row.content_value_score ?? 0),
    updated_batch_date: String(row.updated_batch_date ?? todayDate()),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function listActiveHotTopics(opts: {
  platform?: string;
  category?: string;
  limit?: number;
  page?: number;
}): Promise<{ items: HotTopicRecord[]; batchDate: string | null; isToday: boolean }> {
  const db = getSupabaseAdmin();
  if (!db) return { items: [], batchDate: null, isToday: false };

  const limit = Math.min(
    HOT_TOPIC_API_MAX_LIMIT,
    Math.max(1, opts.limit ?? HOT_TOPIC_PAGE_SIZE)
  );
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const latestBatch = await getLatestBatchDate();

  let q = db
    .from("hot_topics")
    .select("*")
    .eq("status", "active")
    .gte("safe_score", SAFE_SCORE_MIN)
    .gte("content_value_score", CONTENT_VALUE_SCORE_MIN)
    .order("viral_score", { ascending: false })
    .order("heat_score", { ascending: false });

  if (latestBatch) {
    q = q.eq("updated_batch_date", latestBatch);
  }

  if (opts.platform && opts.platform !== "all") {
    if (opts.platform === "xhs") {
      q = q.eq("platform", "xiaohongshu_inspiration");
    } else if (opts.platform === "web") {
      q = q.in("platform", ["weibo", "baidu", "zhihu", "toutiao", "bilibili"]);
    } else {
      q = q.eq("platform", opts.platform);
    }
  }
  // platform=all 时不按平台过滤，保证今日可拍选题条数完整展示

  if (opts.category && opts.category !== "全部") {
    q = q.eq("category", opts.category);
  }

  const { data, error } = await q.range(from, to);
  if (error) {
    console.warn("[listActiveHotTopics]", error.message);
    return { items: [], batchDate: null, isToday: false };
  }

  let items = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
  if (!opts.platform || opts.platform === "all") {
    const rank = (p: string) => {
      if (p === "douyin") return 0;
      if (p === "xiaohongshu_inspiration") return 1;
      if (p === "bilibili") return 2;
      return 3;
    };
    items = [...items].sort(
      (a, b) =>
        rank(a.platform) - rank(b.platform) ||
        b.viral_score - a.viral_score ||
        b.content_value_score - a.content_value_score
    );
  }
  const batchDate = items[0]?.updated_batch_date ?? null;
  const isToday = batchDate === todayDate();
  return { items, batchDate, isToday };
}

export async function getHotTopicTop(limit = 3): Promise<HotTopicRecord[]> {
  const { items } = await listActiveHotTopics({ limit });
  return items.slice(0, limit);
}

export async function getHotTopicById(id: string): Promise<HotTopicRecord | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db
    .from("hot_topics")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function getRelatedHotTopics(
  id: string,
  category: string,
  limit = 3
): Promise<HotTopicRecord[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("hot_topics")
    .select("*")
    .eq("status", "active")
    .eq("category", category)
    .neq("id", id)
    .order("viral_score", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function getLatestBatchDate(): Promise<string | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db
    .from("hot_topics")
    .select("updated_batch_date")
    .eq("status", "active")
    .order("updated_batch_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.updated_batch_date ? String(data.updated_batch_date) : null;
}

export type HotTopicInsert = Omit<
  HotTopicRecord,
  "id" | "created_at" | "updated_at"
>;

export async function replaceHotTopicsBatch(
  batchDate: string,
  rows: HotTopicInsert[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, count: 0, error: "no_db" };

  await db
    .from("hot_topics")
    .update({ status: "inactive" })
    .in("status", ["active", "rejected"]);

  const payload = rows.map((r) => ({
    ...r,
    updated_at: new Date().toISOString(),
  }));

  const CHUNK = 150;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += CHUNK) {
    const slice = payload.slice(i, i + CHUNK);
    const { error } = await db.from("hot_topics").insert(slice);
    if (error) return { ok: false, count: inserted, error: error.message };
    inserted += slice.length;
  }
  return { ok: true, count: inserted };
}

export async function countFeaturedHotTopics(batchDate?: string): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  let q = db
    .from("hot_topics")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("is_new", true);
  const date = batchDate ?? (await getLatestBatchDate());
  if (date) q = q.eq("updated_batch_date", date);
  const { count } = await q;
  return count ?? 0;
}

export async function countActiveHotTopics(batchDate?: string): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  let q = db
    .from("hot_topics")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  const date = batchDate ?? (await getLatestBatchDate());
  if (date) q = q.eq("updated_batch_date", date);
  const { count } = await q;
  return count ?? 0;
}
