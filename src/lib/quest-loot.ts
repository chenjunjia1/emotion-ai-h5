/** 陪跑宝箱随机掉落（本地玩法层，增强「开箱惊喜」） */

export type LootTier = "normal" | "rare" | "legend";

export interface QuestLootItem {
  id: string;
  tier: LootTier;
  emoji: string;
  title: string;
  desc: string;
  /** sessionStorage key 副作用 */
  effect?: "ssr_buff" | "quota_3" | "gacha_hint";
}

const LOOT_POOL: QuestLootItem[] = [
  {
    id: "xp20",
    tier: "normal",
    emoji: "✨",
    title: "+20 陪跑成长值",
    desc: "今日认真运营，成长值到账～",
  },
  {
    id: "inspire",
    tier: "normal",
    emoji: "🧋",
    title: "灵感气泡饮",
    desc: "摸鱼 5 分钟，回来更好写。",
  },
  {
    id: "quota3",
    tier: "rare",
    emoji: "🎫",
    title: "+3 灵感",
    desc: "多抽几次盲盒也不怕啦！",
    effect: "quota_3",
  },
  {
    id: "ssr_buff",
    tier: "rare",
    emoji: "👑",
    title: "SSR 欧气符",
    desc: "下次开选题盲盒，稀有度 UP！",
    effect: "ssr_buff",
  },
  {
    id: "gacha",
    tier: "rare",
    emoji: "🎰",
    title: "扭蛋幸运星",
    desc: "去标题扭蛋机，更容易出爆款标题。",
    effect: "gacha_hint",
  },
  {
    id: "meme",
    tier: "normal",
    emoji: "😎",
    title: "运营人彩蛋",
    desc: "你今天发什么都能火（大概）。",
  },
  {
    id: "legend",
    tier: "legend",
    emoji: "💎",
    title: "传说陪跑礼包",
    desc: "成长值 +20 · 灵感 +3 · 今日欧气拉满！",
    effect: "quota_3",
  },
];

const STORAGE_LOOT = "emotion_daily_loot";
const STORAGE_SSR_BUFF = "emotion_ssr_buff_date";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function rollQuestLoot(streakDays: number): QuestLootItem {
  const roll = Math.random();
  const legendChance = Math.min(0.12, 0.04 + streakDays * 0.01);
  const rareChance = 0.35;

  if (roll < legendChance) {
    return LOOT_POOL.find((l) => l.id === "legend")!;
  }
  if (roll < legendChance + rareChance) {
    const rares = LOOT_POOL.filter((l) => l.tier === "rare");
    return rares[Math.floor(Math.random() * rares.length)];
  }
  const normals = LOOT_POOL.filter((l) => l.tier === "normal");
  return normals[Math.floor(Math.random() * normals.length)];
}

export function applyQuestLootEffect(item: QuestLootItem) {
  if (typeof window === "undefined") return;
  const day = todayKey();
  if (item.effect === "ssr_buff") {
    sessionStorage.setItem(STORAGE_SSR_BUFF, day);
  }
  localStorage.setItem(STORAGE_LOOT, JSON.stringify({ date: day, item }));
}

export function getSavedDailyLoot(): QuestLootItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_LOOT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date: string; item: QuestLootItem };
    if (parsed.date !== todayKey()) return null;
    return parsed.item;
  } catch {
    return null;
  }
}

export function hasSsrBuffToday(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_SSR_BUFF) === todayKey();
}

export const LOOT_TIER_STYLE: Record<
  LootTier,
  { ring: string; bg: string; label: string }
> = {
  normal: {
    ring: "ring-orange-100",
    bg: "from-[#FFF8F3] to-white",
    label: "惊喜掉落",
  },
  rare: {
    ring: "ring-violet-200",
    bg: "from-[#F5F0FF] to-[#FFF0F5]",
    label: "稀有掉落",
  },
  legend: {
    ring: "ring-amber-300",
    bg: "from-amber-50 via-[#FFF0F5] to-white",
    label: "传说掉落",
  },
};
