import { DEFAULT_LOCAL_COVER } from "@/lib/content/cover-visuals";
import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

/** 分类 → 本地封面池（远程图重复时轮换 SVG） */
const LOCAL_COVER_POOL: Record<XhsNoteCategory, string[]> = {
  美食打卡: ["/images/hot/food.svg", "/images/hot/shop.svg"],
  穿搭变美: ["/images/hot/fashion.svg", "/images/hot/life.svg"],
  宠物萌系: ["/images/hot/pet.svg", "/images/hot/healing.svg"],
  旅行出片: ["/images/hot/life.svg", "/images/hot/healing.svg"],
  城市生活: ["/images/hot/life.svg", "/images/hot/work.svg", "/images/hot/emotion.svg"],
  治愈日常: ["/images/hot/healing.svg", "/images/hot/life.svg", "/images/hot/emotion.svg"],
  情绪文案: ["/images/hot/emotion.svg", "/images/hot/healing.svg"],
  职场嘴替: ["/images/hot/work.svg", "/images/hot/sidejob.svg", "/images/hot/life.svg"],
  咖啡生活: ["/images/hot/shop.svg", "/images/hot/food.svg", "/images/hot/life.svg"],
  朋友圈文案: ["/images/hot/emotion.svg", "/images/hot/life.svg"],
};

/** 用于跨笔记去重的封面指纹 */
export function xhsCoverFingerprint(url: string): string {
  if (url.includes("/api/cover-seed/")) {
    const m = url.match(/\/api\/cover-seed\/([^/?]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  }
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    const path = u.pathname;
    const parts = path.split("/").filter(Boolean);
    const tail = parts.slice(-2).join("/");
    return tail || path;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function hashNote(noteId: string): number {
  let h = 0;
  for (let i = 0; i < noteId.length; i++) h = (h * 31 + noteId.charCodeAt(i)) >>> 0;
  return h;
}

/** 单条笔记的本地分类封面（封面加载失败时的兜底） */
export function getLocalCoverForNote(note: XhsHotNote): string {
  const pool = LOCAL_COVER_POOL[note.category] ?? [DEFAULT_LOCAL_COVER];
  return pool[hashNote(note.noteId) % pool.length]!;
}

function pickLocalCover(note: XhsHotNote, usedLocals: Set<string>): string {
  const pool = LOCAL_COVER_POOL[note.category] ?? [DEFAULT_LOCAL_COVER];
  const start = hashNote(note.noteId) % pool.length;

  for (let i = 0; i < pool.length; i++) {
    const path = pool[(start + i) % pool.length]!;
    if (!usedLocals.has(path)) {
      usedLocals.add(path);
      return path;
    }
  }

  const fallback = `${pool[0]!}?v=${note.noteId.slice(-6)}`;
  usedLocals.add(fallback);
  return pool[0] ?? DEFAULT_LOCAL_COVER;
}

/** 保证列表内每条笔记封面图不重复；重复则换图或本地 SVG */
export function applyUniqueXhsCovers(notes: XhsHotNote[]): XhsHotNote[] {
  const usedRemote = new Set<string>();
  const usedLocals = new Set<string>();

  return notes.map((note) => {
    let cover: string | undefined;

    for (const img of note.images) {
      const fp = xhsCoverFingerprint(img);
      if (!usedRemote.has(fp)) {
        cover = img;
        usedRemote.add(fp);
        break;
      }
    }

    if (!cover) {
      const seed = encodeURIComponent(note.noteId.replace(/~/g, "_"));
      cover = `/api/cover-seed/${seed}?w=400&h=500`;
    }

    if (cover === note.images[0]) return note;

    const rest = note.images.filter((img) => img !== cover);
    return { ...note, images: [cover, ...rest] };
  });
}
