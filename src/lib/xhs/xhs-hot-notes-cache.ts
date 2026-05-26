import type { XhsHotNotesResponse } from "@/lib/xhs/types";
import { XHS_CLIENT_CACHE_TTL_MS } from "@/lib/xhs/xhs-keywords";

const CACHE_KEY = "xhs_hot_notes_cache_v3";
const VERSION_KEY = "xhs_hot_notes_cache_version";

/** 管理后台保存后 bump（仅同浏览器内预览用；用户端靠 dataRevision 同步） */
export function bumpXhsHotNotesClientCacheVersion(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VERSION_KEY, String(Date.now()));
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

type CachedPayload = {
  success: boolean;
  data: XhsHotNotesResponse["data"];
  cached?: boolean;
  cachedAt: number;
  dataRevision?: string;
  message?: string;
};

function isStale(parsed: CachedPayload, serverRevision?: string | null): boolean {
  if (Date.now() - parsed.cachedAt > XHS_CLIENT_CACHE_TTL_MS) return true;
  if (!serverRevision) return false;
  if (!parsed.dataRevision) return true;
  return parsed.dataRevision !== serverRevision;
}

export function getXhsHotNotesClientCache(
  serverRevision?: string | null
): XhsHotNotesResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (isStale(parsed, serverRevision)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return {
      success: parsed.success,
      data: parsed.data ?? [],
      cached: true,
      cachedAt: new Date(parsed.cachedAt).toISOString(),
      dataRevision: parsed.dataRevision,
      message: parsed.message,
    };
  } catch {
    return null;
  }
}

export function setXhsHotNotesClientCache(payload: XhsHotNotesResponse): void {
  if (typeof window === "undefined") return;
  try {
    const dataRevision =
      payload.dataRevision ?? payload.cachedAt ?? new Date().toISOString();
    const toStore: CachedPayload = {
      success: payload.success,
      data: payload.data ?? [],
      cached: payload.cached,
      message: payload.message,
      cachedAt: Date.now(),
      dataRevision,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));
  } catch {
    /* quota */
  }
}

export function clearXhsHotNotesClientCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
    bumpXhsHotNotesClientCacheVersion();
  } catch {
    /* ignore */
  }
}
