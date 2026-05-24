import { sortByHeat, type HeatLevel } from "@/lib/content/heat-level";

export type EmotionScenario = {
  text: string;
  heat: HeatLevel;
  /** 点选场景时自动带入，降低操作成本 */
  suggestRelationship?: string;
  suggestGoal?: string;
  suggestStyle?: string;
};

/** 高情商场景库 · 按日洗牌，爆/高/中标注 + 一键带入情境 */
export const EMOTION_SCENARIO_SEEDS: EmotionScenario[] = [
  {
    text: "他说「我们不合适吧」",
    heat: "爆",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "理性沟通",
  },
  {
    text: "暧昧对象问「你在干嘛」",
    heat: "爆",
    suggestRelationship: "暧昧中",
    suggestGoal: "增进好感",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "他说「你很好」是好人卡吗",
    heat: "爆",
    suggestRelationship: "朋友以上",
    suggestGoal: "试探心意",
    suggestStyle: "幽默化解",
  },
  {
    text: "想约见面又怕太主动",
    heat: "高",
    suggestRelationship: "暧昧中",
    suggestGoal: "体面邀约",
    suggestStyle: "俏皮调侃",
  },
  {
    text: "他回「嗯嗯」我该怎么接？",
    heat: "高",
    suggestRelationship: "暧昧中",
    suggestGoal: "延续话题",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "对方突然已读不回 2 小时了",
    heat: "高",
    suggestRelationship: "冷淡期",
    suggestGoal: "挽回冷淡",
    suggestStyle: "高冷克制",
  },
  {
    text: "她说「哈哈」是不是敷衍",
    heat: "高",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "幽默化解",
  },
  {
    text: "吵架后他发来「算了」",
    heat: "高",
    suggestRelationship: "冷淡期",
    suggestGoal: "化解误会",
    suggestStyle: "理性沟通",
  },
  {
    text: "他说「最近有点累」是不是在疏远我",
    heat: "高",
    suggestRelationship: "稳定长期",
    suggestGoal: "增进好感",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "异地他说「随便你」怎么回",
    heat: "高",
    suggestRelationship: "异地恋",
    suggestGoal: "化解误会",
    suggestStyle: "理性沟通",
  },
  {
    text: "前任点赞我朋友圈要不要聊",
    heat: "中",
    suggestRelationship: "分手恢复期",
    suggestGoal: "建立边界",
    suggestStyle: "高冷克制",
  },
  {
    text: "想表白但怕朋友做不成",
    heat: "中",
    suggestRelationship: "朋友以上",
    suggestGoal: "试探心意",
    suggestStyle: "俏皮调侃",
  },
  {
    text: "她回「哦」我是不是说错了",
    heat: "中",
    suggestRelationship: "暧昧中",
    suggestGoal: "化解误会",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "节日他只发了红包没说话",
    heat: "中",
    suggestRelationship: "稳定长期",
    suggestGoal: "增进好感",
    suggestStyle: "幽默化解",
  },
  {
    text: "冷战第三天谁先开口",
    heat: "中",
    suggestRelationship: "冷淡期",
    suggestGoal: "挽回冷淡",
    suggestStyle: "理性沟通",
  },
  {
    text: "他说「我需要空间」",
    heat: "中",
    suggestRelationship: "冷淡期",
    suggestGoal: "建立边界",
    suggestStyle: "理性沟通",
  },
  {
    text: "相亲对象问「你对婚姻怎么看」",
    heat: "中",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "理性沟通",
  },
  {
    text: "他说「我妈不同意」",
    heat: "中",
    suggestRelationship: "稳定长期",
    suggestGoal: "化解误会",
    suggestStyle: "理性沟通",
  },
  {
    text: "想挽回但对方说「别联系了」",
    heat: "爆",
    suggestRelationship: "分手恢复期",
    suggestGoal: "挽回冷淡",
    suggestStyle: "理性沟通",
  },
  {
    text: "她发长语音我不想听怎么体面回",
    heat: "中",
    suggestRelationship: "稳定长期",
    suggestGoal: "建立边界",
    suggestStyle: "幽默化解",
  },
  {
    text: "她问「你到底喜不喜欢我」",
    heat: "爆",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "男生说「做朋友也挺好」",
    heat: "爆",
    suggestRelationship: "朋友以上",
    suggestGoal: "试探心意",
    suggestStyle: "幽默化解",
  },
  {
    text: "深夜发「睡了吗」该怎么接",
    heat: "爆",
    suggestRelationship: "暧昧中",
    suggestGoal: "增进好感",
    suggestStyle: "俏皮调侃",
  },
  {
    text: "约会后他只说「到家说一声」",
    heat: "高",
    suggestRelationship: "暧昧中",
    suggestGoal: "增进好感",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "被说「你太敏感了」",
    heat: "高",
    suggestRelationship: "冷淡期",
    suggestGoal: "化解误会",
    suggestStyle: "理性沟通",
  },
  {
    text: "他说「我妈想见你」我慌了",
    heat: "高",
    suggestRelationship: "稳定长期",
    suggestGoal: "试探心意",
    suggestStyle: "理性沟通",
  },
  {
    text: "朋友圈发合照他迟迟不点赞",
    heat: "高",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "高冷克制",
  },
  {
    text: "他说「你值得更好的」",
    heat: "高",
    suggestRelationship: "分手恢复期",
    suggestGoal: "挽回冷淡",
    suggestStyle: "理性沟通",
  },
  {
    text: "同事表白不想伤和气",
    heat: "中",
    suggestRelationship: "朋友以上",
    suggestGoal: "建立边界",
    suggestStyle: "理性沟通",
  },
  {
    text: "他说「等我忙完这阵」",
    heat: "中",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "幽默化解",
  },
  {
    text: "她发「随便」是不是生气了",
    heat: "中",
    suggestRelationship: "稳定长期",
    suggestGoal: "化解误会",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "他说「我们不合适但还想联系」",
    heat: "中",
    suggestRelationship: "分手恢复期",
    suggestGoal: "建立边界",
    suggestStyle: "理性沟通",
  },
  {
    text: "相亲对象说「你条件挺好的」",
    heat: "中",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "幽默化解",
  },
  {
    text: "他发「在吗」两个字怎么接",
    heat: "中",
    suggestRelationship: "暧昧中",
    suggestGoal: "延续话题",
    suggestStyle: "俏皮调侃",
  },
  {
    text: "她说「你不懂我」",
    heat: "高",
    suggestRelationship: "冷淡期",
    suggestGoal: "化解误会",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "想发「想你了」又怕太主动",
    heat: "高",
    suggestRelationship: "异地恋",
    suggestGoal: "增进好感",
    suggestStyle: "甜宠体贴",
  },
  {
    text: "他回「哈哈好的」是不是在敷衍",
    heat: "中",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "幽默化解",
  },
  {
    text: "吵架他说「你开心就好」",
    heat: "爆",
    suggestRelationship: "冷淡期",
    suggestGoal: "化解误会",
    suggestStyle: "理性沟通",
  },
  {
    text: "她问「我们算什么关系」",
    heat: "爆",
    suggestRelationship: "暧昧中",
    suggestGoal: "试探心意",
    suggestStyle: "理性沟通",
  },
];

