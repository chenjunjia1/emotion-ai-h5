/** 分类 → 本地封面（零网络、永不失败） */
export const LOCAL_COVER_BY_CATEGORY: Record<string, string> = {
  情感: "/images/hot/emotion.svg",
  职场: "/images/hot/work.svg",
  生活: "/images/hot/life.svg",
  宠物: "/images/hot/pet.svg",
  美食: "/images/hot/food.svg",
  学生: "/images/hot/student.svg",
  宝妈: "/images/hot/mom.svg",
  穿搭: "/images/hot/fashion.svg",
  探店: "/images/hot/shop.svg",
  "AI工具": "/images/hot/ai.svg",
  副业: "/images/hot/sidejob.svg",
  治愈: "/images/hot/healing.svg",
  成长: "/images/hot/life.svg",
};

export const DEFAULT_LOCAL_COVER = "/images/hot/default.svg";

export function resolveLocalHotCover(
  item: { track?: string; title?: string; category?: string; accountType?: string; topic?: string }
): string {
  const category = item.category ?? item.track ?? item.accountType?.replace(/\u53f7$/, "") ?? "";
  if (category && LOCAL_COVER_BY_CATEGORY[category]) {
    return LOCAL_COVER_BY_CATEGORY[category];
  }
  const title = item.title ?? item.topic ?? "";
  if (/宠物|猫|狗|萌宠/i.test(title)) return LOCAL_COVER_BY_CATEGORY["宠物"];
  if (/穿搭|OOTD|时尚/i.test(title)) return LOCAL_COVER_BY_CATEGORY["穿搭"];
  if (/美食|探店|餐饮/i.test(title)) return LOCAL_COVER_BY_CATEGORY["美食"];
  if (/职场|打工|上班/i.test(title)) return LOCAL_COVER_BY_CATEGORY["职场"];
  if (/情感|共鸣|恋爱/i.test(title)) return LOCAL_COVER_BY_CATEGORY["情感"];
  if (/治愈|下班|vlog/i.test(title)) return LOCAL_COVER_BY_CATEGORY["治愈"];
  if (/AI|工具/i.test(title)) return LOCAL_COVER_BY_CATEGORY["AI工具"];
  return DEFAULT_LOCAL_COVER;
}

/** 90/00 后审美 — 灵感快选卡片渐变 + emoji */
export const AESTHETIC_PRESETS: Record<
  string,
  { grad: string; emoji: string; accent: string }
> = {
  情感: { grad: "from-[#FFB8D0] via-[#FFD6EC] to-[#FF9EC4]", emoji: "💗", accent: "#FF5C8A" },
  治愈: { grad: "from-[#FFD4A8] via-[#FFE8D0] to-[#FFBC8A]", emoji: "🌅", accent: "#FF9A4D" },
  宠物: { grad: "from-[#FFC896] via-[#FFE0C8] to-[#FFB86C]", emoji: "🐱", accent: "#FF8C42" },
  穿搭: { grad: "from-[#E8B4FF] via-[#FFD6F5] to-[#FF9EC4]", emoji: "✨", accent: "#C084FC" },
  美食: { grad: "from-[#FFB4A2] via-[#FFD4C8] to-[#FF8A7A]", emoji: "🍜", accent: "#FF6B6B" },
  职场: { grad: "from-[#A8D4FF] via-[#D6E8FF] to-[#9EC4FF]", emoji: "💼", accent: "#5B8DEF" },
  生活: { grad: "from-[#B8E8D0] via-[#D6F5E8] to-[#9ED4BC]", emoji: "🌿", accent: "#52C997" },
  探店: { grad: "from-[#FFD0A8] via-[#FFE8D0] to-[#FFBC7A]", emoji: "📍", accent: "#FF9A4D" },
  默认: { grad: "from-[#FFB8D0] via-[#FFF0F5] to-[#FF9A4D]", emoji: "🔥", accent: "#FF4F8B" },
};

export function aestheticForCategory(category: string, title = "") {
  for (const [key, preset] of Object.entries(AESTHETIC_PRESETS)) {
    if (key !== "默认" && (category.includes(key) || title.includes(key))) return preset;
  }
  if (/宠物|猫/i.test(title)) return AESTHETIC_PRESETS["宠物"];
  if (/穿搭/i.test(title)) return AESTHETIC_PRESETS["穿搭"];
  if (/下班|治愈/i.test(title)) return AESTHETIC_PRESETS["治愈"];
  if (/共鸣|情感/i.test(title)) return AESTHETIC_PRESETS["情感"];
  return AESTHETIC_PRESETS["默认"];
}
