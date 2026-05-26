import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rowToHistory, rowToOrder, rowToVideoTask } from "@/lib/server/db/v1";
import { rowToUser } from "@/lib/server/session";
import type { HistoryItem, Order, User, VideoTask } from "@/lib/types/v1";

export interface AdminOverview {
  stats: {
    users: number;
    orders: number;
    paidOrders: number;
    videoTasks: number;
    generations: number;
    feedbacks: number;
    riskRecords: number;
  };
  recentUsers: User[];
  recentOrders: Order[];
  recentTasks: VideoTask[];
  recentHistories: HistoryItem[];
  recentFeedbacks: {
    id: string;
    type: string;
    contact: string;
    description: string;
    status: string;
    createdAt: string;
  }[];
  recentRisks: {
    id: string;
    contentType: string;
    riskLevel: string;
    content: string;
    createdAt: string;
  }[];
}

export async function getAdminOverview(): Promise<AdminOverview | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const [
    usersRes,
    ordersRes,
    paidRes,
    tasksRes,
    genRes,
    fbRes,
    riskRes,
    recentUsers,
    recentOrders,
    recentTasks,
    recentGen,
    recentFb,
    recentRisk,
  ] = await Promise.all([
    db.from("users").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }),
    db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid"),
    db.from("video_tasks").select("*", { count: "exact", head: true }),
    db.from("generations").select("*", { count: "exact", head: true }),
    db.from("support_feedbacks").select("*", { count: "exact", head: true }),
    db.from("risk_records").select("*", { count: "exact", head: true }),
    db.from("users").select("*").order("created_at", { ascending: false }).limit(10),
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
    db.from("video_tasks").select("*").order("created_at", { ascending: false }).limit(10),
    db.from("generations").select("*").order("created_at", { ascending: false }).limit(10),
    db
      .from("support_feedbacks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("risk_records").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return {
    stats: {
      users: usersRes.count ?? 0,
      orders: ordersRes.count ?? 0,
      paidOrders: paidRes.count ?? 0,
      videoTasks: tasksRes.count ?? 0,
      generations: genRes.count ?? 0,
      feedbacks: fbRes.count ?? 0,
      riskRecords: riskRes.count ?? 0,
    },
    recentUsers: (recentUsers.data ?? []).map((r) =>
      rowToUser(r as Record<string, unknown>)
    ),
    recentOrders: (recentOrders.data ?? []).map((r) =>
      rowToOrder(r as Record<string, unknown>)
    ),
    recentTasks: (recentTasks.data ?? []).map((r) =>
      rowToVideoTask(r as Record<string, unknown>)
    ),
    recentHistories: (recentGen.data ?? []).map((r) =>
      rowToHistory(r as Record<string, unknown>)
    ),
    recentFeedbacks: (recentFb.data ?? []).map((r) => ({
      id: String(r.id),
      type: String(r.type),
      contact: String(r.contact ?? ""),
      description: String(r.description ?? "").slice(0, 120),
      status: String(r.status),
      createdAt: new Date(String(r.created_at)).toLocaleString("zh-CN"),
    })),
    recentRisks: (recentRisk.data ?? []).map((r) => ({
      id: String(r.id),
      contentType: String(r.content_type),
      riskLevel: String(r.risk_level),
      content: String(r.content ?? "").slice(0, 80),
      createdAt: new Date(String(r.created_at)).toLocaleString("zh-CN"),
    })),
  };
}

export interface AdminUserRow extends User {
  createdAt: string;
}

export interface AdminOrderRow extends Order {
  userId: string;
  userMobile: string;
  payChannel: string;
  paidAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminMobile: string;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  createdAt: string;
}

export interface AdminContentStats {
  dateKey: string;
  hotTopicsActive: number;
  hotTopicsTotal: number;
  inspirationTitles: number;
  xhsNotes: number;
  latestPush?: {
    title: string;
    body: string;
    dateKey: string;
    createdAt: string;
  };
}

export async function listUsersForAdmin(opts: {
  q?: string;
  page: number;
  limit: number;
}): Promise<{ items: AdminUserRow[]; total: number } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;

  let query = db
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const q = opts.q?.trim();
  if (q) {
    if (/^1\d{10}$/.test(q)) {
      query = query.eq("mobile", q);
    } else if (q.length >= 8) {
      query = query.eq("id", q);
    } else {
      query = query.ilike("mobile", `%${q}%`);
    }
  }

  const { data, count, error } = await query.range(from, to);
  if (error) return null;

  return {
    total: count ?? 0,
    items: (data ?? []).map((r) => ({
      ...rowToUser(r as Record<string, unknown>),
      createdAt: new Date(String(r.created_at)).toLocaleString("zh-CN"),
    })),
  };
}

export async function listOrdersForAdmin(opts: {
  status?: string;
  page: number;
  limit: number;
}): Promise<{ items: AdminOrderRow[]; total: number } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;

  let query = db
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (opts.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) return null;

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((r) => String(r.user_id)))];
  const mobileById = new Map<string, string>();

  if (userIds.length) {
    const { data: users } = await db.from("users").select("id, mobile").in("id", userIds);
    for (const u of users ?? []) {
      mobileById.set(String(u.id), String(u.mobile));
    }
  }

  return {
    total: count ?? 0,
    items: rows.map((r) => {
      const order = rowToOrder(r as Record<string, unknown>);
      return {
        ...order,
        userId: String(r.user_id),
        userMobile: mobileById.get(String(r.user_id)) ?? "—",
        payChannel: String(r.pay_channel ?? ""),
        paidAt: r.paid_at ? new Date(String(r.paid_at)).toLocaleString("zh-CN") : undefined,
      };
    }),
  };
}

