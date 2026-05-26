import type { PlanType } from "@/lib/types/v1";

/** V1 功能每日次数限制（不含总额度 dailyQuota） */
export const FEATURE_LIMITS: Record<
  PlanType,
  {
    topicBox: number;
    titleGacha: number;
    viralScore: number;
    hotTopicView: number;
    hotTopicGen: number;
    publishReminders: number;
  }
> = {
  free: {
    topicBox: 1,
    titleGacha: 1,
    viralScore: 1,
    hotTopicView: 5,
    hotTopicGen: 1,
    publishReminders: 3,
  },
  pro: {
    topicBox: 3,
    titleGacha: 10,
    viralScore: 20,
    hotTopicView: 99,
    hotTopicGen: 10,
    publishReminders: 30,
  },
  premium: {
    topicBox: 999,
    titleGacha: 999,
    viralScore: 999,
    hotTopicView: 99,
    hotTopicGen: 30,
    publishReminders: 999,
  },
  studio: {
    topicBox: 999,
    titleGacha: 999,
    viralScore: 999,
    hotTopicView: 99,
    hotTopicGen: 99,
    publishReminders: 999,
  },
};

export const QUOTA_COST_V1 = {
  publish_pack: 30,
  hot_topic_pack: 10,
  topic_box: 5,
  account: 30,
  account_test: 10,
  viral: 5,
  reply: 5,
  score: 5,
  review: 40,
  emotion_chat: 5,
} as const;

export type QuotaAction = keyof typeof QUOTA_COST_V1;
