import { QUOTA_COST } from "@/lib/constants/v1";

export type QuotaUser = {
  dailyQuota: number;
  usedCount: number;
  bonusQuota: number;
};

export function getRemainDaily(user: QuotaUser): number {
  return Math.max(0, user.dailyQuota - user.usedCount);
}

/** 用户可见的「可用灵感」= 今日剩余 + 奖励灵感 */
export function getTotalQuota(user: QuotaUser): number {
  return getRemainDaily(user) + user.bonusQuota;
}

export function getQuotaCost(action: keyof typeof QUOTA_COST | string): number {
  return QUOTA_COST[action] ?? 1;
}

export function canAffordQuota(user: QuotaUser, action: keyof typeof QUOTA_COST | string): boolean {
  return getTotalQuota(user) >= getQuotaCost(action);
}

/** 先扣今日灵感，再扣奖励灵感 */
export function applyQuotaDeduct<T extends QuotaUser>(user: T, cost: number): T | null {
  const remainDaily = getRemainDaily(user);
  if (remainDaily + user.bonusQuota < cost) return null;
  const fromDaily = Math.min(remainDaily, cost);
  const fromBonus = cost - fromDaily;
  return {
    ...user,
    usedCount: user.usedCount + fromDaily,
    bonusQuota: user.bonusQuota - fromBonus,
  };
}

export function hotTopicPackAffordableCount(user: QuotaUser): number {
  const cost = getQuotaCost("hot_topic_pack");
  if (cost <= 0) return 0;
  return Math.floor(getTotalQuota(user) / cost);
}
