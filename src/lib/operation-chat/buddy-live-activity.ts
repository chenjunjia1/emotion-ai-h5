/** AI 助手页 — 最近动态（社交感，非实时接口） */

export type BuddyLiveActivity = {
  id: string;
  avatar: string;
  avatarBg: string;
  name: string;
  tag?: string;
  action: string;
  highlight?: string;
  minutesAgo: number;
};

export const BUDDY_LIVE_ACTIVITIES: BuddyLiveActivity[] = [
  {
    id: "a1",
    avatar: "🧋",
    avatarBg: "from-[#FFE8F0] to-[#FFF0F5]",
    name: "小木子",
    tag: "美食号",
    action: "问了",
    highlight: "今天拍啥能火",
    minutesAgo: 3,
  },
  {
    id: "a2",
    avatar: "📷",
    avatarBg: "from-[#E8F4FF] to-[#F0F7FF]",
    name: "阿杰",
    action: "用了",
    highlight: "30 秒口播",
    minutesAgo: 6,
  },
  {
    id: "a3",
    avatar: "✨",
    avatarBg: "from-[#FFF3E8] to-[#FFFBF5]",
    name: "奶茶七分甜",
    tag: "小红书",
    action: "复制了",
    highlight: "5 条标题",
    minutesAgo: 9,
  },
  {
    id: "a4",
    avatar: "🌿",
    avatarBg: "from-[#ECFDF5] to-[#F0FDF4]",
    name: "七七",
    tag: "治愈向",
    action: "问了",
    highlight: "朋友圈文案怎么写",
    minutesAgo: 14,
  },
  {
    id: "a5",
    avatar: "🎬",
    avatarBg: "from-[#F3EEFF] to-[#FAF5FF]",
    name: "大鱼",
    action: "拿到了",
    highlight: "7 天起号表",
    minutesAgo: 18,
  },
  {
    id: "a6",
    avatar: "☕",
    avatarBg: "from-[#FFF7ED] to-[#FFFBEB]",
    name: "陈皮",
    tag: "咖啡探店",
    action: "问了",
    highlight: "标题怎么起才不像营销",
    minutesAgo: 22,
  },
  {
    id: "a7",
    avatar: "🐱",
    avatarBg: "from-[#FFF0F5] to-[#FFE8F0]",
    name: "Mia",
    tag: "宠物号",
    action: "用了",
    highlight: "今天拍啥能火",
    minutesAgo: 27,
  },
  {
    id: "a8",
    avatar: "👔",
    avatarBg: "from-[#F3F4F6] to-[#F9FAFB]",
    name: "打工人小刘",
    action: "问了",
    highlight: "播放量一直低怎么办",
    minutesAgo: 31,
  },
  {
    id: "a9",
    avatar: "🍜",
    avatarBg: "from-[#FFF4E8] to-[#FFFAF0]",
    name: "探店阿花",
    action: "复制了",
    highlight: "3 条选题去发抖音",
    minutesAgo: 38,
  },
  {
    id: "a10",
    avatar: "🌸",
    avatarBg: "from-[#FDF2F8] to-[#FFF5FA]",
    name: "周末出逃",
    action: "从助手跳去",
    highlight: "生成发布包",
    minutesAgo: 45,
  },
  {
    id: "a11",
    avatar: "📕",
    avatarBg: "from-[#FFE8EC] to-[#FFF5F7]",
    name: "阿白",
    tag: "新手",
    action: "问了",
    highlight: "零基础小红书第一天发啥",
    minutesAgo: 52,
  },
  {
    id: "a12",
    avatar: "🔥",
    avatarBg: "from-[#FFF0F5] to-[#FFE8F0]",
    name: "晚风",
    action: "用了",
    highlight: "播放太低咋办",
    minutesAgo: 61,
  },
];

function hashDaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 按天打乱顺序，同一天内各用户看到相同序列 */
export function getShuffledBuddyActivities(): BuddyLiveActivity[] {
  const rand = mulberry32(hashDaySeed());
  const list = [...BUDDY_LIVE_ACTIVITIES];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}

/** 今日使用人数感：当日 0 点起从 7500 基准，每 5 分钟 +1 */
export const BUDDY_USAGE_BASE = 7500;
export const BUDDY_USAGE_TICK_MS = 5 * 60 * 1000;

export function getBuddyTodayUsageCount(now = Date.now()): number {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const elapsed = now - dayStart.getTime();
  const ticks = Math.floor(elapsed / BUDDY_USAGE_TICK_MS);
  return BUDDY_USAGE_BASE + ticks;
}

export function msUntilNextBuddyUsageTick(now = Date.now()): number {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const elapsed = now - dayStart.getTime();
  const remainder = elapsed % BUDDY_USAGE_TICK_MS;
  return remainder === 0 ? BUDDY_USAGE_TICK_MS : BUDDY_USAGE_TICK_MS - remainder;
}

/** @deprecated 使用 getBuddyTodayUsageCount */
export function getBuddyTodayUsageHint(now = Date.now()): number {
  return getBuddyTodayUsageCount(now);
}

export function formatActivityTimeAgo(minutesAgo: number, jitter = 0): string {
  const m = Math.max(1, minutesAgo + jitter);
  if (m <= 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  return h === 1 ? "1 小时前" : `${h} 小时前`;
}

export function formatActivityLine(item: BuddyLiveActivity, jitter = 0): string {
  const time = formatActivityTimeAgo(item.minutesAgo, jitter);
  const who = item.tag ? `${item.name}（${item.tag}）` : item.name;
  const detail = item.highlight ? `「${item.highlight}」` : "";
  return `${who} · ${time} · ${item.action}${detail}`;
}
