import { getTopicImageKeyword } from "@/lib/topicImageKeywords";

export type TopicCoverSource = "pexels" | "local";

export type TopicCoverImage = {
  imageUrl: string;
  photographer?: string;
  photographerUrl?: string;
  pexelsUrl?: string;
  alt: string;
  source: TopicCoverSource;
  searchQuery: string;
};

const LOCAL_FALLBACK_POOLS: Record<string, string[]> = {
  food: ["/images/topics/food-1.jpg", "/images/topics/food-2.jpg"],
  healing: ["/images/topics/healing-1.jpg", "/images/topics/healing-2.jpg"],
  cafe: ["/images/topics/cafe-1.jpg", "/images/topics/cafe-2.jpg"],
  travel: ["/images/topics/travel-1.jpg", "/images/topics/travel-2.jpg"],
  pet: ["/images/topics/pet-1.jpg", "/images/topics/pet-2.jpg"],
  fashion: ["/images/topics/fashion-1.jpg", "/images/topics/fashion-2.jpg"],
  city: ["/images/topics/city-1.jpg", "/images/topics/city-2.jpg"],
  work: ["/images/topics/work-1.jpg", "/images/topics/work-2.jpg"],
};

const CATEGORY_TO_POOL: Record<string, keyof typeof LOCAL_FALLBACK_POOLS> = {
  治愈日常: "healing",
  治愈: "healing",
  情感: "healing",
  美食打卡: "food",
  美食: "food",
  咖啡生活: "cafe",
  生活: "city",
  旅行出片: "travel",
  宠物萌系: "pet",
  宠物: "pet",
  穿搭变美: "fashion",
  穿搭: "fashion",
  城市生活: "city",
  恋爱情绪: "healing",
  职场嘴替: "work",
  职场: "work",
  学生: "work",
  探店: "food",
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function cacheKey(title: string, category: string): string {
  return `pexels_topic_image_${title.trim()}_${category.trim()}`;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CachedPayload = TopicCoverImage & { cachedAt: number };

function readCache(title: string, category: string): TopicCoverImage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(title, category));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(title, category));
      return null;
    }
    const { cachedAt: _c, ...img } = parsed;
    void _c;
    return img;
  } catch {
    return null;
  }
}

function writeCache(title: string, category: string, image: TopicCoverImage): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedPayload = { ...image, cachedAt: Date.now() };
    localStorage.setItem(cacheKey(title, category), JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

/** 本地兜底图（按分类 + index 轮换） */
export function getLocalFallbackCoverImage(
  title: string,
  category: string,
  index: number
): TopicCoverImage {
  const cat = category.trim().replace(/号$/u, "");
  const poolKey =
    CATEGORY_TO_POOL[cat] ??
    (() => {
      const q = getTopicImageKeyword(title, category);
      if (/food|cafe|coffee/i.test(q)) return "food" as const;
      if (/pet|cat|dog/i.test(q)) return "pet" as const;
      if (/fashion|outfit/i.test(q)) return "fashion" as const;
      if (/office|worker|desk/i.test(q)) return "work" as const;
      if (/travel|city/i.test(q)) return "travel" as const;
      return "healing" as const;
    })();

  const pool = LOCAL_FALLBACK_POOLS[poolKey] ?? LOCAL_FALLBACK_POOLS.healing;
  const pick =
    pool[((index + hashStr(`${title}-${category}`)) % pool.length + pool.length) % pool.length]!;

  return {
    imageUrl: pick,
    alt: title,
    source: "local",
    searchQuery: getTopicImageKeyword(title, category),
  };
}

const queryPoolCache = new Map<string, TopicCoverImage[]>();

async function loadQueryPool(query: string): Promise<TopicCoverImage[]> {
  const hit = queryPoolCache.get(query);
  if (hit?.length) return hit;

  const params = new URLSearchParams({ query, all: "1" });
  try {
    const res = await fetch(`/api/pexels/search?${params.toString()}`);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      success: boolean;
      data?: Array<{
        imageUrl: string;
        photographer: string;
        photographerUrl: string;
        pexelsUrl: string;
        alt: string;
      }>;
    };
    if (!json.success || !Array.isArray(json.data)) return [];
    const pool = json.data
      .filter((p) => p.imageUrl)
      .map((p) => ({
        imageUrl: p.imageUrl,
        photographer: p.photographer,
        photographerUrl: p.photographerUrl,
        pexelsUrl: p.pexelsUrl,
        alt: p.alt || query,
        source: "pexels" as const,
        searchQuery: query,
      }));
    queryPoolCache.set(query, pool);
    return pool;
  } catch {
    return [];
  }
}

function pickFromPool(
  pool: TopicCoverImage[],
  pickIndex: number,
  options?: { usedImageUrls?: Set<string>; prevImageUrl?: string | null }
): TopicCoverImage | null {
  if (!pool.length) return null;
  for (let attempt = 0; attempt < pool.length; attempt++) {
    const idx = (pickIndex + attempt) % pool.length;
    const candidate = pool[idx]!;
    const dup =
      options?.usedImageUrls?.has(candidate.imageUrl) ||
      (options?.prevImageUrl && candidate.imageUrl === options.prevImageUrl);
    if (!dup) return candidate;
  }
  return pool[pickIndex % pool.length] ?? null;
}

/**
 * 获取热点封面：缓存 → Pexels API → 本地兜底；pickIndex 用于同屏去重轮换
 */
export async function getTopicCoverImage(
  title: string,
  category: string,
  index: number,
  options?: {
    skipCache?: boolean;
    usedImageUrls?: Set<string>;
    prevImageUrl?: string | null;
  }
): Promise<TopicCoverImage> {
  const query = getTopicImageKeyword(title, category);

  if (!options?.skipCache) {
    const hit = readCache(title, category);
    if (hit?.imageUrl) {
      if (!options?.usedImageUrls?.has(hit.imageUrl) && hit.imageUrl !== options?.prevImageUrl) {
        return hit;
      }
    }
  }

  const basePick = (index + hashStr(`${title}-${category}`)) % 10;
  const pool = await loadQueryPool(query);
  const remote = pickFromPool(pool, basePick, options);
  if (remote) {
    writeCache(title, category, remote);
    return remote;
  }

  for (let attempt = 0; attempt < LOCAL_FALLBACK_POOLS.healing.length; attempt++) {
    const local = getLocalFallbackCoverImage(title, category, index + attempt);
    const dup =
      options?.usedImageUrls?.has(local.imageUrl) ||
      (options?.prevImageUrl && local.imageUrl === options.prevImageUrl);
    if (!dup) {
      writeCache(title, category, local);
      return local;
    }
  }

  return getLocalFallbackCoverImage(title, category, index);
}

/** 批量解析列表封面（顺序请求，避免并发打爆 API） */
export async function resolveTopicCoversForList(
  items: { id: string; title: string; category?: string; track?: string }[]
): Promise<Map<string, TopicCoverImage>> {
  const map = new Map<string, TopicCoverImage>();
  const used = new Set<string>();
  let prev: string | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const category = item.category ?? item.track ?? "";
    const cover = await getTopicCoverImage(item.title, category, i, {
      usedImageUrls: used,
      prevImageUrl: prev,
    });
    used.add(cover.imageUrl);
    prev = cover.imageUrl;
    map.set(item.id, cover);
  }

  return map;
}

export { getTopicImageKeyword } from "@/lib/topicImageKeywords";
