import type { XhsHotNote } from "@/lib/xhs/types";
import { XHS_SERVER_CACHE_TTL_MS } from "@/lib/xhs/xhs-keywords";

type CacheEntry = {
  data: XhsHotNote[];
  cachedAt: number;
};

let memoryCache: CacheEntry | null = null;

export function getXhsHotNotesServerCache(): XhsHotNote[] | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.cachedAt > XHS_SERVER_CACHE_TTL_MS) {
    memoryCache = null;
    return null;
  }
  return memoryCache.data;
}

export function setXhsHotNotesServerCache(data: XhsHotNote[]): void {
  memoryCache = { data, cachedAt: Date.now() };
}

export function clearXhsHotNotesServerCache(): void {
  memoryCache = null;
}

export function getXhsHotNotesCacheMeta(): { cachedAt: string } | null {
  if (!memoryCache) return null;
  return { cachedAt: new Date(memoryCache.cachedAt).toISOString() };
}
