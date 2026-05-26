import type { XhsHotNote } from "@/lib/xhs/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getXhsHotNotesFromDb(
  dateKey = todayDateKey()
): Promise<{ notes: XhsHotNote[]; fetchedAt: string } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from("xhs_hot_notes_daily")
    .select("notes, fetched_at, note_count")
    .eq("topic_date", dateKey)
    .maybeSingle();

  if (error || !data?.notes || !Array.isArray(data.notes)) return null;
  const notes = data.notes as XhsHotNote[];
  if (!notes.length) return null;

  return {
    notes,
    fetchedAt: String(data.fetched_at ?? new Date().toISOString()),
  };
}

export async function saveXhsHotNotesToDb(
  notes: XhsHotNote[],
  dateKey = todayDateKey()
): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "no_db" };

  const { error } = await db.from("xhs_hot_notes_daily").upsert(
    {
      topic_date: dateKey,
      notes,
      note_count: notes.length,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "topic_date" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function countXhsHotNotesInDb(dateKey = todayDateKey()): Promise<number> {
  const hit = await getXhsHotNotesFromDb(dateKey);
  return hit?.notes.length ?? 0;
}

/** 用户端缓存失效依据：运营后台保存后会更新 fetched_at */
export async function getXhsHotNotesDataRevision(
  dateKey = todayDateKey()
): Promise<{ dateKey: string; dataRevision: string | null }> {
  const db = getSupabaseAdmin();
  if (!db) return { dateKey, dataRevision: null };

  const { data, error } = await db
    .from("xhs_hot_notes_daily")
    .select("fetched_at, topic_date")
    .eq("topic_date", dateKey)
    .maybeSingle();

  if (error || !data?.fetched_at) {
    return { dateKey, dataRevision: null };
  }

  return {
    dateKey: String(data.topic_date ?? dateKey),
    dataRevision: String(data.fetched_at),
  };
}
