import { getSupabaseAdmin } from "@/lib/supabase/server";
import { NEW_USER_WELCOME_BONUS, PLAN_QUOTA } from "@/lib/constants/v1";
import { isAdminMobile } from "@/lib/server/admin";
import { findUserByMobile } from "@/lib/server/db/v1";
import { rowToUser } from "@/lib/server/session";
import type { User } from "@/lib/types/v1";

function syntheticMobile(openid: string): string {
  return `mp_${openid.replace(/\W/g, "").slice(-12)}`;
}

export async function findUserByMiniOpenid(openid: string): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db
    .from("users")
    .select("*")
    .eq("mini_openid", openid)
    .maybeSingle();
  return data ? rowToUser(data as Record<string, unknown>) : null;
}

export async function upsertUserOnMiniLogin(opts: {
  openid: string;
  unionid?: string;
}): Promise<User> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("database_unavailable");

  const existing = await findUserByMiniOpenid(opts.openid);
  if (existing) {
    if (opts.unionid) {
      await db
        .from("users")
        .update({ unionid: opts.unionid, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    }
    return existing;
  }

  let mobile = syntheticMobile(opts.openid);
  let tries = 0;
  while ((await findUserByMobile(mobile)) && tries < 5) {
    mobile = `${syntheticMobile(opts.openid)}${tries}`;
    tries += 1;
  }

  const { data, error } = await db
    .from("users")
    .insert({
      mobile,
      mini_openid: opts.openid,
      unionid: opts.unionid ?? null,
      role: "user",
      plan: "free",
      daily_quota: PLAN_QUOTA.free,
      bonus_quota: NEW_USER_WELCOME_BONUS,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "mini_user_create_failed");
  return rowToUser(data as Record<string, unknown>);
}

export async function bindMiniUserMobile(
  userId: string,
  mobile: string
): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const other = await findUserByMobile(mobile);
  if (other && other.id !== userId) {
    throw new Error("mobile_already_bound");
  }

  const role = isAdminMobile(mobile) ? "admin" : "user";
  const { data, error } = await db
    .from("users")
    .update({
      mobile,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToUser(data as Record<string, unknown>);
}

export async function getUserMiniOpenid(userId: string): Promise<string | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db
    .from("users")
    .select("mini_openid")
    .eq("id", userId)
    .maybeSingle();
  return data?.mini_openid ? String(data.mini_openid) : null;
}

export async function listSubscribedOpenids(
  templateId: string
): Promise<string[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data } = await db
    .from("wechat_subscribe_logs")
    .select("openid")
    .eq("template_id", templateId);
  const set = new Set<string>();
  for (const row of data ?? []) {
    const o = String((row as { openid?: string }).openid ?? "");
    if (o) set.add(o);
  }
  return [...set];
}

export async function saveSubscribeLog(opts: {
  userId: string;
  openid: string;
  templateId: string;
}): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from("wechat_subscribe_logs").upsert(
    {
      user_id: opts.userId,
      openid: opts.openid,
      template_id: opts.templateId,
      subscribed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,template_id" }
  );
}
