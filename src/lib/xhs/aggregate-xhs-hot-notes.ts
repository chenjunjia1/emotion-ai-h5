import {
  fetchXhsHotList,
  getXhsImageNoteDetail,
  searchXhsNotes,
} from "@/services/tikhubService";
import { normalizeXhsNote } from "@/lib/xhs/xhs-note-normalize";
import { sortXhsNotesByHotScore } from "@/lib/xhs/xhs-note-rules";
import {
  XHS_DEFAULT_SEARCH_KEYWORDS,
  XHS_HOT_NOTES_LIMIT,
} from "@/lib/xhs/xhs-keywords";
import {
  getXhsHotNotesCacheMeta,
  getXhsHotNotesServerCache,
  setXhsHotNotesServerCache,
} from "@/lib/xhs/xhs-server-cache";
import {
  getXhsHotNotesFromDb,
  saveXhsHotNotesToDb,
  todayDateKey,
} from "@/lib/server/db/xhs-hot-notes-db";
import type { XhsHotNote } from "@/lib/xhs/types";
import { diversifyXhsNotes } from "@/lib/xhs/xhs-feed-filters";
import { applyUniqueXhsCovers } from "@/lib/xhs/xhs-unique-covers";

const DETAIL_ENRICH_LIMIT = 20;
const SEARCH_CONCURRENCY = 2;

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    for (;;) {
      const idx = cursor++;
      if (idx >= items.length) break;
      results[idx] = await fn(items[idx]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, limit), items.length) }, () => worker())
  );
  return results;
}

async function enrichNoteDetail(note: XhsHotNote): Promise<XhsHotNote> {
  if (note.images.length >= 1 && note.hotScore > 0 && note.desc.length > 20) return note;
  const detail = await getXhsImageNoteDetail(note.noteId);
  return detail ?? note;
}

/** 聚合 TikHub 多源数据 → 清洗排序后的热门图文 */
export async function aggregateXhsHotNotes(options?: {
  /** 跳过服务端内存缓存（仍会优先读 Supabase 运营配置） */
  force?: boolean;
  /** 强制重新拉 TikHub 并覆盖当日库（Cron 用） */
  refreshTikhub?: boolean;
  keywords?: string[];
  dateKey?: string;
}): Promise<{ notes: XhsHotNote[]; cached: boolean; cachedAt?: string; source?: string }> {
  const dateKey = options?.dateKey ?? todayDateKey();

  const dbHit = await getXhsHotNotesFromDb(dateKey);
  if (dbHit?.notes.length && !options?.refreshTikhub) {
    setXhsHotNotesServerCache(dbHit.notes, dbHit.fetchedAt);
    return {
      notes: dbHit.notes,
      cached: true,
      cachedAt: dbHit.fetchedAt,
      source: "supabase",
    };
  }

  if (!options?.force && !options?.refreshTikhub) {
    const mem = getXhsHotNotesServerCache();
    const memMeta = getXhsHotNotesCacheMeta();
    if (mem?.length) {
      return {
        notes: mem,
        cached: true,
        cachedAt: memMeta?.cachedAt,
        source: "memory",
      };
    }
  }

  if (!process.env.TIKHUB_API_KEY?.trim()) {
    if (dbHit?.notes.length) {
      return {
        notes: dbHit.notes,
        cached: true,
        cachedAt: dbHit.fetchedAt,
        source: "supabase",
      };
    }
    return { notes: [], cached: false, source: "none" };
  }

  const keywords = options?.keywords?.length
    ? options.keywords
    : [...XHS_DEFAULT_SEARCH_KEYWORDS];

  const map = new Map<string, XhsHotNote>();

  const hotList = await fetchXhsHotList();
  for (const item of hotList.slice(0, 15)) {
    const note = normalizeXhsNote(item);
    if (note) map.set(note.noteId, note);
  }

  await mapPool(keywords, SEARCH_CONCURRENCY, async (kw) => {
    const batch = await searchXhsNotes(kw, 1);
    for (const n of batch) {
      if (!map.has(n.noteId)) map.set(n.noteId, n);
    }
  });

  let candidates = sortXhsNotesByHotScore([...map.values()]).slice(0, 45);

  const toEnrich = candidates.slice(0, DETAIL_ENRICH_LIMIT);
  const enriched = await mapPool(toEnrich, 2, enrichNoteDetail);
  for (const n of enriched) {
    map.set(n.noteId, n);
  }

  candidates = sortXhsNotesByHotScore([...map.values()]);
  const notes = applyUniqueXhsCovers(diversifyXhsNotes(candidates, XHS_HOT_NOTES_LIMIT));
  const fetchedAt = new Date().toISOString();
  await saveXhsHotNotesToDb(notes, dateKey);
  setXhsHotNotesServerCache(notes, fetchedAt);

  return { notes, cached: false, cachedAt: fetchedAt, source: "tikhub" };
}
