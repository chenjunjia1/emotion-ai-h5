/**
 * 首页 / 灵感卡片 — 短视频封面风（小红书·抖音）
 * 真实生活场景 Unsplash 静态图，按内容类型匹配，避免风景占位、AI 头像、picsum
 */

export type ShortVideoCoverStyle =
  | "emotion"
  | "vlog"
  | "pet"
  | "food"
  | "fashion"
  | "life";

export type ShortVideoCoverPreset = {
  style: ShortVideoCoverStyle;
  /** 竖版封面比例 */
  image: string;
  /** 同风格备用图（主图加载失败时） */
  fallbacks: string[];
  /** 远程全失败时必显的本地分类封面 */
  localFallback?: string;
  filter: "warm" | "moody" | "sunset" | "pet" | "food" | "life";
  titleLines: string[];
};

const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=480&h=640&fit=crop&auto=format&q=85`;

/** 情绪共鸣：背影、夜景、咖啡、窗边 */
const EMOTION_COVERS: ShortVideoCoverPreset[] = [
  {
    style: "emotion",
    image: U("photo-1519682337054-a94d519337bc"),
    fallbacks: [U("photo-1516557179064-436f16ef9852"), U("photo-1495474472287-4d71bcff208a")],
    filter: "moody",
    titleLines: ["成年人的崩溃", "都是安静的"],
  },
  {
    style: "emotion",
    image: U("photo-1495474472287-4d71bcff208a"),
    fallbacks: [U("photo-1516557179064-436f16ef9852")],
    filter: "warm",
    titleLines: ["一个人喝咖啡的", "第100个夜晚"],
  },
  {
    style: "emotion",
    image: U("photo-1516557179064-436f16ef9852"),
    fallbacks: [U("photo-1519682337054-a94d519337bc")],
    filter: "moody",
    titleLines: ["下雨的窗边", "突然很想说话"],
  },
];

/** 下班 vlog：地铁、晚霞、工位、路上 */
const VLOG_COVERS: ShortVideoCoverPreset[] = [
  {
    style: "vlog",
    image: U("photo-1544629929-0736f52221f8"),
    fallbacks: [U("photo-1475274112273-480ab176faf9")],
    filter: "sunset",
    titleLines: ["下班后的1小时", "才是真正属于自己的"],
  },
  {
    style: "vlog",
    image: U("photo-1475274112273-480ab176faf9"),
    fallbacks: [U("photo-1497215842964-222b430dc094")],
    filter: "sunset",
    titleLines: ["晚霞路上的", "打工人独白"],
  },
  {
    style: "vlog",
    image: U("photo-1497215842964-222b430dc094"),
    fallbacks: [U("photo-1544629929-0736f52221f8")],
    filter: "life",
    titleLines: ["关掉电脑那一刻", "世界终于安静了"],
  },
];

/** 宠物治愈 */
const PET_COVERS: ShortVideoCoverPreset[] = [
  {
    style: "pet",
    image: U("photo-1514881248723-9ea5b7e6658f"),
    fallbacks: [U("photo-1587300003388-59208fb96281")],
    filter: "pet",
    titleLines: ["猫咪真的能", "治愈情绪"],
  },
  {
    style: "pet",
    image: U("photo-1587300003388-59208fb96281"),
    fallbacks: [U("photo-1583511655826-05700d62f9bb")],
    filter: "pet",
    titleLines: ["狗狗歪头杀", "今天也被萌到"],
  },
  {
    style: "pet",
    image: U("photo-1583511655826-05700d62f9bb"),
    fallbacks: [U("photo-1514881248723-9ea5b7e6658f")],
    filter: "warm",
    titleLines: ["回家第一眼", "它在门口等我"],
  },
];

/** 美食 / 探店 */
const FOOD_COVERS: ShortVideoCoverPreset[] = [
  {
    style: "food",
    image: U("photo-1555939594-58d7cb561ad1"),
    fallbacks: [U("photo-1565299624946-b28f40a0ca4b")],
    filter: "food",
    titleLines: ["一人食火锅", "也是治愈时刻"],
  },
  {
    style: "food",
    image: U("photo-1565299624946-b28f40a0ca4b"),
    fallbacks: [U("photo-1559339352-11d035aa65de")],
    filter: "food",
    titleLines: ["这家烤肉", "本地人偷偷来"],
  },
  {
    style: "food",
    image: U("photo-1559339352-11d035aa65de"),
    fallbacks: [U("photo-1555939594-58d7cb561ad1")],
    filter: "warm",
    titleLines: ["周末甜品局", "拍照就出片"],
  },
];

/** 穿搭 */
const FASHION_COVERS: ShortVideoCoverPreset[] = [
  {
    style: "fashion",
    image: U("photo-1483985988350-763728e066fa"),
    fallbacks: [U("photo-1469334031218-e382a71b716b")],
    filter: "warm",
    titleLines: ["百元穿搭", "也能很出片"],
  },
];

/** 生活日常 */
const LIFE_COVERS: ShortVideoCoverPreset[] = [
  {
    style: "life",
    image: U("photo-1497215842964-222b430dc094"),
    fallbacks: [U("photo-1495474472287-4d71bcff208a")],
    filter: "life",
    titleLines: ["独处日常", "也可以很高级"],
  },
];

const ALL_PRESETS = [
  ...EMOTION_COVERS,
  ...VLOG_COVERS,
  ...PET_COVERS,
  ...FOOD_COVERS,
  ...FASHION_COVERS,
  ...LIFE_COVERS,
];

const STYLE_POOL: Record<ShortVideoCoverStyle, ShortVideoCoverPreset[]> = {
  emotion: EMOTION_COVERS,
  vlog: VLOG_COVERS,
  pet: PET_COVERS,
  food: FOOD_COVERS,
  fashion: FASHION_COVERS,
  life: LIFE_COVERS,
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function inferCoverStyle(
  topic: string,
  accountType = "",
  label = ""
): ShortVideoCoverStyle {
  const hay = `${topic}${accountType}${label}`;
  if (/宠物|猫|狗|萌宠/i.test(hay)) return "pet";
  if (/美食|探店|火锅|烤肉|甜品|餐饮|咖啡/i.test(hay)) return "food";
  if (/穿搭|OOTD|时尚/i.test(hay)) return "fashion";
  if (/下班|vlog|打工|工位|地铁|治愈时刻/i.test(hay)) return "vlog";
  if (/情感|共鸣|情绪|恋爱|孤独/i.test(hay)) return "emotion";
  if (/职场|打工|办公|干货/i.test(hay)) return "vlog";
  if (/朋友圈|种草|好物/i.test(hay)) return "life";
  return "life";
}

/** 按内容类型取封面预设（稳定 hash，同 id 同图） */
export function getShortVideoCoverPreset(
  seed: string,
  style?: ShortVideoCoverStyle,
  customTitleLines?: string[]
): ShortVideoCoverPreset {
  const resolvedStyle = style ?? inferCoverStyle(seed);
  const pool = STYLE_POOL[resolvedStyle] ?? LIFE_COVERS;
  const preset = pool[hashStr(seed) % pool.length]!;
  if (!customTitleLines?.length) return { ...preset, titleLines: [] };
  return { ...preset, titleLines: customTitleLines };
}

/** 仅图片 URL（兼容旧 coverImage 字段） */
export function shortVideoCoverImageUrl(
  seed: string,
  style?: ShortVideoCoverStyle
): string {
  return getShortVideoCoverPreset(seed, style).image;
}
