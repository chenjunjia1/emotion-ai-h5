import { getSupabaseAdmin } from "@/lib/supabase/server";
import { XHS_INSPIRATION_PLATFORM } from "@/lib/hot-topics/xhs-inspiration";
import type { HotTopicRecord } from "@/lib/hot-topics/types";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function resolveAdminBatchDate(batchDate?: string): Promise<string | null> {
  if (batchDate?.trim()) return batchDate.trim();
  const db = getSupabaseAdmin();
  if (!db) return todayDate();
  const { data } = await db
    .from("hot_topics")
    .select("updated_batch_date")
    .order("updated_batch_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.updated_batch_date ? String(data.updated_batch_date) : todayDate();
}

function mapRow(row: Record<string, unknown>): HotTopicRecord & {
  badge_label: string | null;
  likes_label: string | null;
  saves_label: string | null;
  comments_label: string | null;
  display_order: number;
} {
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
    safe_score: Number(row.safe_score ?? 80),
    content_value_score: Number(row.content_value_score ?? 80),
    updated_batch_date: String(row.updated_batch_date ?? todayDate()),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
    badge_label: row.badge_label ? String(row.badge_label) : null,
    likes_label: row.likes_label ? String(row.likes_label) : null,
    saves_label: row.saves_label ? String(row.saves_label) : null,
    comments_label: row.comments_label ? String(row.comments_label) : null,
    display_order: Number(row.display_order ?? 0),
  };
}

export type AdminHotTopicRow = ReturnType<typeof mapRow>;

export async function countHotTopicsBySource(
  batchDate?: string
): Promise<{ cron: number; xhsInspiration: number; total: number } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const batch = await resolveAdminBatchDate(batchDate);

  const countWith = async (platformFilter: "cron" | "xhs" | "all") => {
    let q = db.from("hot_topics").select("*", { count: "exact", head: true });
    if (batch) q = q.eq("updated_batch_date", batch);
    if (platformFilter === "cron") {
      q = q.neq("platform", XHS_INSPIRATION_PLATFORM);
    } else if (platformFilter === "xhs") {
      q = q.eq("platform", XHS_INSPIRATION_PLATFORM);
    }
    const { count, error } = await q;
    if (error) {
      console.warn("[countHotTopicsBySource]", error.message);
      return 0;
    }
    return count ?? 0;
  };

  const [cron, xhsInspiration, total] = await Promise.all([
    countWith("cron"),
    countWith("xhs"),
    countWith("all"),
  ]);
  return { cron, xhsInspiration, total };
}

/** 删除非 TikHub 的 Cron 热点（抖音/微博等）；保留 xiaohongshu_inspiration 二次加工条目 */
export async function purgeCronHotTopics(opts?: {
  batchDate?: string;
  scope?: "cron" | "all";
}): Promise<{ deleted: number; scope: "cron" | "all" } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const batch = opts?.batchDate ? await resolveAdminBatchDate(opts.batchDate) : undefined;
  const scope = opts?.scope ?? "cron";

  let q = db.from("hot_topics").delete({ count: "exact" });
  if (scope === "cron") {
    q = q.neq("platform", XHS_INSPIRATION_PLATFORM);
  }
  if (batch) q = q.eq("updated_batch_date", batch);

  const { count, error } = await q;
  if (error) {
    console.warn("[purgeCronHotTopics]", error.message);
    return null;
  }
  return { deleted: count ?? 0, scope };
}

