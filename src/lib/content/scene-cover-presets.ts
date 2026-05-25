import type { ShortVideoCoverPreset } from "@/lib/content/short-video-covers";
import { buildCoverImageSources } from "@/lib/content/cover-image-url";
import { SCENE_IMAGE_POOLS, type SceneCategory } from "@/lib/content/scene-cover-pools";

export type { SceneCategory };

/** 首页卡片 label 精确映射（优先级最高） */
const EXACT_LABEL_CATEGORY: Record<string, SceneCategory> = {
  情绪共鸣文案: "emotional",
  下班vlog脚本: "worklife",
  宠物治愈文案: "pet",
  美食探店脚本: "food",
  朋友圈种草文案: "lifestyle",
  职场成长干货: "study",
  穿搭反差脚本: "fashion",
  小红书种草笔记: "lifestyle",
  /** 今日热点二级分类 Tab */
  美食: "food",
  治愈: "emotional",
  情感: "emotional",
  生活: "lifestyle",
  宠物: "pet",
  穿搭: "fashion",
  职场: "study",
  美食号: "food",
  治愈号: "emotional",
  情感号: "emotional",
  生活号: "lifestyle",
  宠物号: "pet",
  穿搭号: "fashion",
  职场号: "study",
};

/** 标题关键词 → 分类（越具体的规则越靠前） */
const KEYWORD_CATEGORY_RULES: { category: SceneCategory; re: RegExp }[] = [
  { category: "fashion", re: /穿搭|OOTD|时尚|多巴胺|衣橱|美美的|裙子|衣服|夏日穿|夏季穿|夏天.*美|穿.*好看/ },
  { category: "emotional", re: /夏天味道|夏天.*治愈|不开心|治愈自己|治愈时刻|开心比/ },
  { category: "family", re: /阿嬷|外婆|阿公|奶奶|爷爷|外公|情书|手绘.*送|送给.*(阿嬷|外婆|奶奶)/ },
  { category: "pet", re: /宠物|猫咪|萌宠|猫|狗|狗狗|小狗|动物/ },
  {
    category: "food",
    re: /美食|探店|火锅|烤肉|餐饮|小吃|甜品|烧烤|餐厅|一人食|吃什么|逛吃|便利店|测评|家常菜|夜宵|早餐|奶茶|蛋糕|面包|料理|食材|下厨房|吃货/,
  },
  { category: "study", re: /职场|干货|成长|效率|逆袭|学习|笔记|写字|Mac|办公|打工|工位|笔记本/ },
  { category: "worklife", re: /下班|vlog|地铁|晚霞|通勤|打工人|回家|城市夜景|都市/ },
  { category: "lifestyle", re: /朋友圈|种草|好物|香薰|护肤|摆拍|精致生活|氛围|桌面/ },
  {
    category: "emotional",
    re: /情绪|共鸣|孤独|夜景|窗边|下雨|咖啡|不开心|委屈|情感|恋爱|安静|崩溃|治愈自己|治愈时刻|小事/,
  },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 根据标题 + 卡片 label 解析场景分类 */
export function resolveSceneCategory(topic: string, label = ""): SceneCategory {
  const labelTrim = label.trim();
  if (labelTrim && EXACT_LABEL_CATEGORY[labelTrim]) {
    return EXACT_LABEL_CATEGORY[labelTrim];
  }
  const labelNoSuffix = labelTrim.replace(/号$/u, "");
  if (labelNoSuffix && EXACT_LABEL_CATEGORY[labelNoSuffix]) {
    return EXACT_LABEL_CATEGORY[labelNoSuffix];
  }

  const hay = `${labelTrim} ${topic}`.trim();
  for (const rule of KEYWORD_CATEGORY_RULES) {
    if (rule.re.test(hay)) return rule.category;
  }
  return "emotional";
}

function pickSceneImage(category: SceneCategory, seed: string): Omit<ShortVideoCoverPreset, "titleLines"> {
  const pool = SCENE_IMAGE_POOLS[category];
  const idx = hashStr(`${category}-${seed}`) % pool.length;
  const picked = pool[idx]!;
  const rest = [...pool.slice(idx + 1), ...pool.slice(0, idx)].map((p) => p.id);
  const sources = buildCoverImageSources(picked.id, category, seed, rest);
  return {
    style: picked.style,
    image: sources.image,
    fallbacks: sources.fallbacks,
    localFallback: sources.localFallback,
    filter: picked.filter,
  };
}

/**
 * 根据标题语义匹配场景封面
 * @param topic 选题/标题正文
 * @param seed 稳定区分同分类多卡（用 id，避免重复图）
 * @param titleLines 案例区封面叠字
 * @param label 卡片短 label（如「情绪共鸣文案」），优先于 topic 匹配
 */
export function coverPresetForTopic(
  topic: string,
  seed = topic,
  titleLines: string[] = [],
  label = ""
): ShortVideoCoverPreset {
  const category = resolveSceneCategory(topic, label);
  const base = pickSceneImage(category, seed);
  return { ...base, titleLines };
}

/** 将卡片标题拆成封面两行文案（案例区用） */
export function titleLinesFromCardTitle(title: string): string[] {
  const t = title.replace(/[「」]/g, "").trim();
  if (t.length <= 8) return [t];
  const mid = Math.ceil(t.length / 2);
  let split = mid;
  for (let i = mid; i < t.length && i < mid + 4; i++) {
    if (/[，。、的了吗呢吧 ]/.test(t[i] ?? "")) {
      split = i + 1;
      break;
    }
  }
  return [t.slice(0, split).trim(), t.slice(split).trim()].filter(Boolean);
}

/** 导出分类图库 URL（热点库等复用） */
export function sceneCoverUrlForCategory(category: SceneCategory, seed: string): string {
  return pickSceneImage(category, seed).image;
}

export function sceneCoverUrlForTitle(title: string, seed: string, label = ""): string {
  const cat = resolveSceneCategory(title, label);
  return sceneCoverUrlForCategory(cat, seed);
}