export const EMOTION_SCENARIO_POOL_SIZE = EMOTION_SCENARIO_SEEDS.length;
/** 每日展示条数（与每日热点一致） */
export const EMOTION_SCENARIO_DAILY_TAKE = 30;

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

export function getDailyEmotionScenarios(
  dateKey: string,
  batch = 0,
  take = EMOTION_SCENARIO_DAILY_TAKE
): EmotionScenario[] {
  const shuffled = shuffleSeeded([...EMOTION_SCENARIO_SEEDS], `${dateKey}-emo-b${batch}`);
  return sortByHeat(shuffled.slice(0, Math.min(take, EMOTION_SCENARIO_SEEDS.length)));
}

export function getEmotionScenariosMeta(dateKey: string, count: number) {
  return {
    date: dateKey,
    total: count,
    updatedAt: `${dateKey} 08:00`,
    note: "基于真实社交情境整理，按爆→高→中排序；换一批可查看不同场景",
  };
}

/** @deprecated 使用 getDailyEmotionScenarios */
export function getDailyEmotionScenarioTexts(dateKey: string, batch = 0, take = 12): string[] {
  return getDailyEmotionScenarios(dateKey, batch, take).map((s) => s.text);
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

export function heartbeatFunLabel(value: number): { emoji: string; text: string } {
  if (value >= 85) return { emoji: "💥", text: "心动爆表" };
  if (value >= 70) return { emoji: "😍", text: "有戏哦" };
  if (value >= 55) return { emoji: "🫣", text: "观望中" };
  if (value >= 40) return { emoji: "🧊", text: "需升温" };
  return { emoji: "💤", text: "先别硬聊" };
}

export const EMOTION_LOADING_LINES = [
  "正在读潜台词…",
  "分析 TA 的小情绪…",
  "调配高情商语气…",
  "心动指数计算中…",
] as const;
