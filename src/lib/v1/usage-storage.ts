import { STORAGE_DAILY_USAGE } from "@/lib/constants/v1";
import type { PlanType } from "@/lib/types/v1";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";

export interface DailyUsage {
  date: string;
  topicBox: number;
  titleGacha: number;
  viralScore: number;
  hotTopicGen: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadDailyUsage(): DailyUsage {
  if (typeof window === "undefined") {
    return { date: todayKey(), topicBox: 0, titleGacha: 0, viralScore: 0, hotTopicGen: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_DAILY_USAGE);
    const data = raw ? (JSON.parse(raw) as DailyUsage) : null;
    if (!data || data.date !== todayKey()) {
      return { date: todayKey(), topicBox: 0, titleGacha: 0, viralScore: 0, hotTopicGen: 0 };
    }
    return data;
  } catch {
    return { date: todayKey(), topicBox: 0, titleGacha: 0, viralScore: 0, hotTopicGen: 0 };
  }
}

export function saveDailyUsage(u: DailyUsage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_DAILY_USAGE, JSON.stringify(u));
}

export function canUseFeature(
  plan: PlanType,
  feature: keyof (typeof FEATURE_LIMITS)["free"],
  usage: DailyUsage
): boolean {
  const limit = FEATURE_LIMITS[plan][feature];
  if (feature === "topicBox") return usage.topicBox < limit;
  if (feature === "titleGacha") return usage.titleGacha < limit;
  if (feature === "viralScore") return usage.viralScore < limit;
  if (feature === "hotTopicGen") return usage.hotTopicGen < limit;
  return true;
}

export function bumpFeature(
  usage: DailyUsage,
  feature: "topicBox" | "titleGacha" | "viralScore" | "hotTopicGen"
): DailyUsage {
  const next = { ...usage, date: todayKey() };
  next[feature] += 1;
  saveDailyUsage(next);
  return next;
}
