import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { isCreatorFriendly, parseHeatScore } from "@/lib/hot-topics/filters";

type ScoreInput = {
  heatScore: number;
  category: string;
  title: string;
  platform: string;
  contentValueScore?: number;
};

/** viral_score = 热度 + 创作门槛 + 共鸣 + 平台适配，控制在 60-95 */
export function computeViralScore(input: ScoreInput): number {
  let score = 60;

  if (input.heatScore >= 500_000) score += 30;
  else if (input.heatScore >= 100_000) score += 22;
  else if (input.heatScore >= 30_000) score += 15;
  else score += 8;

  if (isCreatorFriendly(input.title)) score += 25;
  else score += 10;

  const commentFriendly = /情感|职场|生活|宠物|美食|学生|宝妈|穿搭|探店|AI|副业|治愈|成长|反差|vlog/i.test(
    `${input.title}${input.category}`
  );
  if (commentFriendly) score += 20;

  if (["douyin", "xiaohongshu_inspiration", "weibo"].includes(input.platform)) score += 15;
  else score += 8;

  if (input.category && input.category !== "生活") score += 10;

  if (input.contentValueScore != null && input.contentValueScore >= 75) score += 5;

  return Math.min(95, Math.max(60, Math.round(score)));
}

export function viralScoreFromRaw(raw: RawHotFromApi, category: string): number {
  return computeViralScore({
    heatScore: parseHeatScore(raw.hot),
    category,
    title: raw.title,
    platform: raw.platform,
  });
}
