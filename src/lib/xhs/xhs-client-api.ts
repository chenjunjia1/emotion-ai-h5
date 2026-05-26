import type { XhsHotNotesMetaResponse, XhsHotNotesResponse } from "@/lib/xhs/types";

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

export { filterXhsNotesByTab, diversifyXhsNotes, formatXhsCount } from "@/lib/xhs/xhs-feed-filters";
