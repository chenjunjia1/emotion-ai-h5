import type { SceneCategory } from "@/lib/content/scene-cover-presets";

/**
 * 打包进项目的实景封面（/public/images/covers）
 * 优先于外网 Unsplash，国内必显、语义与分类一致
 */
/** 每类用不同实景文件（避免 fashion 误用猫咪图） */
export const BUNDLED_COVER_POOLS: Record<SceneCategory, string[]> = {
  emotional: ["/images/covers/emotional-1.jpg", "/images/covers/emotional-2.jpg"],
  worklife: ["/images/covers/worklife-1.jpg", "/images/covers/worklife-2.jpg"],
  pet: ["/images/covers/pet-1.jpg", "/images/covers/pet-2.jpg"],
  food: ["/images/covers/food-1.jpg", "/images/covers/food-2.jpg"],
  lifestyle: ["/images/covers/lifestyle-1.jpg", "/images/covers/lifestyle-2.jpg"],
  study: ["/images/covers/study-1.jpg", "/images/covers/study-2.jpg"],
  fashion: ["/images/covers/fashion-1.jpg", "/images/covers/fashion-2.jpg"],
  family: ["/images/covers/family-1.jpg", "/images/covers/family-2.jpg"],
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 按分类 + seed 选一张打包封面（同 seed 稳定，不同卡片可区分） */
export function bundledCoverUrl(category: SceneCategory, seed: string): string {
  const pool = BUNDLED_COVER_POOLS[category] ?? BUNDLED_COVER_POOLS.emotional;
  return pool[hashStr(`${category}-${seed}`) % pool.length]!;
}

/** 按场景池下标选打包图（列表去重时与 SCENE_IMAGE_POOLS 下标对齐） */
export function bundledCoverAtIndex(category: SceneCategory, index: number): string {
  const pool = BUNDLED_COVER_POOLS[category] ?? BUNDLED_COVER_POOLS.emotional;
  return pool[((index % pool.length) + pool.length) % pool.length]!;
}

/** 中文分类 + 标题 → 场景（规则与 scene-cover-presets 保持一致） */
export function sceneCategoryFromLabel(category: string, title = ""): SceneCategory {
  const label = category.trim().replace(/号$/u, "");
  const moodMap: Record<string, SceneCategory> = {
    美食: "food",
    治愈: "emotional",
    情感: "emotional",
    生活: "lifestyle",
    宠物: "pet",
    穿搭: "fashion",
    职场: "study",
  };
  if (label && moodMap[label]) return moodMap[label];

  const hay = `${category}${title}`;
  if (/穿搭|美美的|时尚|衣橱|OOTD/.test(hay)) return "fashion";
  if (/阿嬷|外婆|奶奶|情书|手绘/.test(hay)) return "family";
  if (/宠物|猫|狗|萌宠/.test(hay)) return "pet";
  if (/美食|探店|餐饮|逛吃|便利店|一人食|吃货|小吃|火锅/.test(hay)) return "food";
  if (/职场|干货|成长|学生|办公|打工/.test(hay)) return "study";
  if (/下班|vlog|地铁|通勤/.test(hay)) return "worklife";
  if (/朋友圈|种草|好物|香薰|护肤/.test(hay)) return "lifestyle";
  return "emotional";
}

export function coverImageForCategory(category: string, seed: string, title = ""): string {
  return bundledCoverUrl(sceneCategoryFromLabel(category, title), seed);
}
