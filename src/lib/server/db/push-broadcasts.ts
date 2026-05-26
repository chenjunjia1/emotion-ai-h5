import { getSupabaseAdmin } from "@/lib/supabase/server";

export type PushBroadcast = {
  id: string;
  kind: string;
  dateKey: string;
  title: string;
  body: string;
  href: string;
  emoji: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function mapRow(row: Record<string, unknown>): PushBroadcast {
  return {
    id: String(row.id),
    kind: String(row.kind),
    dateKey: String(row.date_key),
    title: String(row.title),
    body: String(row.body),
    href: String(row.href ?? "/hot-topics"),
    emoji: String(row.emoji ?? "🔥"),
    payload: (row.payload as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
  };
}

export async function upsertPushBroadcast(input: {
  kind: string;
  dateKey: string;
  title: string;
  body: string;
  href?: string;
  emoji?: string;
  payload?: Record<string, unknown>;
}): Promise<PushBroadcast | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from("push_broadcasts")
    .upsert(
      {
        kind: input.kind,
        date_key: input.dateKey,
        title: input.title,
        body: input.body,
        href: input.href ?? "/hot-topics",
        emoji: input.emoji ?? "🔥",
        payload: input.payload ?? {},
      },
      { onConflict: "kind,date_key" }
    )
    .select("*")
    .single();

  if (error || !data) {
    console.error("[push_broadcasts] upsert", error?.message);
    return null;
  }
  return mapRow(data as Record<string, unknown>);
}

export async function getLatestPushBroadcast(
  kind: string,
  dateKey?: string
): Promise<PushBroadcast | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  let q = db.from("push_broadcasts").select("*").eq("kind", kind);
  if (dateKey) q = q.eq("date_key", dateKey);
  const { data } = await q.order("date_key", { ascending: false }).limit(1).maybeSingle();
  return data ? mapRow(data as Record<string, unknown>) : null;
}
