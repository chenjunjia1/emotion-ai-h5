import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rollInviteBlindBoxReward } from "@/lib/constants/invite-rewards";
import { findUserById } from "@/lib/server/db/v1";

export async function openInviteBlindBoxForUser(userId: string): Promise<{
  ok: boolean;
  error?: string;
  reward?: ReturnType<typeof rollInviteBlindBoxReward>;
  user?: Awaited<ReturnType<typeof findUserById>>;
}> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "database_unavailable" };

  const { data: row, error } = await db
    .from("users")
    .select("invite_blind_box_count, bonus_quota, invite_reward_total")
    .eq("id", userId)
    .single();

  if (error || !row) return { ok: false, error: "user_missing" };

  const count = Number(row.invite_blind_box_count ?? 0);
  if (count <= 0) return { ok: false, error: "no_blind_box" };

  const reward = rollInviteBlindBoxReward();
  let bonusQuota = Number(row.bonus_quota ?? 0);
  let inviteRewardTotal = Number(row.invite_reward_total ?? 0);

  if (reward.type === "quota" && reward.amount) {
    bonusQuota += reward.amount;
    inviteRewardTotal += reward.amount;
  }

  const { error: updErr } = await db
    .from("users")
    .update({
      invite_blind_box_count: count - 1,
      bonus_quota: bonusQuota,
      invite_reward_total: inviteRewardTotal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updErr) {
    console.error("[openInviteBlindBoxForUser]", updErr.message);
    return { ok: false, error: updErr.message };
  }

  const user = await findUserById(userId);
  return { ok: true, reward, user: user ?? undefined };
}
