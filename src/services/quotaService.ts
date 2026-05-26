import { FREE_OPS_CHAT_DAILY, PRO_OPS_CHAT_DAILY, QUOTA_COST } from "@/lib/constants/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  applyProDiscountPrice,
  getAdvancedPrice,
  getQuickFreePerDay,
  getQuickOveragePrice,
} from "@/services/pricingService";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import type { PlanType, User } from "@/lib/types/v1";
import { getTotalQuota } from "@/lib/v1/quota";

export type QuickQuotaCheck = {
  isPro: boolean;
  freeRemaining: number;
  cost: number;
  canProceed: boolean;
  reason?: "free" | "pro" | "points" | "insufficient";
};

export function isProUser(plan: PlanType): boolean {
  return plan !== "free";
}

export async function countQuickPackagesToday(userId: string): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await db
    .from("generations")
    .select("input")
    .eq("user_id", userId)
    .eq("type", "publish_pack")
    .gte("created_at", start.toISOString());
  if (error || !data) return 0;
  return data.filter((row) => {
    const input = row.input as { mode?: string } | null;
    return input?.mode === "quick";
  }).length;
}

export async function checkQuickFreeQuota(user: User): Promise<QuickQuotaCheck> {
  const isPro = isProUser(user.plan);
  if (isPro) {
    return {
      isPro: true,
      freeRemaining: 999,
      cost: 0,
      canProceed: true,
      reason: "pro",
    };
  }
  const used = await countQuickPackagesToday(user.id);
  const freeRemaining = Math.max(0, getQuickFreePerDay() - used);
  if (freeRemaining > 0) {
    return {
      isPro: false,
      freeRemaining,
      cost: 0,
      canProceed: true,
      reason: "free",
    };
  }
  const cost = getQuickOveragePrice();
  const canProceed = getTotalQuota(user) >= cost;
  return {
    isPro: false,
    freeRemaining: 0,
    cost,
    canProceed,
    reason: canProceed ? "points" : "insufficient",
  };
}

export function calcAdvancedCost(
  imageCount: ImageCountOption,
  plan: PlanType
): number {
  return applyProDiscountPrice(getAdvancedPrice(imageCount), plan);
}

export async function consumePoints(
  userId: string,
  points: number,
  reason: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  if (points <= 0) return { ok: true };
  const q = await deductQuota(userId, points, reason);
  if (!q.ok) return { ok: false, error: "quota_insufficient" };
  return { ok: true, user: q.user };
}

export async function refundPoints(
  userId: string,
  points: number,
  reason: string
): Promise<void> {
  if (points > 0) await refundQuota(userId, points, reason);
}

export type OpsChatQuotaCheck = {
  isPro: boolean;
  freeRemaining: number;
  cost: number;
  canProceed: boolean;
  dailyLimit: number;
};

export async function countOpsChatToday(userId: string): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { count, error } = await db
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "emotion_chat")
    .gte("created_at", start.toISOString());
  if (error) return 0;
  return count ?? 0;
}

export async function checkOpsChatDailyQuota(user: User): Promise<OpsChatQuotaCheck> {
  const isPro = isProUser(user.plan);
  const dailyLimit = isPro ? PRO_OPS_CHAT_DAILY : FREE_OPS_CHAT_DAILY;
  const used = await countOpsChatToday(user.id);
  const freeRemaining = Math.max(0, dailyLimit - used);
  const overageCost = QUOTA_COST.emotion_chat ?? 5;

  if (freeRemaining > 0) {
    return {
      isPro,
      freeRemaining,
      cost: 0,
      canProceed: true,
      dailyLimit,
    };
  }

  const canProceed = getTotalQuota(user) >= overageCost;
  return {
    isPro,
    freeRemaining: 0,
    cost: overageCost,
    canProceed,
    dailyLimit,
  };
}
