/** 情绪树洞 — 90/00 后陪伴向 Mock + 配置 */

export type TreeholePersonaId = "comfort" | "clarify" | "reply" | "wake" | "lateNight";

export type TreeholePersona = {
  id: TreeholePersonaId;
  name: string;
  emoji: string;
  desc: string;
  gradient: string;
  sticker: string;
};

export type TreeholeMoodId = "tired" | "wronged" | "empty" | "happy" | "calm" | "emo";

export type TreeholeMood = {
  id: TreeholeMoodId;
  label: string;
  emoji: string;
  energy: { fatigue: number; healing: number; happiness: number };
};

export type TreeholeMomentsVariant = {
  id: "light" | "gentle" | "xhs";
  label: string;
  text: string;
};

export type TreeholeStatusTag = {
  label: string;
  value: string;
};

/** 首页 / 树洞入口 */
export const TREEHOLE_HOME_COPY = {
  title: "有些话，不想发朋友圈，就先说给我听。",
  subtitle: "AI陪你聊、帮你回、替你把情绪说漂亮。",
  cta: "开始树洞",
};

export const TREEHOLE_OPENING_LINES = [
  "今天是想被哄哄，还是想把事情说清楚？",
  "不用组织语言，乱七八糟地说也可以。",
  "这里不用懂事，也不用假装没事。",
  "你先说，我不打断你。",
  "今天谁又让你不开心啦？",
];

export const TREEHOLE_PROMPT_CHIPS = [
  "今天有点 emo",
  "感觉没人懂我",
  "突然不想回消息",
  "委屈但不知道怎么说",
];

export const TREEHOLE_QUICK_ACTIONS = [
  { id: "comfort_more", label: "再哄我两句", emoji: "🫶" },
  { id: "clarify", label: "帮我看清楚", emoji: "🧩" },
  { id: "reply_ta", label: "教我怎么回", emoji: "💬" },
  { id: "moments", label: "生成朋友圈", emoji: "🌸" },
  { id: "xhs", label: "生成小红书文案", emoji: "📕" },
  { id: "wake_line", label: "给我一句狠话", emoji: "⚡" },
  { id: "sign_card", label: "生成情绪卡片", emoji: "🎴" },
] as const;

export type TreeholeQuickActionId = (typeof TREEHOLE_QUICK_ACTIONS)[number]["id"];

export const TREEHOLE_HOT_SCENARIOS = [
  "喜欢的人不回消息",
  "朋友突然冷淡了",
  "上班被领导说了",
  "感觉自己很内耗",
  "明明很累还要装没事",
  "想发朋友圈但怕太明显",
  "不知道怎么回消息",
  "今天莫名其妙很 emo",
];

/** @deprecated 使用 useTreeholeOnlineLabel / TREEHOLE_ONLINE_BASE */
export const TREEHOLE_ENTRY_ONLINE_LABEL = "7236 人在线";

export const TREEHOLE_ENTRY_STATS = [
  { value: "7236", label: "人在线", accent: "emerald" as const },
  { value: "2.1w+", label: "今日倾诉", accent: "amber" as const },
  { value: "328", label: "正在聊", accent: "violet" as const },
] as const;

/** 创作页入口 · 左侧实时碎碎念气泡 */
export const TREEHOLE_ENTRY_LIVE_SNIPPETS = [
  { id: "1", avatar: "🌙", text: "今天好累，不想跟谁说", time: "刚刚" },
  { id: "2", avatar: "💬", text: "已读不回好内耗", time: "1 分钟前" },
  { id: "3", avatar: "🥺", text: "莫名 emo，想有人听", time: "2 分钟前" },
  { id: "4", avatar: "✨", text: "有人回了抱抱", time: "正在聊" },
  { id: "5", avatar: "💕", text: "暧昧消息不知怎么回", time: "3 分钟前" },
] as const;

/** 首页/创作页树洞入口 · 滚动话题标签 */
export const TREEHOLE_ENTRY_TOPIC_CHIPS = [
  { emoji: "💬", label: "已读不回" },
  { emoji: "🥺", label: "有点委屈" },
  { emoji: "😮‍💨", label: "莫名 emo" },
  { emoji: "💼", label: "被领导说了" },
  { emoji: "🌙", label: "失眠想聊聊" },
  { emoji: "✍️", label: "不知道怎么回" },
  { emoji: "🫧", label: "不想装没事" },
  { emoji: "💕", label: "暧昧怎么回" },
];

export const TREEHOLE_PERSONAS: TreeholePersona[] = [
  {
    id: "comfort",
    name: "哄哄我",
    emoji: "🫶",
    desc: "委屈难过 emo 时",
    gradient: "from-[#F9A8D4] to-[#C084FC]",
    sticker: "✨",
  },
  {
    id: "clarify",
    name: "帮我理理",
    emoji: "🧩",
    desc: "职场关系选择困难",
    gradient: "from-[#93C5FD] to-[#818CF8]",
    sticker: "🌙",
  },
  {
    id: "reply",
    name: "帮我回TA",
    emoji: "💬",
    desc: "暧昧聊天 / 怎么回",
    gradient: "from-[#F472B6] to-[#EC4899]",
    sticker: "💕",
  },
  {
    id: "wake",
    name: "轻轻骂醒",
    emoji: "⚡",
    desc: "轻微犀利不伤人",
    gradient: "from-[#FDBA74] to-[#FB7185]",
    sticker: "🐱",
  },
  {
    id: "lateNight",
    name: "深夜抱抱",
    emoji: "🌙",
    desc: "失眠孤独深夜 emo",
    gradient: "from-[#A78BFA] to-[#6366F1]",
    sticker: "🌟",
  },
];

