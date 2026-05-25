import type { HotTopicItem } from "@/lib/hot-topics/types";
import { coverImageForCategory } from "@/lib/content/bundled-cover-assets";
import {
  resolveSceneCategory,
  sceneCoverUrlForCategory,
  sceneCoverUrlForTitle,
} from "@/lib/content/scene-cover-presets";

/** 分类 → 封面（打包 JPG，入库与展示一致） */
export const COVER_BY_CATEGORY: Record<string, string> = {
  情感: coverImageForCategory("情感", "情感"),
  职场: coverImageForCategory("职场", "职场"),
  生活: coverImageForCategory("生活", "生活"),
  宠物: coverImageForCategory("宠物", "宠物"),
  美食: coverImageForCategory("美食", "美食"),
  学生: coverImageForCategory("学生", "学生"),
  宝妈: coverImageForCategory("宝妈", "宝妈"),
  穿搭: coverImageForCategory("穿搭", "穿搭"),
  探店: coverImageForCategory("探店", "探店"),
  "AI工具": coverImageForCategory("AI工具", "AI工具"),
  副业: coverImageForCategory("副业", "副业"),
  治愈: coverImageForCategory("治愈", "治愈"),
  成长: coverImageForCategory("成长", "成长"),
};

export const DEFAULT_COVER_URL = coverImageForCategory("生活", "default");

/** 本地 SVG 占位图不算真实封面 */
export function isPlaceholderHotCover(url?: string): boolean {
  if (!url) return true;
  return /^\/images\/hot\/.*\.svg$/i.test(url);
}

export function resolveHotTopicCover(
  item: Pick<HotTopicItem, "track" | "title" | "coverImage" | "category"> & { id?: string }
): string {
  const title = item.title ?? "";
  const category = item.category ?? item.track ?? "";
  const seed = item.id ? `${item.id}-${title}` : title;

  // 展示层统一按标题语义 + id 选图，避免库里重复 http 封面
  if (category && COVER_BY_CATEGORY[category]) {
    const cat = resolveSceneCategory(title, category);
    return sceneCoverUrlForCategory(cat, seed);
  }

  return sceneCoverUrlForTitle(title, seed, category);
}

/** 分类封面（入库用） */
export function coverForCategory(category: string): string {
  return COVER_BY_CATEGORY[category] ?? DEFAULT_COVER_URL;
}

/** 远程图加载失败时的语义备用图（不用随机头像） */
export function picsumCoverFallback(seed: string): string {
  return sceneCoverUrlForTitle(seed, seed);
}
