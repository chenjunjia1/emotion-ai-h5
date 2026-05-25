import type { HotTopicItem } from "@/lib/hot-topics/types";

const TTL_MS = 15 * 60 * 1000;

type CacheEntry = {
  items: HotTopicItem[];
  meta: {
    date: string;
    total: number;
    updatedAt: string;
    stale?: boolean;
    message?: string;
  } | null;
  at: number;
};

let cache: CacheEntry | null = null;

export function getHotTopicsListCache(): CacheEntry | null {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    cache = null;
    return null;
  }
  return cache;
}

export function setHotTopicsListCache(
  items: HotTopicItem[],
  meta: CacheEntry["meta"]
): void {
  cache = { items, meta, at: Date.now() };
}

export function clearHotTopicsListCache(): void {
  cache = null;
}