export const TREEHOLE_MOODS: TreeholeMood[] = [
  { id: "tired", label: "电量不足", emoji: "😮‍💨", energy: { fatigue: 82, healing: 45, happiness: 35 } },
  { id: "wronged", label: "有点委屈", emoji: "🥺", energy: { fatigue: 70, healing: 55, happiness: 28 } },
  { id: "empty", label: "空空的", emoji: "🌫️", energy: { fatigue: 65, healing: 40, happiness: 25 } },
  { id: "emo", label: "莫名 emo", emoji: "🌧️", energy: { fatigue: 75, healing: 48, happiness: 30 } },
  { id: "happy", label: "还行叭", emoji: "🙂", energy: { fatigue: 35, healing: 72, happiness: 78 } },
  { id: "calm", label: "慢慢好了", emoji: "🍃", energy: { fatigue: 48, healing: 68, happiness: 58 } },
];

export const TREEHOLE_EMOTION_SIGNS = [
  "你不是矫情，你只是累了。今晚先放过自己。",
  "有些情绪不用解释，风会替你说。",
  "允许自己短暂掉线，也是一种自我保护。",
  "不必总是坚强，软下来也没关系。",
  "我在，你慢慢说，不用整理得很漂亮。",
];

export const TREEHOLE_MOMENTS_VARIANTS: TreeholeMomentsVariant[] = [
  {
    id: "light",
    label: "轻描淡写版",
    text: "有些情绪不用解释，风会替我说。",
  },
  {
    id: "gentle",
    label: "温柔释怀版",
    text: "慢慢来吧，今天也算认真生活过了。",
  },
  {
    id: "xhs",
    label: "小红书氛围版",
    text: "允许自己短暂掉线，也是一种自我保护。",
  },
];

export const TREEHOLE_STATUS_TAG_POOL: TreeholeStatusTag[] = [
  { label: "今日状态", value: "电量不足" },
  { label: "情绪天气", value: "小雨转多云" },
  { label: "内耗指数", value: "有点高" },
  { label: "需要抱抱", value: "是的" },
  { label: "适合操作", value: "先睡觉，明天再说" },
  { label: "社交电量", value: "想关机" },
  { label: "今日人设", value: "假装没事中" },
];

export const TREEHOLE_VIP_PERKS = [
  "无限树洞聊天",
  "解锁深夜抱抱模式",
  "解锁帮我回TA",
  "解锁朋友圈 / 小红书情绪文案",
  "解锁每周情绪报告",
];

export const TREEHOLE_QUOTA_COPY = {
  insufficient: "今天的陪聊能量快用完啦，要不要补一点灵感，我继续陪你聊？",
  cta: "补点灵感继续聊",
};

export const TREEHOLE_DEFAULT_ENERGY = {
  fatigue: 78,
  healing: 62,
  happiness: 48,
};

export const TREEHOLE_MOCK_CHAT_REPLIES: Record<TreeholePersonaId, string[]> = {
  comfort: [
    "懂你，这种感觉真的挺难受的。先别急着怪自己，我在呢。",
    "你不是矫情，你只是累了。乱七八糟地说也可以，我听着。",
  ],
  clarify: [
    "我帮你理一下：这件事里，让你最不舒服的其实是「被忽视」对吧？",
    "先别急着下结论。我们拆成两件事看，会清楚很多。",
  ],
  reply: [
    "我懂你想回得自然一点。你是想保持距离，还是轻轻推进一下？",
    "给你两个方向：一条偏暖，一条偏稳。你选更像你的那种。",
  ],
  wake: [
    "行，我轻轻说一句：你不是不行，你是撑太久了。今晚先别硬扛。",
    "别内耗了，这事放谁身上都会不舒服。先喝水，明天再想对策。",
  ],
  lateNight: [
    "夜深了，不用懂事。把今天最委屈的那一句，说给我听。",
    "我在。你不用把情绪整理得很漂亮，也值得被好好接住。",
  ],
};

export const TREEHOLE_MOCK_SOCIAL_COPY = {
  moments: TREEHOLE_MOMENTS_VARIANTS,
  wechat: "今晚，对自己温柔一点。",
  xhs: "情绪日记｜允许自己短暂掉线 🌙\n\n有些夜晚，只适合和自己对话。",
};

/** 随机抽 2～3 个状态小标签 */
export function pickTreeholeStatusTags(count = 3): TreeholeStatusTag[] {
  const shuffled = [...TREEHOLE_STATUS_TAG_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function randomTreeholeOpening(): string {
  return TREEHOLE_OPENING_LINES[Math.floor(Math.random() * TREEHOLE_OPENING_LINES.length)];
}

/** 旧 ID 兼容本地存储 */
export function normalizeTreeholePersonaId(id: string): TreeholePersonaId {
  const legacy: Record<string, TreeholePersonaId> = {
    gentle: "comfort",
    adult: "clarify",
    love: "reply",
    tsundere: "wake",
    radio: "lateNight",
  };
  if (id in legacy) return legacy[id];
  if (TREEHOLE_PERSONAS.some((p) => p.id === id)) return id as TreeholePersonaId;
  return "comfort";
}
