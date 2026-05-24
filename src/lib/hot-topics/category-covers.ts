/** 分类 → 本地封面图（public/images/hot/） */
export const CATEGORY_COVER: Record<string, string> = {
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
  反差: "/images/hot/life.svg",
  日常vlog: "/images/hot/life.svg",
};

export const DEFAULT_COVER = "/images/hot/default.svg";

export function coverForCategory(category: string): string {
  return CATEGORY_COVER[category] ?? DEFAULT_COVER;
}
