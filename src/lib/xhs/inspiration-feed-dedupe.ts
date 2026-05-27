import type { XhsHotNote } from "@/lib/xhs/types";
import { baseXhsNoteId } from "@/lib/xhs/inspiration-pool";
import {
  buildMomentsCardCopy,
  buildXhsCardCopy,
} from "@/lib/xhs/xhs-display-copy";
import { applyUniqueXhsCovers, xhsCoverFingerprint } from "@/lib/xhs/xhs-unique-covers";

type InspirationPlatformFilter = "all" | "xhs" | "moments";

/** 各灵感 Tab 至少展示条数 */
export const XHS_TAB_FEED_MIN = 100;

/** 单 Tab 去重后上限 */
export const XHS_TAB_FEED_MAX = 100;

/** 与卡片实际渲染文案一致，用于去重 */
function cardHeadline(
  note: XhsHotNote,
  platform: InspirationPlatformFilter
): string {
  if (platform === "moments") {
    return buildMomentsCardCopy(note).headline.trim();
  }
  return buildXhsCardCopy(note).headline.trim();
}

/** 列表去重用封面指纹（含 cover-seed 路径） */
export function inspirationCoverFingerprint(note: XhsHotNote): string {
  for (const img of note.images) {
    if (!img) continue;
    if (img.includes("/api/cover-seed/")) {
      const m = img.match(/\/api\/cover-seed\/([^/?]+)/);
      if (m?.[1]) return decodeURIComponent(m[1]);
    }
    if (!img.startsWith("/images/hot/")) {
      return xhsCoverFingerprint(img);
    }
  }
  return (note.noteId || note.id || "note").replace(/~/g, "_");
}

function engagementFingerprint(note: XhsHotNote): string {
  return `${note.likedCount}|${note.collectedCount}|${note.commentCount}`;
}

/**
 * 灵感 Tab 展示去重：标题、封面、互动数据均不重复
 */
export function dedupeInspirationTabNotes(
  notes: XhsHotNote[],
  max = XHS_TAB_FEED_MAX,
  platform: InspirationPlatformFilter = "all"
): XhsHotNote[] {
  const sorted = [...notes].sort((a, b) => b.hotScore - a.hotScore);
  const picked: XhsHotNote[] = [];
  const seenId = new Set<string>();
  const seenHeadline = new Set<string>();
  const seenCover = new Set<string>();
  const seenEngagement = new Set<string>();

  const tryPick = (n: XhsHotNote): boolean => {
    if (seenId.has(n.noteId)) return false;

    const headline = cardHeadline(n, platform).slice(0, 28);
    if (!headline || seenHeadline.has(headline)) return false;

    const coverFp = inspirationCoverFingerprint(n);
    if (seenCover.has(coverFp)) return false;

    const engFp = engagementFingerprint(n);
    if (seenEngagement.has(engFp)) return false;

    picked.push(n);
    seenId.add(n.noteId);
    seenHeadline.add(headline);
    seenCover.add(coverFp);
    seenEngagement.add(engFp);
    return true;
  };

  for (const n of sorted) {
    if (picked.length >= max) break;
    tryPick(n);
  }

  if (picked.length < max) {
    for (const n of sorted) {
      if (picked.length >= max) break;
      if (seenId.has(n.noteId)) continue;

      const headline = cardHeadline(n, platform).slice(0, 28);
      if (seenHeadline.has(headline)) continue;

      const coverFp = inspirationCoverFingerprint(n);
      if (seenCover.has(coverFp)) continue;

      picked.push(n);
      seenId.add(n.noteId);
      seenHeadline.add(headline);
      seenCover.add(coverFp);
    }
  }

  return applyUniqueXhsCovers(picked);
}

/** 扩展池克隆条目的互动数，避免卡片数据一模一样 */
export function jitterInspirationEngagement(
  note: XhsHotNote,
  variantKey: string
): Pick<XhsHotNote, "likedCount" | "collectedCount" | "commentCount" | "shareCount"> {
  let h = 0;
  for (let i = 0; i < variantKey.length; i++) {
    h = (h * 31 + variantKey.charCodeAt(i)) >>> 0;
  }
  const likeMul = 0.68 + (h % 53) / 100;
  const colMul = 0.62 + ((h >> 6) % 57) / 100;
  const comMul = 0.7 + ((h >> 12) % 47) / 100;
  const shareMul = 0.65 + ((h >> 18) % 59) / 100;

  return {
    likedCount: Math.max(120, Math.round(note.likedCount * likeMul)),
    collectedCount: Math.max(80, Math.round(note.collectedCount * colMul)),
    commentCount: Math.max(8, Math.round(note.commentCount * comMul)),
    shareCount: Math.max(5, Math.round((note.shareCount || 0) * shareMul)),
  };
}

export function baseNoteIdForDedupe(noteId: string): string {
  return baseXhsNoteId(noteId);
}