export async function listHotTopicCategoryStats(
  batchDate?: string,
  status = "all",
  platformFilter?: "cron" | "xhs" | "all"
): Promise<{ category: string; count: number }[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];

  const batch = await resolveAdminBatchDate(batchDate);
  const categories = [
    "全部",
    "治愈",
    "情感",
    "生活",
    "美食",
    "宠物",
    "穿搭",
    "职场",
    "学生",
    "宝妈",
    "探店",
    "AI工具",
    "副业",
    "成长",
  ];

  const buildCount = (category?: string) => {
    let q = db.from("hot_topics").select("*", { count: "exact", head: true });
    if (batch) q = q.eq("updated_batch_date", batch);
    if (status !== "all") q = q.eq("status", status);
    if (platformFilter === "cron") {
      q = q.neq("platform", XHS_INSPIRATION_PLATFORM);
    } else if (platformFilter === "xhs") {
      q = q.eq("platform", XHS_INSPIRATION_PLATFORM);
    }
    if (category && category !== "全部") q = q.eq("category", category);
    return q;
  };

  const results = await Promise.all(
    categories.map(async (category) => {
      const { count } = await buildCount(category === "全部" ? undefined : category);
      return { category, count: count ?? 0 };
    })
  );

  return results.filter((r) => r.category === "全部" || r.count > 0);
}

export async function listHotTopicsForAdmin(opts: {
  batchDate?: string;
  status?: string;
  category?: string;
  platformFilter?: "cron" | "xhs" | "all";
  q?: string;
  page: number;
  limit: number;
}): Promise<{
  items: AdminHotTopicRow[];
  total: number;
  resolvedBatch?: string;
  error?: string;
} | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;
  const batch = await resolveAdminBatchDate(opts.batchDate);

  const buildQuery = (orderDisplay: boolean) => {
    let q = db.from("hot_topics").select("*", { count: "exact" });
    if (orderDisplay) {
      q = q
        .order("display_order", { ascending: true })
        .order("viral_score", { ascending: false });
    } else {
      q = q
        .order("viral_score", { ascending: false })
        .order("heat_score", { ascending: false })
        .order("created_at", { ascending: false });
    }
    if (batch) q = q.eq("updated_batch_date", batch);
    if (opts.status && opts.status !== "all") {
      q = q.eq("status", opts.status);
    }
    if (opts.category && opts.category !== "全部") {
      q = q.eq("category", opts.category);
    }
    if (opts.platformFilter === "cron") {
      q = q.neq("platform", XHS_INSPIRATION_PLATFORM);
    } else if (opts.platformFilter === "xhs") {
      q = q.eq("platform", XHS_INSPIRATION_PLATFORM);
    }
    if (opts.q?.trim()) {
      q = q.or(
        `display_title.ilike.%${opts.q.trim()}%,raw_title.ilike.%${opts.q.trim()}%`
      );
    }
    return q.range(from, to);
  };

  let { data, count, error } = await buildQuery(true);
  if (
    error?.message?.includes("display_order") ||
    error?.code === "42703"
  ) {
    ({ data, count, error } = await buildQuery(false));
  }

  if (error) {
    console.warn("[admin hot_topics]", error.message);
    return { items: [], total: 0, error: error.message };
  }

  return {
    total: count ?? 0,
    items: (data ?? []).map((r: Record<string, unknown>) => mapRow(r)),
    resolvedBatch: batch ?? undefined,
  };
}

export async function getHotTopicForAdmin(id: string): Promise<AdminHotTopicRow | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("hot_topics").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export type HotTopicAdminPatch = {
  displayTitle?: string;
  rawTitle?: string;
  summary?: string;
  category?: string;
  platform?: string;
  heatValue?: string;
  heatScore?: number;
  coverImage?: string;
  viralScore?: number;
  tags?: string[];
  targetUsers?: string[];
  recommendAngles?: string[];
  status?: "active" | "inactive" | "rejected";
  isNew?: boolean;
  badgeLabel?: string | null;
  likesLabel?: string | null;
  savesLabel?: string | null;
  commentsLabel?: string | null;
  displayOrder?: number;
  safeScore?: number;
  contentValueScore?: number;
};

