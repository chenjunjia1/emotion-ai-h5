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

export async function adminAdjustUser(
  adminId: string,
  targetUserId: string,
  patch: {
    dailyQuota?: number;
    bonusQuota?: number;
    videoCoin?: number;
    plan?: User["plan"];
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
