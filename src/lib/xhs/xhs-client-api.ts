import type { XhsHotNotesMetaResponse, XhsHotNotesResponse } from "@/lib/xhs/types";
import { INSPIRATION_POOL_TARGET } from "@/lib/xhs/inspiration-pool";
import {
  hasFullInspirationPoolCache,
  readInspirationPoolCache,
  writeInspirationPoolCache,
} from "@/lib/xhs/inspiration-pool-client-cache";

export async function apiGetXhsHotNotesMeta(): Promise<XhsHotNotesMetaResponse> {
  const res = await fetch("/api/xhs/hot-notes?meta=1", { cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as XhsHotNotesMetaResponse;
  return {
    dateKey: json.dateKey ?? "",
    dataRevision: json.dataRevision ?? null,
  };
}

export async function apiGetXhsHotNotes(force = false): Promise<XhsHotNotesResponse> {
  const q = force ? "?force=1" : "";
  const res = await fetch(`/api/xhs/hot-notes${q}`, { cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as XhsHotNotesResponse;
  if (!res.ok) {
    return {
      success: false,
      data: [],
      message: json.message ?? "加载小红书灵感失败",
    };
  }
  return json;
}

/** 灵感页 / 首页共用完整灵感池（服务端扩展至 ≥300 条） */
export async function apiGetInspirationPool(force = false): Promise<XhsHotNotesResponse> {
  if (!force && hasFullInspirationPoolCache()) {
    const cached = readInspirationPoolCache(0);
    if (cached?.length) {
      void fetch("/api/xhs/hot-notes?pool=inspiration")
        .then((r) => r.json())
        .then((json: XhsHotNotesResponse) => {
          if ((json.data?.length ?? 0) >= INSPIRATION_POOL_TARGET) {
            writeInspirationPoolCache(json.data!, json.dataRevision);
          }
        })
        .catch(() => {});
      return { success: true, data: cached, cached: true };
    }
  }

  const params = new URLSearchParams({ pool: "inspiration" });
  if (force) params.set("force", "1");
  const res = await fetch(`/api/xhs/hot-notes?${params}`, {
    cache: force ? "no-store" : "default",
  });
  const json = (await res.json().catch(() => ({}))) as XhsHotNotesResponse;
  if (!res.ok) {
    const fallback = readInspirationPoolCache(0);
    if (fallback?.length) {
      return { success: true, data: fallback, cached: true };
    }
    return {
      success: false,
      data: [],
      message: json.message ?? "加载灵感库失败",
    };
  }
  if (json.data?.length) {
    writeInspirationPoolCache(json.data, json.dataRevision);
  }
  return json;
}

export {
  filterXhsNotesByTab,
  filterXhsNotesForInspirationFeed,
  countInspirationFeedByTab,
  diversifyXhsNotes,
  formatXhsCount,
  inspirationFeedHeadNotes,
  inspirationTabRailPreview,
} from "@/lib/xhs/xhs-feed-filters";
export { XHS_TAB_FEED_MAX, XHS_TAB_FEED_MIN } from "@/lib/xhs/inspiration-feed-dedupe";
