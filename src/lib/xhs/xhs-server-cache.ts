import type { XhsHotNote } from "@/lib/xhs/types";
import { XHS_SERVER_CACHE_TTL_MS } from "@/lib/xhs/xhs-keywords";

type CacheEntry = {
  data: XhsHotNote[];
  cachedAt: number;
  dataRevision: string;
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

export function setXhsHotNotesServerCache(
  data: XhsHotNote[],
  dataRevision?: string
): void {
  const revision = dataRevision ?? new Date().toISOString();
  memoryCache = { data, cachedAt: Date.now(), dataRevision: revision };
}

export function clearXhsHotNotesServerCache(): void {
  memoryCache = null;
}

export function getXhsHotNotesCacheMeta(): {
  cachedAt: string;
  dataRevision: string;
} | null {
  if (!memoryCache) return null;
  return {
    cachedAt: new Date(memoryCache.cachedAt).toISOString(),
    dataRevision: memoryCache.dataRevision,
  };
}
