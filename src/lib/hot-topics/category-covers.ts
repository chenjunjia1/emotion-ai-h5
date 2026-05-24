import { COVER_BY_CATEGORY, DEFAULT_COVER_URL } from "@/lib/content/hot-topic-covers";

/** 分类 → 真实封面图（Unsplash，入库即用） */
export const CATEGORY_COVER: Record<string, string> = {
  ...COVER_BY_CATEGORY,
};

export const DEFAULT_COVER = DEFAULT_COVER_URL;

export function coverForCategory(category: string): string {
  return CATEGORY_COVER[category] ?? DEFAULT_COVER;
}
