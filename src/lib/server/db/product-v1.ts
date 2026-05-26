import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  getDailyInspirationTitles,
  shuffleTitlesByBatch,
} from "@/lib/publish-pack/resolve-daily-inspiration";

export interface InviteRecordRow {
  id: string;
  inviteeMobileMasked: string;
  registeredAt: string;
  rewardStatus: string;
  inviterRewardQuota: number;
  inviteeRewardQuota: number;
  memberRewardQuota: number;
  isMember: boolean;
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDailyInspirationTitlesFromDb(
  dateKey = todayDate()
): Promise<string[] | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data: existing, error } = await db
    .from("daily_inspiration_titles")
    .select("titles")
    .eq("topic_date", dateKey)
    .maybeSingle();

  if (error) {
    console.warn("[daily_inspiration_titles]", error.message);
    return null;
  }

  if (existing?.titles && Array.isArray(existing.titles)) {
    const titles = existing.titles.filter((t): t is string => typeof t === "string" && t.length > 0);
    if (titles.length > 0) return titles;
  }
  return null;
}

export async function saveDailyInspirationTitles(
  dateKey: string,
  titles: string[]
): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "no_db" };

  const { error } = await db.from("daily_inspiration_titles").upsert(
    { topic_date: dateKey, titles },
    { onConflict: "topic_date" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** 优先读库（DeepSeek 每日写入）；无库时用本地池按日洗牌 */
export async function getOrCreateDailyInspirationTitles(batch = 0): Promise<string[]> {
  const dateKey = todayDate();
  const cached = await getDailyInspirationTitlesFromDb(dateKey);
  if (cached && cached.length > 0) {
    if (batch === 0) return cached.slice(0, 30);
    return shuffleTitlesByBatch(cached, dateKey, batch).slice(0, 30);
  }
  return getDailyInspirationTitles(dateKey, batch, 30);
}

export async function listInviteRecordsForUser(
  userId: string,
  limit = 50
): Promise<InviteRecordRow[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];

  const { data } = await db
    .from("invite_records")
    .select("*")
    .eq("inviter_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const status = String(r.reward_status ?? "pending");
    return {
      id: String(r.id),
      inviteeMobileMasked: String(r.invitee_mobile_masked ?? "—"),
      registeredAt: r.registered_at
        ? String(r.registered_at)
        : String(r.created_at ?? ""),
      rewardStatus: status,
      inviterRewardQuota: Number(r.inviter_reward_quota ?? 0),
      inviteeRewardQuota: Number(r.invitee_reward_quota ?? 0),
      memberRewardQuota: Number(r.member_reward_quota ?? 0),
      isMember: status === "member_rewarded",
    };
  });
}

export async function bumpUserDailyUsage(
  userId: string,
  field: "topic_box_count" | "title_gacha_count" | "viral_score_count" | "hot_topic_gen_count"
): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) return;
  const dateKey = todayDate();

  const { data: row } = await db
    .from("user_daily_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("usage_date", dateKey)
    .maybeSingle();

  if (row) {
    const current = Number((row as Record<string, unknown>)[field] ?? 0);
    await db
      .from("user_daily_usage")
      .update({ [field]: current + 1 })
      .eq("id", (row as Record<string, unknown>).id);
  } else {
    await db.from("user_daily_usage").insert({
      user_id: userId,
      usage_date: dateKey,
      topic_box_count: field === "topic_box_count" ? 1 : 0,
      title_gacha_count: field === "title_gacha_count" ? 1 : 0,
      viral_score_count: field === "viral_score_count" ? 1 : 0,
      hot_topic_gen_count: field === "hot_topic_gen_count" ? 1 : 0,
    });
  }
}

export async function getUserDailyUsageCounts(userId: string): Promise<{
  topicBox: number;
  titleGacha: number;
  viralScore: number;
  hotTopicGen: number;
}> {
  const db = getSupabaseAdmin();
  if (!db) {
    return { topicBox: 0, titleGacha: 0, viralScore: 0, hotTopicGen: 0 };
  }
  const { data } = await db
    .from("user_daily_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("usage_date", todayDate())
    .maybeSingle();

  if (!data) {
    return { topicBox: 0, titleGacha: 0, viralScore: 0, hotTopicGen: 0 };
  }
  const r = data as Record<string, unknown>;
  return {
    topicBox: Number(r.topic_box_count ?? 0),
    titleGacha: Number(r.title_gacha_count ?? 0),
    viralScore: Number(r.viral_score_count ?? 0),
    hotTopicGen: Number(r.hot_topic_gen_count ?? 0),
  };
}
