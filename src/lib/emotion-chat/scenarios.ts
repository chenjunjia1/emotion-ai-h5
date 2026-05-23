/** 高情商场景库 · 按日洗牌展示 */
export const EMOTION_SCENARIO_POOL = [
  "他回「嗯嗯」我该怎么接？",
  "对方突然已读不回 2 小时了",
  "他说「最近有点累」是不是在疏远我",
  "想约见面又怕太主动",
  "她发「哈哈」是不是敷衍",
  "吵架后他发来「算了」",
  "异地他说「随便你」怎么回",
  "暧昧对象问「你在干嘛」",
  "前任点赞我朋友圈要不要聊",
  "他说「我们不合适吧」",
  "想表白但怕朋友做不成",
  "她回「哦」我是不是说错了",
  "节日他只发了红包没说话",
  "他说「你很好」是好人卡吗",
  "冷战第三天谁先开口",
  "他说「我需要空间」",
  "相亲对象问「你对婚姻怎么看」",
  "他说「我妈不同意」",
  "想挽回但对方说「别联系了」",
  "她发长语音我不想听怎么体面回",
] as const;

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function shuffleSeeded<T>(arr: T[], seedKey: string): T[] {
  const out = [...arr];
  let seed = hashSeed(seedKey);
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getDailyEmotionScenarios(dateKey: string, batch = 0, take = 12): string[] {
  return shuffleSeeded([...EMOTION_SCENARIO_POOL], `${dateKey}-emo-${batch}`).slice(0, take);
}

export const RELATIONSHIP_MOOD: Record<string, { emoji: string; hint: string }> = {
  暧昧中: { emoji: "💕", hint: "轻撩不越界，留悬念让对方想接话" },
  热恋期: { emoji: "🔥", hint: "甜度够，也要偶尔制造小惊喜" },
  冷淡期: { emoji: "🧊", hint: "少解释多共情，别连环追问" },
  异地恋: { emoji: "✈️", hint: "具体关心 + 未来小期待，比空想你更有用" },
  "朋友以上": { emoji: "🤝", hint: "试探心意用玩笑包裹，给退路" },
  分手恢复期: { emoji: "🌙", hint: "体面克制，别翻旧账" },
  稳定长期: { emoji: "🏠", hint: "日常陪伴感比轰轰烈烈更重要" },
};
