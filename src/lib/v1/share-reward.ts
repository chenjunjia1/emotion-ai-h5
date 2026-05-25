import type { User } from "@/lib/types/v1";
import { persistUserLocal } from "@/lib/client/persist-user";

export const DAILY_SHARE_REWARD = 10;
const STORAGE_DAILY_SHARE = "sv-v1-daily-share-reward";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function hasClaimedDailyShareReward(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_DAILY_SHARE);
    if (!raw) return false;
    const data = JSON.parse(raw) as { date: string };
    return data.date === todayKey();
  } catch {
    return false;
  }
}

/** 每日首次分享发布结果 +10 灵感；返回是否本次发放成功 */
export function claimDailyShareReward(user: User): { granted: boolean; user: User } {
  if (hasClaimedDailyShareReward()) {
    return { granted: false, user };
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_DAILY_SHARE, JSON.stringify({ date: todayKey() }));
  }
  const next: User = { ...user, bonusQuota: user.bonusQuota + DAILY_SHARE_REWARD };
  persistUserLocal(next);
  return { granted: true, user: next };
}