export async function listFeedbacksForAdmin(opts: {
  status?: string;
  page: number;
  limit: number;
}): Promise<{ items: AdminOverview["recentFeedbacks"]; total: number } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;

  let query = db
    .from("support_feedbacks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (opts.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) return null;

  return {
    total: count ?? 0,
    items: (data ?? []).map((r) => ({
      id: String(r.id),
      type: String(r.type),
      contact: String(r.contact ?? ""),
      description: String(r.description ?? ""),
      status: String(r.status),
      createdAt: new Date(String(r.created_at)).toLocaleString("zh-CN"),
    })),
  };
}

export async function updateFeedbackStatus(
  adminId: string,
  feedbackId: string,
  status: "pending" | "processed"
): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return false;

  const { data: before } = await db
    .from("support_feedbacks")
    .select("*")
    .eq("id", feedbackId)
    .maybeSingle();
  if (!before) return false;

  const { data: after, error } = await db
    .from("support_feedbacks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", feedbackId)
    .select("*")
    .single();

  if (error || !after) return false;

  await db.from("admin_logs").insert({
    admin_user_id: adminId,
    action: "update_feedback",
    target_type: "support_feedback",
    target_id: feedbackId,
    before_data: before,
    after_data: after,
    reason: `status=${status}`,
  });

  return true;
}

export async function listAdminAuditLogs(opts: {
  page: number;
  limit: number;
}): Promise<{ items: AdminAuditLog[]; total: number } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;

  const { data, count, error } = await db
    .from("admin_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return null;

  const rows = data ?? [];
  const adminIds = [...new Set(rows.map((r) => String(r.admin_user_id)))];
  const mobileById = new Map<string, string>();

  if (adminIds.length) {
    const { data: users } = await db.from("users").select("id, mobile").in("id", adminIds);
    for (const u of users ?? []) {
      mobileById.set(String(u.id), String(u.mobile));
    }
  }

  return {
    total: count ?? 0,
    items: rows.map((r) => ({
      id: String(r.id),
      adminUserId: String(r.admin_user_id),
      adminMobile: mobileById.get(String(r.admin_user_id)) ?? "—",
      action: String(r.action),
      targetType: String(r.target_type),
      targetId: r.target_id ? String(r.target_id) : undefined,
      reason: r.reason ? String(r.reason) : undefined,
      createdAt: new Date(String(r.created_at)).toLocaleString("zh-CN"),
    })),
  };
}

export async function getAdminContentStats(): Promise<AdminContentStats | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const dateKey = new Date().toISOString().slice(0, 10);

  const [activeRes, totalRes, inspRes, xhsRes, pushRes] = await Promise.all([
    db
      .from("hot_topics")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("updated_batch_date", dateKey),
    db.from("hot_topics").select("*", { count: "exact", head: true }),
    db
      .from("daily_inspiration_titles")
      .select("titles")
      .eq("date_key", dateKey)
      .maybeSingle(),
    db
      .from("xhs_hot_notes_daily")
      .select("notes, note_count")
      .eq("topic_date", dateKey)
      .maybeSingle(),
    db
      .from("push_broadcasts")
      .select("*")
      .eq("kind", "hot_topics_daily")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const titles = (inspRes.data?.titles as unknown[]) ?? [];
  const xhsRow = xhsRes.data as { notes?: unknown[]; note_count?: number } | null;
  const notes = (xhsRow?.notes as unknown[]) ?? [];
  const xhsCount =
    typeof xhsRow?.note_count === "number"
      ? xhsRow.note_count
      : Array.isArray(notes)
        ? notes.length
        : 0;
  const push = pushRes.data;

  return {
    dateKey,
    hotTopicsActive: activeRes.count ?? 0,
    hotTopicsTotal: totalRes.count ?? 0,
    inspirationTitles: Array.isArray(titles) ? titles.length : 0,
    xhsNotes: xhsCount,
    latestPush: push
      ? {
          title: String(push.title),
          body: String(push.body),
          dateKey: String(push.date_key),
          createdAt: new Date(String(push.created_at)).toLocaleString("zh-CN"),
        }
      : undefined,
  };
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  before: unknown,
  after: unknown,
  reason: string
): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from("admin_logs").insert({
    admin_user_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    before_data: before,
    after_data: after,
    reason,
  });
}

export async function adminAdjustUser(
  adminId: string,
  targetUserId: string,
  patch: {
    dailyQuota?: number;
    bonusQuota?: number;
    videoCoin?: number;
    plan?: User["plan"];
    resetUsedCount?: boolean;
  },
  reason: string
): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data: before } = await db
    .from("users")
    .select("*")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!before) return null;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.dailyQuota !== undefined) update.daily_quota = patch.dailyQuota;
  if (patch.bonusQuota !== undefined) update.bonus_quota = patch.bonusQuota;
  if (patch.videoCoin !== undefined) update.video_coin = patch.videoCoin;
  if (patch.plan !== undefined) update.plan = patch.plan;
  if (patch.resetUsedCount) update.used_count = 0;

  const { data: after, error } = await db
    .from("users")
    .update(update)
    .eq("id", targetUserId)
    .select("*")
    .single();

  if (error || !after) return null;

  await db.from("admin_logs").insert({
    admin_user_id: adminId,
    action: "adjust_user",
    target_type: "user",
    target_id: targetUserId,
    before_data: before,
    after_data: after,
    reason,
  });

  return rowToUser(after as Record<string, unknown>);
}
