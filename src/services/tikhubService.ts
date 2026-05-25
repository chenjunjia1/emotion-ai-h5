import { normalizeXhsNote, normalizeXhsNoteList } from "@/lib/xhs/xhs-note-normalize";
import type { XhsHotNote } from "@/lib/xhs/types";

const TIKHUB_BASE = "https://api.tikhub.io";
const TIMEOUT_MS = 12_000;

type TikHubJson = Record<string, unknown>;

async function tikhubFetch(path: string, params?: Record<string, string>): Promise<TikHubJson | null> {
  const apiKey = process.env.TIKHUB_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL(`${TIKHUB_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as TikHubJson & { code?: number; message?: string };
    if (typeof json.code === "number" && json.code !== 200 && json.code !== 0) {
      return null;
    }
    return json;
  } catch {
    return null;
  }
}

function unwrapList(raw: TikHubJson | null): unknown[] {
  if (!raw) return [];
  const data = raw.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d = data as TikHubJson;
    const inner = d.data;
    if (inner && typeof inner === "object") {
      const nested = inner as TikHubJson;
      for (const key of ["items", "notes", "note_list", "list", "hot_list"]) {
        const v = nested[key];
        if (Array.isArray(v)) return v;
      }
    }
    for (const key of ["items", "notes", "note_list", "list", "hot_list", "data"]) {
      const v = d[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

/** 获取小红书热榜 */
export async function fetchXhsHotList(): Promise<unknown[]> {
  const raw = await tikhubFetch("/api/v1/xiaohongshu/web_v2/fetch_hot_list");
  return unwrapList(raw);
}

/** 按关键词搜索热门图文笔记 */
export async function searchXhsNotes(keyword: string, page = 1): Promise<XhsHotNote[]> {
  const raw = await tikhubFetch("/api/v1/xiaohongshu/app_v2/search_notes", {
    keyword: keyword.trim(),
    page: String(page),
    sort_type: "popularity_descending",
    note_type: "普通笔记",
    time_filter: "半年内",
  });
  if (!raw) {
    const webRaw = await tikhubFetch("/api/v1/xiaohongshu/web/search_notes", {
      keyword: keyword.trim(),
      page: String(page),
      sort: "popularity_descending",
      noteType: "_2",
    });
    return normalizeXhsNoteList(webRaw);
  }
  return normalizeXhsNoteList(raw);
}

/** 获取图文笔记详情 */
export async function getXhsImageNoteDetail(noteId: string): Promise<XhsHotNote | null> {
  const raw = await tikhubFetch("/api/v1/xiaohongshu/app_v2/get_image_note_detail", {
    note_id: noteId,
  });
  if (!raw) {
    const fallback = await tikhubFetch("/api/v1/xiaohongshu/app/get_note_info_v2", {
      note_id: noteId,
    });
    return normalizeXhsNote(fallback);
  }
  return normalizeXhsNote(raw);
}

/** 获取笔记图片列表 */
export async function getXhsNoteImages(noteId: string): Promise<string[]> {
  const raw = await tikhubFetch("/api/v1/xiaohongshu/web_v2/fetch_note_image", {
    note_id: noteId,
  });
  const note = normalizeXhsNote(raw);
  if (note?.images.length) return note.images;

  const detail = await getXhsImageNoteDetail(noteId);
  return detail?.images ?? [];
}

export { normalizeXhsNote } from "@/lib/xhs/xhs-note-normalize";
