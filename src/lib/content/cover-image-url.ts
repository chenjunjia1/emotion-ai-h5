import type { SceneCategory } from "@/lib/content/scene-cover-presets";
import { bundledCoverUrl } from "@/lib/content/bundled-cover-assets";

/** 场景分类 → 本地 SVG（打包 JPG 也失败时兜底） */
export const LOCAL_COVER_BY_SCENE: Record<SceneCategory, string> = {
  emotional: "/images/hot/emotion.svg",
  worklife: "/images/hot/work.svg",
  pet: "/images/hot/pet.svg",
  food: "/images/hot/food.svg",
  lifestyle: "/images/hot/life.svg",
  study: "/images/hot/work.svg",
  fashion: "/images/hot/fashion.svg",
  family: "/images/hot/healing.svg",
};

const PROXY = (photoId: string, w = 520, h = 700) =>
  `/img-proxy/${photoId}?w=${w}&h=${h}&fit=crop&crop=entropy&auto=format&q=88`;

export function proxyUnsplashUrl(photoId: string): string {
  return PROXY(photoId);
}

/** 按条目 id 稳定生成不重复实景（picsum 同源代理，列表专用） */
export function coverSeedUrl(seed: string, w = 400, h = 500): string {
  const safe = encodeURIComponent(seed.slice(0, 80));
  return `/api/cover-seed/${safe}?w=${w}&h=${h}`;
}

/** 加载链：打包实景 JPG（主）→ 同类 JPG → 代理 → 本地 SVG */
export function buildCoverImageSources(
  photoId: string,
  category: SceneCategory,
  seed: string,
  altPhotoIds: string[] = []
): { image: string; fallbacks: string[]; localFallback: string } {
  const localFallback = LOCAL_COVER_BY_SCENE[category] ?? "/images/hot/default.svg";
  const primary = bundledCoverUrl(category, seed);
  const altBundled = altPhotoIds.map((_, i) => bundledCoverUrl(category, `${seed}-alt-${i}`));
  const proxy = proxyUnsplashUrl(photoId);
  const proxyAlts = altPhotoIds.map(proxyUnsplashUrl);

  const fallbacks = [...altBundled, proxy, ...proxyAlts, localFallback].filter(
    (u, i, arr) => u !== primary && arr.indexOf(u) === i
  );

  return { image: primary, fallbacks, localFallback };
}
