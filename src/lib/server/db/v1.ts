import { getSupabaseAdmin } from "@/lib/supabase/server";
import { NEW_USER_WELCOME_BONUS, PLAN_QUOTA, VIDEO_COIN_COST } from "@/lib/constants/v1";
import type {
  HistoryItem,
  Order,
  ProductDef,
  User,
  VideoTask,
} from "@/lib/types/v1";
import { isAdminMobile } from "@/lib/server/admin";
import { rowToUser } from "@/lib/server/session";

const GENERATION_TYPE_LABEL: Record<string, string> = {
  account: "账号方案",
  daily: "完整发布包",
  publish_pack: "完整发布包",
  topic_box: "今日选题盲盒",
  title_gacha: "爆款标题扭蛋",
  viral: "爆款同款拆解",
  review: "发完复盘",
  reply: "神回复",
  emotion_chat: "AI助手",
  score: "爆款潜力打分",
  hot_topic_pack: "爆品内容包",
  account_test: "测号结果",
  hot_topic: "热点灵感",
};

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    orderNo: String(row.order_no),
    productType: row.product_type as Order["productType"],
    productName: String(row.product_name),
    amount: Number(row.amount),
    status: row.status as Order["status"],
    benefitGranted: Boolean(row.benefit_granted),
    benefitGrantedAt: row.benefit_granted_at
      ? String(row.benefit_granted_at)
      : undefined,
    meta: (row.meta as Record<string, unknown>) ?? {},
    createdAt: formatCreatedAt(String(row.created_at)),
  };
}

export function rowToVideoTask(row: Record<string, unknown>): VideoTask {
  return {
    id: String(row.id),
    taskType: row.task_type as VideoTask["taskType"],
    script: String(row.script ?? ""),
    status: row.status as VideoTask["status"],
    costVideoCoin: Number(row.cost_video_coin ?? 0),
    videoUrl: row.video_url ? String(row.video_url) : undefined,
    errorMessage: row.error_message ? String(row.error_message) : undefined,
    createdAt: formatCreatedAt(String(row.created_at)),
  };
}

export function rowToHistory(row: Record<string, unknown>): HistoryItem {
  const type = String(row.type ?? "");
  return {
    id: String(row.id),
    type: GENERATION_TYPE_LABEL[type] ?? type,
    topic: String(row.topic ?? ""),
    createdAt: formatCreatedAt(String(row.created_at)),
    output: (row.output as Record<string, unknown>) ?? undefined,
  };
}

export async function findUserByMobile(mobile: string): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db.from("users").select("*").eq("mobile", mobile).maybeSingle();
  return data ? rowToUser(data as Record<string, unknown>) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db.from("users").select("*").eq("id", id).maybeSingle();
  return data ? rowToUser(data as Record<string, unknown>) : null;
}

/** 白名单管理员登录时同步 role（老用户注册时可能还是 user） */
async function syncAdminRoleOnLogin(user: User, mobile: string): Promise<User> {
  if (!isAdminMobile(mobile) || user.role === "admin") return user;
  const db = getSupabaseAdmin();
  if (!db) return user;
  const { error } = await db
    .from("users")
    .update({ role: "admin", updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) {
    console.error("[syncAdminRoleOnLogin]", error.message);
    return user;
  }
  return { ...user, role: "admin" };
}

export async function upsertUserOnLogin(
  mobile: string,
  existing?: User | null
): Promise<User> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("database_unavailable");

  if (existing) return syncAdminRoleOnLogin(existing, mobile);

  const found = existing === undefined ? await findUserByMobile(mobile) : null;
  if (found) return syncAdminRoleOnLogin(found, mobile);

  const role = isAdminMobile(mobile) ? "admin" : "user";
  const { data, error } = await db
    .from("users")
    .insert({
      mobile,
      role,
      plan: "free",
      daily_quota: PLAN_QUOTA.free,
      used_count: 0,
      bonus_quota: NEW_USER_WELCOME_BONUS,
      video_coin: 0,
      frozen_video_coin: 0,
      language: "zh",
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "user_create_failed");
  return rowToUser(data as Record<string, unknown>);
}

export async function saveSmsLog(input: {
  mobile: string;
  code: string;
  ip?: string;
  status: string;
  expiredAt: Date;
}) {
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from("sms_logs").insert({
    mobile: input.mobile,
    code: input.code,
    ip: input.ip ?? null,
    status: input.status,
    expired_at: input.expiredAt.toISOString(),
  });
}

export async function getLatestValidSmsCode(mobile: string): Promise<{
  code: string;
  expiredAt: string;
} | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db
    .from("sms_logs")
    .select("code, expired_at, status")
    .eq("mobile", mobile)
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { code: String(data.code), expiredAt: String(data.expired_at) };
}

