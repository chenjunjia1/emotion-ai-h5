/** 盲盒稀有度 + 连续打卡宝箱皮肤 */

export type DropRarity = "N" | "R" | "SR" | "SSR";

export interface ChestSkin {
  day: number;
  emoji: string;
  label: string;
  boxClass: string;
  ringClass: string;
  glowClass: string;
}

/** 连续陪跑天数 → 7 档宝箱皮肤（第 7 天及以上用满级） */
export const CHEST_SKINS: ChestSkin[] = [
  {
    day: 1,
    emoji: "🎁",
    label: "初心礼盒",
    boxClass: "from-[#FF6B6B] to-[#FF7AAE]",
    ringClass: "ring-white/70",
    glowClass: "shadow-[0_8px_20px_rgba(255,107,107,0.3)]",
  },
  {
    day: 2,
    emoji: "🌸",
    label: "奶油粉盒",
    boxClass: "from-[#FF8EC4] to-[#FFB8D9]",
    ringClass: "ring-pink-100",
    glowClass: "shadow-[0_8px_20px_rgba(255,142,196,0.35)]",
  },
  {
    day: 3,
    emoji: "🍑",
    label: "蜜桃礼盒",
    boxClass: "from-[#FF9A6B] to-[#FFC46B]",
    ringClass: "ring-amber-100",
    glowClass: "shadow-[0_8px_20px_rgba(255,196,107,0.35)]",
  },
  {
    day: 4,
    emoji: "✨",
    label: "灵感宝盒",
    boxClass: "from-[#C4B5FD] to-[#FF7AAE]",
    ringClass: "ring-violet-100",
    glowClass: "shadow-[0_8px_24px_rgba(196,181,253,0.4)]",
  },
  {
    day: 5,
    emoji: "🔥",
    label: "爆款秘盒",
    boxClass: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFD4A8]",
    ringClass: "ring-orange-100",
    glowClass: "shadow-[0_10px_26px_rgba(255,107,107,0.4)]",
  },
  {
    day: 6,
    emoji: "💎",
    label: "进阶晶盒",
    boxClass: "from-[#67E8F9] via-[#FF7AAE] to-[#FFC46B]",
    ringClass: "ring-cyan-100",
    glowClass: "shadow-[0_10px_28px_rgba(103,232,249,0.35)]",
  },
  {
    day: 7,
    emoji: "👑",
    label: "传说皇冠箱",
    boxClass: "from-[#FFD700] via-[#FF7AAE] to-[#FF6B6B]",
    ringClass: "ring-yellow-200",
    glowClass: "shadow-[0_12px_32px_rgba(255,215,0,0.45)] play-chest-legend",
  },
];

export function getChestSkin(streakDays: number): ChestSkin {
  const idx = Math.min(6, Math.max(0, (streakDays || 1) - 1));
  return CHEST_SKINS[idx];
}

/** 根据连续天数 + 欧气符微调 SSR 概率 */
export function rollTopicRarity(streakDays: number, ssrCharm = false): DropRarity {
  const bonus = Math.min(0.1, Math.max(0, streakDays) * 0.012) + (ssrCharm ? 0.08 : 0);
  const roll = Math.random();
  if (roll < 0.1 + bonus) return "SSR";
  if (roll < 0.28 + bonus * 0.5) return "SR";
  if (roll < 0.58) return "R";
  return "N";
}

export const RARITY_META: Record<
  DropRarity,
  { label: string; badgeClass: string; gradient: string; extra?: string; emoji: string }
> = {
  N: {
    label: "日常款",
    emoji: "📦",
    badgeClass: "bg-white/80 text-slate-600",
    gradient: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
  },
  R: {
    label: "R · 不错哦",
    emoji: "💫",
    badgeClass: "bg-sky-100 text-sky-700",
    gradient: "from-[#FF7AAE] via-[#FF9EC4] to-[#FFC46B]",
  },
  SR: {
    label: "SR · 很能打",
    emoji: "🌟",
    badgeClass: "bg-violet-100 text-violet-700",
    gradient: "from-[#C4B5FD] via-[#FF7AAE] to-[#FFC46B]",
  },
  SSR: {
    label: "SSR · 稀有选题",
    emoji: "👑",
    badgeClass:
      "bg-gradient-to-r from-amber-200 to-yellow-100 text-amber-800 ring-1 ring-amber-300",
    gradient: "from-[#FFD700] via-[#FF7AAE] to-[#FF6B6B]",
    extra: "play-ssr-shine",
  },
};
