import {
  classifyXhsNote,
  computeXhsHotScore,
  extractImageUrls,
  inferXhsAudience,
  inferXhsContentType,
  isBlockedXhsContent,
  isImageNoteCandidate,
} from "@/lib/xhs/xhs-note-rules";
import type { XhsHotNote } from "@/lib/xhs/types";

function dig(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function pickStr(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickNum(obj: unknown, keys: string[]): number {
  if (!obj || typeof obj !== "object") return 0;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.round(v));
    if (typeof v === "string") {
      const n = parseInt(v.replace(/[^\d]/g, ""), 10);
      if (Number.isFinite(n)) return Math.max(0, n);
    }
  }
  return 0;
}

function parseTags(raw: Record<string, unknown>): string[] {
  const list = raw.tag_list ?? raw.tags ?? raw.topics;
  if (!Array.isArray(list)) return [];
  return list
    .map((t) => {
      if (typeof t === "string") return t.trim();
      if (t && typeof t === "object") {
        return pickStr(t, ["name", "tag_name", "title", "text"]);
      }
      return "";
    })
    .filter(Boolean)
    .slice(0, 12);
}

function parseCreatedAt(raw: Record<string, unknown>): string {
  const ts =
    pickNum(raw, ["time", "timestamp", "create_time", "created_at"]) ||
    pickNum(dig(raw, ["note", "time"]), ["time"]);
  if (ts > 1_000_000_000_000) return new Date(ts).toISOString();
  if (ts > 1_000_000_000) return new Date(ts * 1000).toISOString();
  const s = pickStr(raw, ["time_desc", "publish_time", "createdAt"]);
  return s || new Date().toISOString();
}

function unwrapTikHubPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (d.data && typeof d.data === "object") return d.data as Record<string, unknown>;
    return d;
  }
  return o;
}

function resolveNoteId(raw: Record<string, unknown>): string {
  return (
    pickStr(raw, ["note_id", "noteId", "id"]) ||
    pickStr(raw.note_card as Record<string, unknown>, ["note_id", "id"]) ||
    pickStr(raw.note as Record<string, unknown>, ["note_id", "id"]) ||
    ""
  );
}

function resolveInteract(raw: Record<string, unknown>): Record<string, unknown> {
  return (
    (raw.interact_info as Record<string, unknown>) ||
    (raw.interaction as Record<string, unknown>) ||
    (raw.note_card as Record<string, unknown>)?.interact_info as Record<string, unknown> ||
    (raw.note as Record<string, unknown>)?.interact_info as Record<string, unknown> ||
    raw
  );
}

function resolveUser(raw: Record<string, unknown>): Record<string, unknown> {
  return (
    (raw.user as Record<string, unknown>) ||
    (raw.author as Record<string, unknown>) ||
    (raw.note_card as Record<string, unknown>)?.user as Record<string, unknown> ||
    (raw.note as Record<string, unknown>)?.user as Record<string, unknown> ||
    {}
  );
}

/** 把 TikHub 原始数据转换成统一 XhsHotNote；无法解析或应过滤则返回 null */
export function normalizeXhsNote(rawInput: unknown): XhsHotNote | null {
  const payload = unwrapTikHubPayload(rawInput);
  const items = payload.items ?? payload.notes ?? payload.note_list;
  if (Array.isArray(items) && items.length === 1) {
    return normalizeXhsNote(items[0]);
  }

  const raw =
    (payload.note as Record<string, unknown>) ||
    (payload.note_card as Record<string, unknown>) ||
    payload;

  if (!raw || typeof raw !== "object") return null;
  if (!isImageNoteCandidate(raw as Record<string, unknown>)) return null;

  const noteId = resolveNoteId(raw as Record<string, unknown>);
  if (!noteId) return null;

  const title =
    pickStr(raw, ["title", "display_title", "name"]) ||
    pickStr((raw as Record<string, unknown>).note_card, ["display_title", "title"]) ||
    pickStr((raw as Record<string, unknown>).note, ["title"]);
  const desc =
    pickStr(raw, ["desc", "description", "content", "note_desc"]) ||
    pickStr((raw as Record<string, unknown>).note_card, ["desc", "description"]) ||
    pickStr((raw as Record<string, unknown>).note, ["desc"]);

  const text = `${title} ${desc}`.trim();
  if (!text || text.length < 4) return null;

  const tags = parseTags(raw as Record<string, unknown>);
  if (isBlockedXhsContent(title, desc, tags)) return null;

  const interact = resolveInteract(raw as Record<string, unknown>);
  const likedCount = pickNum(interact, ["liked_count", "like_count", "likes"]);
  const collectedCount = pickNum(interact, ["collected_count", "collect_count", "collects"]);
  const commentCount = pickNum(interact, [
    "comment_count",
    "comments_count",
    "comments",
  ]);
  const shareCount = pickNum(interact, ["share_count", "shared_count", "shares"]);

  const user = resolveUser(raw as Record<string, unknown>);
  const images = extractImageUrls(raw as Record<string, unknown>);
  if (!images.length) return null;

  const category = classifyXhsNote(text);
  const audience = inferXhsAudience(text, category);
  const contentType = inferXhsContentType(category, desc, title);
  const hotScore = computeXhsHotScore({
    likedCount,
    collectedCount,
    commentCount,
    shareCount,
  });

  return {
    id: `xhs-${noteId}`,
    noteId,
    title: title || desc.slice(0, 24),
    desc: desc.slice(0, 500),
    images: images.slice(0, 9),
    authorName: pickStr(user, ["nickname", "name", "user_name"]) || "小红书创作者",
    authorAvatar: pickStr(user, ["avatar", "image", "avatar_url"]),
    likedCount,
    collectedCount,
    commentCount,
    shareCount,
    tags,
    category,
    audience,
    contentType,
    hotScore,
    source: "xiaohongshu",
    createdAt: parseCreatedAt(raw as Record<string, unknown>),
  };
}

/** 从搜索列表批量 normalize */
export function normalizeXhsNoteList(rawInput: unknown): XhsHotNote[] {
  const payload = unwrapTikHubPayload(rawInput);
  const list =
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.notes) && payload.notes) ||
    (Array.isArray(payload.note_list) && payload.note_list) ||
    (Array.isArray(payload.data) && payload.data) ||
    [];

  const out: XhsHotNote[] = [];
  const seen = new Set<string>();

  for (const item of list) {
    const wrapped =
      item && typeof item === "object" && (item as Record<string, unknown>).note
        ? (item as Record<string, unknown>).note
        : item;
    const note = normalizeXhsNote(wrapped);
    if (!note || seen.has(note.noteId)) continue;
    seen.add(note.noteId);
    out.push(note);
  }
  return out;
}
