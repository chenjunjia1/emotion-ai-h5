import type { XhsHotNotesResponse } from "@/lib/xhs/types";
import { XHS_CLIENT_CACHE_TTL_MS } from "@/lib/xhs/xhs-keywords";

const CACHE_KEY = "xhs_hot_notes_cache_v2";

type CachedPayload = {
  success: boolean;
  data: XhsHotNotesResponse["data"];
  cached?: boolean;
  cachedAt: number;
  message?: string;
};

export function getXhsHotNotesClientCache(): XhsHotNotesResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (Date.now() - parsed.cachedAt > XHS_CLIENT_CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return {
      success: parsed.success,
      data: parsed.data ?? [],
      cached: true,
      cachedAt: new Date(parsed.cachedAt).toISOString(),
      message: parsed.message,
    };
  } catch {
    return null;
  }
}

export function setXhsHotNotesClientCache(payload: XhsHotNotesResponse): void {
  if (typeof window === "undefined") return;
  try {
    const toStore: CachedPayload = {
      success: payload.success,
      data: payload.data ?? [],
      cached: payload.cached,
      message: payload.message,
      cachedAt: Date.now(),
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
  } catch {
    /* ignore */
  }
}
