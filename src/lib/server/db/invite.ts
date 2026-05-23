import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  INVITE_MEMBER_REWARD,
  INVITE_MONTHLY_CAP,
  INVITE_REGISTER_REWARD,
} from "@/lib/constants/v1";
import { findUserById } from "@/lib/server/db/v1";
import { rowToUser } from "@/lib/server/session";
import type { User } from "@/lib/types/v1";

function maskMobile(m: string): string {
  if (m.length < 7) return m;
  return `${m.slice(0, 3)}****${m.slice(-4)}`;
}

import { makeInviteCode } from "@/lib/invite-code";

export async function ensureUserInviteCode(userId: string, mobile: string): Promise<string> {
  const db = getSupabaseAdmin();
  if (!db) return makeInviteCode(mobile, userId);

  const { data } = await db.from("users").select("invite_code").eq("id", userId).single();
  if (data?.invite_code) return String(data.invite_code);

  let code = makeInviteCode(mobile, userId);
  for (let i = 0; i < 5; i++) {
    const { data: exists } = await db
      .from("users")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (!exists) break;
    code = `${makeInviteCode(mobile, userId)}${i}`;
  }
  await db.from("users").update({ invite_code: code }).eq("id", userId);
  return code;
}

export async function findUserByInviteCode(code: string): Promise<User | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data } = await db
    .from("users")
    .select("*")
    .eq("invite_code", code.trim().toUpperCase())
    .maybeSingle();
  return data ? rowToUser(data as Record<string, unknown>) : null;
}

export async function processInviteOnRegister(input: {
  inviteeUserId: string;
  inviteeMobile: string;
  inviteCode?: string;
  ip?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const db = getSupabaseAdmin();
  if (!db || !input.inviteCode?.trim()) return { ok: false, reason: "no_code" };

  const code = input.inviteCode.trim().toUpperCase();
  const inviter = await findUserByInviteCode(code);
  if (!inviter) return { ok: false, reason: "invalid_code" };
  if (inviter.id === input.inviteeUserId) return { ok: false, reason: "self_invite" };

  const { data: existingInvite } = await db
    .from("invite_records")
    .select("id")
    .eq("invitee_user_id", input.inviteeUserId)
    .maybeSingle();
  if (existingInvite) return { ok: false, reason: "already_rewarded" };

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { count: monthCount } = await db
    .from("invite_records")
    .select("*", { count: "exact", head: true })
    .eq("inviter_user_id", inviter.id)
    .gte("registered_at", monthStart.toISOString());
  if ((monthCount ?? 0) >= INVITE_MONTHLY_CAP) {
    return { ok: false, reason: "monthly_cap" };
  }

  const { data: inviterRow } = await db.from("users").select("*").eq("id", inviter.id).single();
  const { data: inviteeRow } = await db
    .from("users")
    .select("*")
    .eq("id", input.inviteeUserId)
    .single();
  if (!inviterRow || !inviteeRow) return { ok: false, reason: "user_missing" };

  const inviterBonus = Number(inviterRow.bonus_quota) + INVITE_REGISTER_REWARD;
  const inviteeBonus = Number(inviteeRow.bonus_quota) + INVITE_REGISTER_REWARD;

  await db
    .from("users")
    .update({
      bonus_quota: inviterBonus,
      invite_count: Number(inviterRow.invite_count ?? 0) + 1,
      invite_reward_total:
        Number(inviterRow.invite_reward_total ?? 0) + INVITE_REGISTER_REWARD,
      invite_blind_box_count: Number(inviterRow.invite_blind_box_count ?? 0) + 1,
    })
    .eq("id", inviter.id);

  await db
    .from("users")
    .update({
      bonus_quota: inviteeBonus,
      invited_by: inviter.id,
      invite_reward_total:
        Number(inviteeRow.invite_reward_total ?? 0) + INVITE_REGISTER_REWARD,
    })
    .eq("id", input.inviteeUserId);

  await db.from("invite_records").insert({
    inviter_user_id: inviter.id,
    invitee_user_id: input.inviteeUserId,
    invite_code: code,
    invitee_mobile_masked: maskMobile(input.inviteeMobile),
    reward_status: "rewarded",
    inviter_reward_quota: INVITE_REGISTER_REWARD,
    invitee_reward_quota: INVITE_REGISTER_REWARD,
    blind_box_reward_count: 1,
    reward_reason: "invite_register_reward",
    ip: input.ip ?? null,
    registered_at: new Date().toISOString(),
    rewarded_at: new Date().toISOString(),
  });

  await db.from("quota_logs").insert([
    {
      user_id: inviter.id,
      change_type: "grant",
      amount: INVITE_REGISTER_REWARD,
      reason: "invite_register_reward",
    },
    {
      user_id: input.inviteeUserId,
      change_type: "grant",
      amount: INVITE_REGISTER_REWARD,
      reason: "invitee_register_reward",
    },
  ]);

  return { ok: true };
}

/** 被邀请人开通会员后，给邀请人发放奖励灵感（服务端支付成功时调用） */
export async function grantMemberInviteRewardOnPay(
  memberUserId: string
): Promise<{ granted: boolean }> {
  const db = getSupabaseAdmin();
  if (!db) return { granted: false };

  const { data: inviteeRow } = await db
    .from("users")
    .select("invited_by")
    .eq("id", memberUserId)
    .maybeSingle();

  const inviterId = inviteeRow?.invited_by ? String(inviteeRow.invited_by) : "";
  if (!inviterId) return { granted: false };

  const { data: record } = await db
    .from("invite_records")
    .select("id, reward_status")
    .eq("invitee_user_id", memberUserId)
    .eq("inviter_user_id", inviterId)
    .maybeSingle();

  if (!record || record.reward_status === "member_rewarded") {
    return { granted: false };
  }

  const { data: inviterRow } = await db.from("users").select("*").eq("id", inviterId).single();
  if (!inviterRow) return { granted: false };

  const nextBonus = Number(inviterRow.bonus_quota ?? 0) + INVITE_MEMBER_REWARD;

  await db
    .from("users")
    .update({
      bonus_quota: nextBonus,
      invite_reward_total:
        Number(inviterRow.invite_reward_total ?? 0) + INVITE_MEMBER_REWARD,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inviterId);

  await db
    .from("invite_records")
    .update({
      reward_status: "member_rewarded",
      member_reward_quota: INVITE_MEMBER_REWARD,
      member_rewarded_at: new Date().toISOString(),
    })
    .eq("id", record.id);

  await db.from("quota_logs").insert({
    user_id: inviterId,
    change_type: "grant",
    amount: INVITE_MEMBER_REWARD,
    reason: "invite_member_reward",
  });

  return { granted: true };
}

export { INVITE_MEMBER_REWARD };
