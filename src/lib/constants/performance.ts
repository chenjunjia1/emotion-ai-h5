/** 用户侧目标：生成结果在 1–2s 内可见 */
export const FAST_GENERATE_MS = Number(process.env.FAST_GENERATE_MS || 2000);

export const AI_GENERATE_BUDGET = {
  publish_pack: { maxTokens: 1400, timeoutMs: FAST_GENERATE_MS },
  topic_box: { maxTokens: 600, timeoutMs: Math.min(FAST_GENERATE_MS, 1800) },
  title_gacha: { maxTokens: 700, timeoutMs: FAST_GENERATE_MS },
  viral: { maxTokens: 1100, timeoutMs: FAST_GENERATE_MS },
  daily: { maxTokens: 1200, timeoutMs: FAST_GENERATE_MS + 400 },
  account: { maxTokens: 1600, timeoutMs: FAST_GENERATE_MS + 800 },
  emotion_chat: { maxTokens: 1000, timeoutMs: FAST_GENERATE_MS },
  review: { maxTokens: 900, timeoutMs: FAST_GENERATE_MS },
  reply: { maxTokens: 700, timeoutMs: FAST_GENERATE_MS },
  score: { maxTokens: 800, timeoutMs: FAST_GENERATE_MS },
  account_test: { maxTokens: 1200, timeoutMs: FAST_GENERATE_MS + 400 },
} as const;
