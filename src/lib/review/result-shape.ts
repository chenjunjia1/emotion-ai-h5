export type ReviewMetricScore = {
  score: number;
  label: "好" | "一般" | "偏低";
};

export function scoreToLabel(score: number): ReviewMetricScore["label"] {
  if (score >= 80) return "好";
  if (score >= 65) return "一般";
  return "偏低";
}

export function labelClass(label: ReviewMetricScore["label"]): string {
  if (label === "好") return "bg-emerald-50 text-emerald-600";
  if (label === "一般") return "bg-amber-50 text-amber-600";
  return "bg-rose-50 text-rose-600";
}

/** 复盘结果示例（未生成时展示） */
export const REVIEW_DEMO_RESULT: Record<string, unknown> = {
  performanceScore: 82,
  titleScore: 84,
  pacingScore: 76,
  interactionScore: 68,
  titleScoreLabel: "好",
  pacingScoreLabel: "一般",
  interactionScoreLabel: "偏低",
  advantages: "选题有共鸣，节奏整体顺畅，结尾互动设计不错。",
  coreProblems: "前3秒钩子偏弱，标题吸引力一般，完播率有提升空间。",
  summary:
    "这条内容基础盘不错，情感向选题容易获得点赞，但开头停留和完播还有优化余地。",
  problems: ["前3秒加具体场景或数字", "标题改为痛点+反差结构", "结尾提问降低评论门槛"],
  nextSuggestion: "下一条沿用同系列选题，强化开头钩子，发布时间建议 19:00–21:00。",
  nextTopic: "下班后的治愈时刻 · 续集",
  engagementRate: 7.2,
  hookAdvice: "开头用「你是不是也…」句式，3秒内抛出共鸣场景。",
  publishTimeAdvice: "工作日 19:30 发布，晚高峰更容易获得初始流量。",
  titleAdvice: "标题加入具体数字或反差词，提升点击率。",
};

export function normalizeReviewResult(raw: Record<string, unknown>): Record<string, unknown> {
  const titleScore = Number(raw.titleScore ?? 78);
  const pacingScore = Number(raw.pacingScore ?? 75);
  const interactionScore = Number(raw.interactionScore ?? 70);

  return {
    ...raw,
    titleScore,
    pacingScore,
    interactionScore,
    titleScoreLabel: raw.titleScoreLabel ?? scoreToLabel(titleScore),
    pacingScoreLabel: raw.pacingScoreLabel ?? scoreToLabel(pacingScore),
    interactionScoreLabel: raw.interactionScoreLabel ?? scoreToLabel(interactionScore),
    advantages: raw.advantages ?? raw.summary ?? "",
    coreProblems:
      raw.coreProblems ??
      ((raw.problems as string[])?.[0] ?? "前3秒钩子与标题吸引力仍可加强。"),
  };
}
