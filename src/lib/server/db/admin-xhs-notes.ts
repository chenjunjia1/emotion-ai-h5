import { clearXhsHotNotesServerCache } from "@/lib/xhs/xhs-server-cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import { filterXhsNotesByTab } from "@/lib/xhs/xhs-feed-filters";
import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { XHS_FEED_TABS } from "@/lib/xhs/xhs-page-tabs";
import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const XHS_CATEGORIES: XhsNoteCategory[] = [
  "美食打卡",
  "穿搭变美",
  "宠物萌系",
  "旅行出片",
  "城市生活",
  "治愈日常",
  "情绪文案",
  "职场嘴替",
  "咖啡生活",
  "朋友圈文案",
];

function matchesSearch(note: XhsHotNote, q: string): boolean {
  const hay =
    `${note.title} ${note.desc} ${note.displayHeadline ?? ""} ${note.noteId} ${note.category} ${note.tags.join(" ")}`.toLowerCase();
  const headline = buildXhsCardCopy(note).headline.toLowerCase();
  const needle = q.toLowerCase();
  return hay.includes(needle) || headline.includes(needle);
}

export async function listXhsNoteDateKeys(limit = 30): Promise<string[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("xhs_hot_notes_daily")
    .select("topic_date")
    .order("topic_date", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[listXhsNoteDateKeys]", error.message);
    return [];
  }
  const set = new Set<string>();
  for (const row of data ?? []) {
    set.add(String((row as { topic_date: string }).topic_date));
  }
  return [...set];
}

import type { AdminTodayHotQueryRow } from "@/lib/admin/today-hot-query-types";

export type { AdminTodayHotQueryRow };

export async function queryTodayHotTopicsForAdmin(opts: {
  dateKey?: string;
  tab?: XhsFeedTab;
  category?: string;
  q?: string;
}): Promise<{
  dateKey: string;
  fetchedAt?: string;
  tab: XhsFeedTab;
  rawTotal: number;
  filteredTotal: number;
  items: AdminTodayHotQueryRow[];
  categoryStats: { category: string; count: number }[];
  availableDates: string[];
} | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const tab =
    opts.tab && XHS_FEED_TABS.some((t) => t.id === opts.tab) ? opts.tab : "hot";
  const base = await getXhsNotesForAdmin(opts.dateKey);
  if (!base) return null;

  const availableDates = await listXhsNoteDateKeys();
  const rawNotes = base.notes;

  const categoryStats = [
    { category: "全部", count: rawNotes.length },
    ...XHS_CATEGORIES.map((category) => ({
      category,
      count: rawNotes.filter((n) => n.category === category).length,
    })).filter((s) => s.count > 0),
  ];

  let tabbed = filterXhsNotesByTab(rawNotes, tab);

  if (opts.category && opts.category !== "全部") {
    tabbed = tabbed.filter((n) => n.category === opts.category);
  }

  const q = opts.q?.trim();
  if (q) {
    tabbed = tabbed.filter((n) => matchesSearch(n, q));
  }

  const rankByNoteId = new Map(
    rawNotes.map((n, i) => [n.noteId, i + 1] as const)
  );

  const items: AdminTodayHotQueryRow[] = tabbed.map((note, index) => {
    const copy = buildXhsCardCopy(note);
    return {
      note,
      rank: index + 1,
      displayHeadline: copy.headline,
      displaySubline: copy.subline,
      globalRank: rankByNoteId.get(note.noteId) ?? index + 1,
    };
  });

  return {
    dateKey: base.dateKey,
    fetchedAt: base.fetchedAt,
    tab,
    rawTotal: rawNotes.length,
    filteredTotal: items.length,
    items,
    categoryStats,
    availableDates,
  };
}

export async function getXhsNotesForAdmin(
  dateKey = todayDateKey()
): Promise<{ dateKey: string; notes: XhsHotNote[]; fetchedAt?: string } | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from("xhs_hot_notes_daily")
    .select("notes, fetched_at, topic_date")
    .eq("topic_date", dateKey)
    .maybeSingle();

  if (error) {
    console.warn("[admin xhs]", error.message);
    return null;
  }

  const notes = Array.isArray(data?.notes) ? (data.notes as XhsHotNote[]) : [];
  return {
    dateKey: String(data?.topic_date ?? dateKey),
    notes,
    fetchedAt: data?.fetched_at ? String(data.fetched_at) : undefined,
  };
}

export async function saveXhsNotesForAdmin(
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

  clearXhsHotNotesServerCache();
  return { ok: true };
}
