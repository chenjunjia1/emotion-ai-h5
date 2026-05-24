import type { HotTopicRecord } from "@/lib/hot-topics/types";
import { HOT_TOPIC_LIST_LIMIT } from "@/lib/hot-topics/types";
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
    status: row.status === "inactive" ? "inactive" : "active",
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

  const limit = Math.min(50, opts.limit ?? HOT_TOPIC_LIST_LIMIT);
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = db
    .from("hot_topics")
    .select("*")
    .eq("status", "active")
    .order("viral_score", { ascending: false })
    .order("heat_score", { ascending: false });

  if (opts.platform && opts.platform !== "all") {
    if (opts.platform === "xhs") {
      q = q.eq("platform", "xiaohongshu_inspiration");
    } else if (opts.platform === "web") {
      q = q.in("platform", ["weibo", "baidu", "zhihu", "toutiao", "bilibili"]);
    } else {
      q = q.eq("platform", opts.platform);
    }
  }

  if (opts.category && opts.category !== "全部") {
    q = q.eq("category", opts.category);
  }

  const { data, error } = await q.range(from, to);
  if (error) {
    console.warn("[listActiveHotTopics]", error.message);
    return { items: [], batchDate: null, isToday: false };
  }

  const items = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
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

  await db.from("hot_topics").update({ status: "inactive" }).eq("status", "active");

  const payload = rows.map((r) => ({
    ...r,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await db.from("hot_topics").insert(payload);
  if (error) return { ok: false, count: 0, error: error.message };
  return { ok: true, count: payload.length };
}

export async function countActiveHotTopics(): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  const { count } = await db
    .from("hot_topics")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  return count ?? 0;
}