export async function countSmsToday(mobile: string): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { count } = await db
    .from("sms_logs")
    .select("*", { count: "exact", head: true })
    .eq("mobile", mobile)
    .gte("created_at", start.toISOString());
  return count ?? 0;
}

export async function createOrder(
  userId: string,
  product: ProductDef,
  payChannel: string
): Promise<Order> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("database_unavailable");

  const orderNo = `SV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const { data, error } = await db
    .from("orders")
    .insert({
      user_id: userId,
      order_no: orderNo,
      product_type: product.productType,
      product_name: product.productName,
      amount: product.amount,
      pay_channel: payChannel,
      status: "pending",
      benefit_granted: false,
      meta: {
        plan: product.plan,
        quota: product.quota,
        coin: product.coin,
        bonusQuota: product.bonusQuota,
        membershipDays: product.membershipDays,
      },
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "order_create_failed");

  return {
    id: String(data.id),
    orderNo: String(data.order_no),
    productType: data.product_type as Order["productType"],
    productName: String(data.product_name),
    amount: Number(data.amount),
    status: "pending",
    benefitGranted: false,
    meta: (data.meta as Record<string, unknown>) ?? {},
    createdAt: String(data.created_at),
  };
}

export async function grantOrderBenefit(orderId: string, userId: string): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data: order } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!order || order.benefit_granted || order.status === "paid") {
    const u = await findUserById(userId);
    return u;
  }

  const meta = (order.meta as Record<string, unknown>) || {};
  const { data: userRow } = await db.from("users").select("*").eq("id", userId).single();
  if (!userRow) return null;

  let patch: Record<string, unknown> = {};
  if (order.product_type === "video_coin" && meta.coin) {
    patch = { video_coin: Number(userRow.video_coin) + Number(meta.coin) };
  } else if (order.product_type === "membership" && meta.plan) {
    const days = Math.max(1, Number(meta.membershipDays ?? 30));
    const expire = new Date();
    expire.setDate(expire.getDate() + days);
    patch = {
      plan: meta.plan,
      daily_quota: meta.quota ?? userRow.daily_quota,
      membership_expire_at: expire.toISOString(),
      video_coin: Number(userRow.video_coin) + Number(meta.coin ?? 0),
    };
  } else if (order.product_type === "quota_pack" && meta.bonusQuota) {
    const add = Number(meta.bonusQuota);
    patch = {
      bonus_quota: Number(userRow.bonus_quota) + add,
    };
    await db.from("quota_logs").insert({
      user_id: userId,
      change_type: "grant",
      amount: add,
      reason: `quota_pack:${order.product_name}`,
    });
  }

  await db
    .from("orders")
    .update({
      status: "paid",
      benefit_granted: true,
      benefit_granted_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (Object.keys(patch).length) {
    await db.from("users").update(patch).eq("id", userId);
  }

  if (order.product_type === "membership") {
    const { grantMemberInviteRewardOnPay } = await import("@/lib/server/db/invite");
    await grantMemberInviteRewardOnPay(userId);
  }

  return findUserById(userId);
}

export async function deductQuota(
  userId: string,
  cost: number,
  reason: string
): Promise<{ ok: boolean; user?: User }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false };

  const { data: rpcRows, error: rpcError } = await db.rpc("deduct_user_quota", {
    p_user_id: userId,
    p_cost: cost,
    p_reason: reason,
  });

  if (!rpcError && rpcRows && Array.isArray(rpcRows) && rpcRows.length > 0) {
    const row = rpcRows[0] as { ok?: boolean };
    if (row.ok) {
      const updated = await findUserById(userId);
      return { ok: true, user: updated ?? undefined };
    }
    const user = await findUserById(userId);
    return { ok: false, user: user ?? undefined };
  }

  const user = await findUserById(userId);
  if (!user) return { ok: false };

  const remainDaily = Math.max(0, user.dailyQuota - user.usedCount);
  const total = remainDaily + user.bonusQuota;
  if (total < cost) {
    return { ok: false, user };
  }

  let usedCount = user.usedCount;
  let bonusQuota = user.bonusQuota;
  const fromDaily = Math.min(remainDaily, cost);
  usedCount += fromDaily;
  bonusQuota -= cost - fromDaily;

  const { data: updatedRow, error: updateError } = await db
    .from("users")
    .update({ used_count: usedCount, bonus_quota: bonusQuota })
    .eq("id", userId)
    .eq("used_count", user.usedCount)
    .eq("bonus_quota", user.bonusQuota)
    .select()
    .maybeSingle();

  if (updateError || !updatedRow) {
    const latest = await findUserById(userId);
    return { ok: false, user: latest ?? undefined };
  }

  await db.from("quota_logs").insert({
    user_id: userId,
    change_type: "deduct",
    amount: -cost,
    reason,
    before_quota: remainDaily,
    after_quota: Math.max(0, user.dailyQuota - usedCount) + bonusQuota,
  });

  const updated = await findUserById(userId);
  return { ok: true, user: updated ?? undefined };
}

/** 生成失败等场景退回额度（优先补到奖励额度） */
export async function refundQuota(
  userId: string,
  cost: number,
  reason: string
): Promise<{ ok: boolean; user?: User }> {
  const db = getSupabaseAdmin();
  if (!db || cost <= 0) return { ok: false };

  const user = await findUserById(userId);
  if (!user) return { ok: false };

  const bonusQuota = user.bonusQuota + cost;
  await db.from("users").update({ bonus_quota: bonusQuota }).eq("id", userId);
  const remainDaily = Math.max(0, user.dailyQuota - user.usedCount);
  await db.from("quota_logs").insert({
    user_id: userId,
    change_type: "refund",
    amount: cost,
    reason,
    before_quota: remainDaily + user.bonusQuota,
    after_quota: remainDaily + bonusQuota,
  });

  const updated = await findUserById(userId);
  return { ok: true, user: updated ?? undefined };
}

export async function listOrdersForUser(userId: string, limit = 50): Promise<Order[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => rowToOrder(row as Record<string, unknown>));
}

export async function listGenerationsForUser(
  userId: string,
  limit = 50
): Promise<HistoryItem[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => rowToHistory(row as Record<string, unknown>));
}

export async function listVideoTasksForUser(
  userId: string,
  limit = 50
): Promise<VideoTask[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("video_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => rowToVideoTask(row as Record<string, unknown>));
}

export async function countProcessingVideoTasks(userId: string): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  const { count } = await db
    .from("video_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["pending", "processing"]);
  return count ?? 0;
}

function videoCoinCostKey(
  taskType: "avatar" | "auto",
  duration: 30 | 60
): keyof typeof VIDEO_COIN_COST {
  if (taskType === "avatar") {
    return duration === 60 ? "avatar60" : "avatar30";
  }
  return duration === 60 ? "auto60" : "auto30";
}

export async function createVideoTaskRecord(input: {
  userId: string;
  taskType: "avatar" | "auto";
  script: string;
  duration: 30 | 60;
  riskLevel: string;
  provider?: string;
}): Promise<{ ok: boolean; task?: VideoTask; user?: User; error?: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "database_unavailable" };

  const user = await findUserById(input.userId);
  if (!user) return { ok: false, error: "user_not_found" };

  const processing = await countProcessingVideoTasks(input.userId);
  if (processing >= 3) {
    return { ok: false, error: "task_max_concurrent", user };
  }

  const cost = VIDEO_COIN_COST[videoCoinCostKey(input.taskType, input.duration)];
  if (user.videoCoin < cost) {
    return { ok: false, error: "coin_insufficient", user };
  }

  const beforeCoin = user.videoCoin;
  const beforeFrozen = user.frozenVideoCoin;
  const afterCoin = beforeCoin - cost;
  const afterFrozen = beforeFrozen + cost;

  const { error: userErr } = await db
    .from("users")
    .update({ video_coin: afterCoin, frozen_video_coin: afterFrozen })
    .eq("id", input.userId);

  if (userErr) return { ok: false, error: userErr.message };

  const { data, error } = await db
    .from("video_tasks")
    .insert({
      user_id: input.userId,
      task_type: input.taskType,
      script: input.script,
      provider: input.provider ?? "mock",
      status: "processing",
      cost_video_coin: cost,
      frozen_video_coin: cost,
      risk_level: input.riskLevel,
    })
    .select("*")
    .single();

  if (error || !data) {
    await db
      .from("users")
      .update({ video_coin: beforeCoin, frozen_video_coin: beforeFrozen })
      .eq("id", input.userId);
    return { ok: false, error: error?.message || "task_create_failed" };
  }

  await db.from("video_coin_logs").insert({
    user_id: input.userId,
    change_type: "freeze",
    amount: -cost,
    reason: `freeze · 任务 ${data.id}`,
    before_coin: beforeCoin,
    after_coin: afterCoin,
    before_frozen_coin: beforeFrozen,
    after_frozen_coin: afterFrozen,
    related_task_id: data.id,
  });

  const task = rowToVideoTask(data as Record<string, unknown>);
  const updatedUser = await findUserById(input.userId);
  return { ok: true, task, user: updatedUser ?? undefined };
}

const MOCK_VIDEO_PROCESS_MS = 1800;

export async function advanceMockVideoTasks(userId: string): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;

  const { data: rows } = await db
    .from("video_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "processing")
    .eq("provider", "mock");

  if (!rows?.length) return;

  const now = Date.now();
  for (const row of rows) {
    const created = new Date(String(row.created_at)).getTime();
    if (now - created < MOCK_VIDEO_PROCESS_MS) continue;

    const script = String(row.script ?? "");
    const cost = Number(row.cost_video_coin ?? 0);
    const fail = script.includes("失败");
    const user = await findUserById(userId);
    if (!user) continue;

    if (fail) {
      const newCoin = user.videoCoin + cost;
      const newFrozen = Math.max(0, user.frozenVideoCoin - cost);
      await db
        .from("video_tasks")
        .update({
          status: "failed",
          error_message: "模拟失败",
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      await db
        .from("users")
        .update({ video_coin: newCoin, frozen_video_coin: newFrozen })
        .eq("id", userId);
      await db.from("video_coin_logs").insert({
        user_id: userId,
        change_type: "refund",
        amount: cost,
        reason: `refund · 任务 ${row.id}`,
        before_coin: user.videoCoin,
        after_coin: newCoin,
        before_frozen_coin: user.frozenVideoCoin,
        after_frozen_coin: newFrozen,
        related_task_id: row.id,
      });
    } else {
      const newFrozen = Math.max(0, user.frozenVideoCoin - cost);
      await db
        .from("video_tasks")
        .update({
          status: "success",
          video_url: "mock.mp4",
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      await db
        .from("users")
        .update({ frozen_video_coin: newFrozen })
        .eq("id", userId);
      await db.from("video_coin_logs").insert({
        user_id: userId,
        change_type: "consume",
        amount: -cost,
        reason: `consume · 任务 ${row.id}`,
        before_coin: user.videoCoin,
        after_coin: user.videoCoin,
        before_frozen_coin: user.frozenVideoCoin,
        after_frozen_coin: newFrozen,
        related_task_id: row.id,
      });
      await db.from("generations").insert({
        user_id: userId,
        type: "daily",
        topic:
          row.task_type === "avatar" ? "数字人口播" : "AI自动成片",
        input: { script: script.slice(0, 200), taskId: row.id },
        output: { script: script.slice(0, 40) },
        cost_quota: 0,
      });
    }
  }
}

export async function saveSupportFeedback(input: {
  userId?: string;
  type: string;
  contact: string;
  description: string;
  relatedOrderNo?: string;
  relatedTaskId?: string;
}): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return false;
  const { error } = await db.from("support_feedbacks").insert({
    user_id: input.userId ?? null,
    type: input.type,
    contact: input.contact,
    description: input.description,
    related_order_no: input.relatedOrderNo ?? null,
    related_task_id: input.relatedTaskId ?? null,
    status: "pending",
  });
  return !error;
}
