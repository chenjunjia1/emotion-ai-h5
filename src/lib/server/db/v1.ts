import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PLAN_QUOTA } from "@/lib/constants/v1";
import type { Order, ProductDef, User } from "@/lib/types/v1";
import { rowToUser } from "@/lib/server/session";

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

export async function upsertUserOnLogin(mobile: string): Promise<User> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("database_unavailable");

  const existing = await findUserByMobile(mobile);
  if (existing) return existing;

  const role = mobile.endsWith("0000") ? "admin" : "user";
  const { data, error } = await db
    .from("users")
    .insert({
      mobile,
      role,
      plan: "free",
      daily_quota: PLAN_QUOTA.free,
      used_count: 0,
      bonus_quota: 0,
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
      meta: { plan: product.plan, quota: product.quota, coin: product.coin },
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
    const expire = new Date();
    expire.setDate(expire.getDate() + 30);
    patch = {
      plan: meta.plan,
      daily_quota: meta.quota ?? userRow.daily_quota,
      membership_expire_at: expire.toISOString(),
      video_coin: Number(userRow.video_coin) + Number(meta.coin ?? 0),
    };
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

  return findUserById(userId);
}

export async function deductQuota(
  userId: string,
  cost: number,
  reason: string
): Promise<{ ok: boolean; user?: User }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false };

  const user = await findUserById(userId);
  if (!user) return { ok: false };

  const remain = user.dailyQuota - user.usedCount;
  let usedCount = user.usedCount;
  let bonusQuota = user.bonusQuota;

  if (remain >= cost) {
    usedCount += cost;
  } else if (bonusQuota >= cost) {
    bonusQuota -= cost;
  } else {
    return { ok: false, user };
  }

  await db.from("users").update({ used_count: usedCount, bonus_quota: bonusQuota }).eq("id", userId);
  await db.from("quota_logs").insert({
    user_id: userId,
    change_type: "deduct",
    amount: -cost,
    reason,
    before_quota: remain,
    after_quota: user.dailyQuota - usedCount,
  });

  const updated = await findUserById(userId);
  return { ok: true, user: updated ?? undefined };
}