export async function updateHotTopicForAdmin(
  id: string,
  patch: HotTopicAdminPatch
): Promise<AdminHotTopicRow | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.displayTitle !== undefined) update.display_title = patch.displayTitle;
  if (patch.rawTitle !== undefined) update.raw_title = patch.rawTitle;
  if (patch.summary !== undefined) update.summary = patch.summary;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.platform !== undefined) update.platform = patch.platform;
  if (patch.heatValue !== undefined) update.heat_value = patch.heatValue;
  if (patch.heatScore !== undefined) update.heat_score = patch.heatScore;
  if (patch.coverImage !== undefined) update.cover_image = patch.coverImage;
  if (patch.viralScore !== undefined) update.viral_score = patch.viralScore;
  if (patch.tags !== undefined) update.tags = patch.tags;
  if (patch.targetUsers !== undefined) update.target_users = patch.targetUsers;
  if (patch.recommendAngles !== undefined) update.recommend_angles = patch.recommendAngles;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.isNew !== undefined) update.is_new = patch.isNew;
  if (patch.badgeLabel !== undefined) update.badge_label = patch.badgeLabel;
  if (patch.likesLabel !== undefined) update.likes_label = patch.likesLabel;
  if (patch.savesLabel !== undefined) update.saves_label = patch.savesLabel;
  if (patch.commentsLabel !== undefined) update.comments_label = patch.commentsLabel;
  if (patch.displayOrder !== undefined) update.display_order = patch.displayOrder;
  if (patch.safeScore !== undefined) update.safe_score = patch.safeScore;
  if (patch.contentValueScore !== undefined) update.content_value_score = patch.contentValueScore;

  let { data, error } = await db.from("hot_topics").update(update).eq("id", id).select("*").single();

  if (
    error &&
    (error.message.includes("badge_label") ||
      error.message.includes("display_order") ||
      error.code === "42703")
  ) {
    const base = { ...update };
    delete base.badge_label;
    delete base.likes_label;
    delete base.saves_label;
    delete base.comments_label;
    delete base.display_order;
    ({ data, error } = await db.from("hot_topics").update(base).eq("id", id).select("*").single());
  }

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function createHotTopicForAdmin(input: {
  displayTitle: string;
  rawTitle?: string;
  summary?: string;
  category?: string;
  platform?: string;
  heatValue?: string;
  coverImage?: string;
  viralScore?: number;
  tags?: string[];
  badgeLabel?: string;
  likesLabel?: string;
  savesLabel?: string;
  commentsLabel?: string;
  displayOrder?: number;
}): Promise<AdminHotTopicRow | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const batch = await resolveAdminBatchDate();
  const baseRow = {
    raw_title: input.rawTitle || input.displayTitle,
    display_title: input.displayTitle,
    summary: input.summary ?? "",
    platform: input.platform ?? XHS_INSPIRATION_PLATFORM,
    heat_value: input.heatValue ?? "19.6w",
    heat_score: 80,
    cover_image: input.coverImage ?? "/images/hot/default.svg",
    category: input.category ?? "生活",
    tags: input.tags ?? [],
    target_users: ["短视频创作者"],
    recommend_angles: [],
    viral_score: input.viralScore ?? 75,
    is_new: true,
    status: "active",
    safe_score: 90,
    content_value_score: 90,
    updated_batch_date: batch,
  };

  let { data, error } = await db
    .from("hot_topics")
    .insert({
      ...baseRow,
      badge_label: input.badgeLabel ?? null,
      likes_label: input.likesLabel ?? null,
      saves_label: input.savesLabel ?? null,
      comments_label: input.commentsLabel ?? null,
      display_order: input.displayOrder ?? 0,
    })
    .select("*")
    .single();

  if (
    error &&
    (error.message.includes("badge_label") ||
      error.message.includes("display_order") ||
      error.code === "42703")
  ) {
    ({ data, error } = await db.from("hot_topics").insert(baseRow).select("*").single());
  }

  if (error || !data) {
    console.warn("[createHotTopicForAdmin]", error?.message);
    return null;
  }
  return mapRow(data as Record<string, unknown>);
}

export async function listHotTopicBatchDates(): Promise<string[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("hot_topics")
    .select("updated_batch_date")
    .order("updated_batch_date", { ascending: false })
    .limit(30);
  const set = new Set<string>();
  for (const r of data ?? []) {
    set.add(String((r as Record<string, unknown>).updated_batch_date));
  }
  return [...set];
}
