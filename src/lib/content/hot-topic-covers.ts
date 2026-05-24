import type { HotTopicItem } from "@/lib/hot-topics/types";

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=240&h=240&fit=crop&auto=format&q=80`;

/** 赛道 → 封面图（Unsplash 静态图，无需 API Key） */
const COVER_BY_TRACK: Record<string, string> = {
  职场成长: UNSPLASH("photo-1521737711867-e3b97375f902"),
  个人IP: UNSPLASH("photo-1524504388940-b1c1722653e1"),
  本地生活: UNSPLASH("photo-1414235077426-338989a2e8af"),
  宠物博主: UNSPLASH("photo-1450778868670-d18ac7860784"),
  小红书运营: UNSPLASH("photo-1611162617213-7d7a39e9b1b7"),
  婚恋情感: UNSPLASH("photo-1518199266791-5375a83190b7"),
  母婴育儿: UNSPLASH("photo-1515488042361-ee00e8170dc8"),
  美妆护肤: UNSPLASH("photo-1596462502278-27bfdc403348"),
  电商带货: UNSPLASH("photo-1472851294608-062e8318a82b"),
  健身减脂: UNSPLASH("photo-1571019613454-1cb2f99b2d8b"),
  生活干货: UNSPLASH("photo-1499750310107-5fef28a66643"),
};

/** 标题关键词 → 更贴题的封面 */
const COVER_BY_KEYWORD: [RegExp, string][] = [
  [/穿搭|多巴胺|时尚|OOTD/i, UNSPLASH("photo-1483985988350-763728e066fa")],
  [/美食|饮品|探店|餐饮|咖啡|茶饮/i, UNSPLASH("photo-1504674900247-0877df9cc836")],
  [/AI|脚本|工具|运营/i, UNSPLASH("photo-1677442136019-21780ecad995")],
  [/宠物|养宠|萌宠/i, UNSPLASH("photo-1583511655857-d19b40a07a18")],
  [/健身|减脂|运动/i, UNSPLASH("photo-1571019613454-1cb2f99b2d8b")],
  [/母婴|育儿|宝宝/i, UNSPLASH("photo-1515488042361-ee00e8170dc8")],
  [/情感|恋爱|婚恋/i, UNSPLASH("photo-1518199266791-5375a83190b7")],
  [/职场|打工人|上班/i, UNSPLASH("photo-1521737711867-e3b97375f902")],
  [/带货|电商|直播/i, UNSPLASH("photo-1556742049-0cfed4f6a45d")],
  [/美妆|护肤|化妆/i, UNSPLASH("photo-1596462502278-27bfdc403348")],
  [/vlog|日常|生活/i, UNSPLASH("photo-1499750310107-5fef28a66643")],
];

const DEFAULT_COVER = UNSPLASH("photo-1611162617213-7d7a39e9b1b7");
export const DEFAULT_COVER_URL = DEFAULT_COVER;

/** 分类 → 封面（与 hot_topics.category 对齐） */
export const COVER_BY_CATEGORY: Record<string, string> = {
  情感: UNSPLASH("photo-1518199266791-5375a83190b7"),
  职场: UNSPLASH("photo-1521737711867-e3b97375f902"),
  生活: UNSPLASH("photo-1499750310107-5fef28a66643"),
  宠物: UNSPLASH("photo-1583511655857-d19b40a07a18"),
  美食: UNSPLASH("photo-1504674900247-0877df9cc836"),
  学生: UNSPLASH("photo-1523050854058-8df90110c9f1"),
  宝妈: UNSPLASH("photo-1515488042361-ee00e8170dc8"),
  穿搭: UNSPLASH("photo-1483985988350-763728e066fa"),
  探店: UNSPLASH("photo-1414235077426-338989a2e8af"),
  "AI工具": UNSPLASH("photo-1677442136019-21780ecad995"),
  副业: UNSPLASH("photo-1556742049-0cfed4f6a45d"),
  治愈: UNSPLASH("photo-1507003211169-0a1dd7228f2d"),
  成长: UNSPLASH("photo-1499750310107-5fef28a66643"),
};

/** 本地 SVG 占位图不算真实封面 */
export function isPlaceholderHotCover(url?: string): boolean {
  if (!url) return true;
  return /^\/images\/hot\/.*\.svg$/i.test(url);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickVariant(base: string, seed: string): string {
  const variants = [base];
  const h = hashStr(seed);
  if (h % 3 === 1) variants.push(UNSPLASH("photo-1614850523459-9c56f5060de3"));
  if (h % 3 === 2) variants.push(UNSPLASH("photo-1557683316-973673baf926"));
  return variants[h % variants.length];
}

export function resolveHotTopicCover(
  item: Pick<HotTopicItem, "track" | "title" | "coverImage" | "category">
): string {
  if (item.coverImage?.startsWith("http") && !isPlaceholderHotCover(item.coverImage)) {
    return item.coverImage;
  }

  const title = item.title ?? "";
  const category = item.category ?? item.track ?? "";

  if (category && COVER_BY_CATEGORY[category]) {
    return pickVariant(COVER_BY_CATEGORY[category], `${category}-${title}`);
  }

  for (const [re, url] of COVER_BY_KEYWORD) {
    if (re.test(title)) return pickVariant(url, title);
  }

  const track = item.track ?? "";
  if (COVER_BY_TRACK[track]) return pickVariant(COVER_BY_TRACK[track], `${track}-${title}`);

  return pickVariant(DEFAULT_COVER, title || track);
}

/** picsum 备用（Unsplash 加载失败时） */
export function picsumCoverFallback(seed: string): string {
  const id = hashStr(seed || "hot") % 1000;
  return `https://picsum.photos/seed/emotion-${id}/240/240`;
}
