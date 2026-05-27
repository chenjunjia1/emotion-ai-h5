import { resolvePublicCoverUrl } from "@/lib/media/normalize-cover-url";
import { isDecorativeCoverUrl } from "@/lib/xhs/rail-cover-style";
import type { XhsHotNote } from "@/lib/xhs/types";
import { xhsCoverDisplayUrl } from "@/lib/xhs/xhs-cover-url";

function pushUnique(out: string[], url: string | undefined) {
  if (!url || isDecorativeCoverUrl(url)) return;
  if (!out.includes(url)) out.push(url);
}

export const RAIL_COVER_W = 208;
export const RAIL_COVER_H = 280;

function coverSeedForNote(note: XhsHotNote): string {
  return encodeURIComponent((note.noteId || note.id || "inspiration").replace(/~/g, "_"));
}

/** 首页横滑：同源小图，跳过小红书代理 */
export function railInspirationCoverUrl(note: XhsHotNote): string {
  return `/api/cover-seed/${coverSeedForNote(note)}?w=${RAIL_COVER_W}&h=${RAIL_COVER_H}`;
}

export type InspirationCoverOptions = {
  /** 首页横滑优先种子图，避免 /api/xhs/cover 阻塞 */
  preferSeed?: boolean;
};

/**
 * 灵感卡片封面候选：池内种子图 → 远程实景 → 按 noteId 唯一种子图
 * 不含 SVG，避免横滑卡出现剪影占位
 */
export function buildInspirationCoverCandidates(
  note: XhsHotNote,
  options?: InspirationCoverOptions
): string[] {
  if (options?.preferSeed) {
    return [railInspirationCoverUrl(note)];
  }

  const out: string[] = [];

  for (const raw of note.images) {
    const pub = resolvePublicCoverUrl(raw);
    if (!pub) continue;
    if (pub.includes("/api/cover-seed/")) {
      pushUnique(out, pub);
      continue;
    }
    pushUnique(out, xhsCoverDisplayUrl(pub));
    if (pub.startsWith("http")) pushUnique(out, pub);
  }

  pushUnique(out, `/api/cover-seed/${coverSeedForNote(note)}?w=400&h=500`);

  return out;
}

export function primaryInspirationCover(note: XhsHotNote): string | undefined {
  const list = buildInspirationCoverCandidates(note);
  return list[0];
}
