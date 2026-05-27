import type { XhsHotNote } from "@/lib/xhs/types";
import { INSPIRATION_POOL_TARGET } from "@/lib/xhs/inspiration-pool";

const STORAGE_KEY = "xhs_inspiration_pool_v5";
const LEGACY_KEYS = [
  "xhs_inspiration_pool_v4",
  "xhs_inspiration_pool_v3",
  "xhs_inspiration_pool_v2",
  "xhs_inspiration_pool_v1",
  "xhs_inspiration_pool_cache_v3",
] as const;
const TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_CAP = INSPIRATION_POOL_TARGET + 20;

type CachedPool = {
  at: number;
  revision?: string | null;
  data: XhsHotNote[];
};

function parseCached(raw: string): CachedPool | null {
  try {
    const parsed = JSON.parse(raw) as CachedPool;
    if (!parsed.data?.length) return null;
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 与灵感页共用的完整灵感池缓存 */
export function readInspirationPoolCache(limit = 0): XhsHotNote[] | null {
  if (typeof window === "undefined") return null;

  const primary = sessionStorage.getItem(STORAGE_KEY);
  if (primary) {
    const hit = parseCached(primary);
    if (hit) {
      return limit > 0 ? hit.data.slice(0, limit) : hit.data;
    }
  }

  for (const key of LEGACY_KEYS) {
    const legacy = sessionStorage.getItem(key);
    if (!legacy) continue;
    const hit = parseCached(legacy);
    if (hit) {
      writeInspirationPoolCache(hit.data, hit.revision);
      return limit > 0 ? hit.data.slice(0, limit) : hit.data;
    }
  }

  return null;
}

export function writeInspirationPoolCache(
  data: XhsHotNote[],
  revision?: string | null
): void {
  if (typeof window === "undefined" || !data.length) return;
  try {
    const payload: CachedPool = {
      at: Date.now(),
      revision: revision ?? null,
      data: data.slice(0, CACHE_CAP),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    for (const key of LEGACY_KEYS) {
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* quota */
  }
}

export function hasFullInspirationPoolCache(): boolean {
  const data = readInspirationPoolCache(0);
  return (data?.length ?? 0) >= INSPIRATION_POOL_TARGET;
}
