import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";
import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { filterLifeVibeNotes, filterWeekendNotes } from "@/lib/xhs/xhs-life-weekend-fit";
import { filterMomentsNotes } from "@/lib/xhs/xhs-moments-fit";
import { applyUniqueXhsCovers, xhsCoverFingerprint } from "@/lib/xhs/xhs-unique-covers";
import { filterWorkNotes } from "@/lib/xhs/xhs-work-fit";

export function formatXhsCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** 分类打散 + 标题/封面去重 */
export function diversifyXhsNotes(notes: XhsHotNote[], max = 30): XhsHotNote[] {
  const sorted = [...notes].sort((a, b) => b.hotScore - a.hotScore);
  const picked: XhsHotNote[] = [];
  const catCount = new Map<string, number>();
  const seenTitle = new Set<string>();
  const usedCover = new Set<string>();

  const tryPick = (n: XhsHotNote): boolean => {
    const titleKey = n.title.trim().slice(0, 12);
    if (seenTitle.has(titleKey)) return false;

    const cover = n.images[0];
    if (cover && !cover.startsWith("/")) {
      const fp = xhsCoverFingerprint(cover);
      if (usedCover.has(fp)) return false;
      usedCover.add(fp);
    }

    const c = catCount.get(n.category) ?? 0;
    if (c >= 4 && picked.length >= 8) return false;

    picked.push(n);
    seenTitle.add(titleKey);
    catCount.set(n.category, c + 1);
    return true;
  };

  for (const n of sorted) {
    if (picked.length >= max) break;
    tryPick(n);
  }

  if (picked.length < Math.min(max, sorted.length)) {
    for (const n of sorted) {
      if (picked.length >= max) break;
      if (picked.some((p) => p.noteId === n.noteId)) continue;
      const titleKey = n.title.trim().slice(0, 12);
      if (seenTitle.has(titleKey)) continue;
      picked.push(n);
      seenTitle.add(titleKey);
    }
  }

  return applyUniqueXhsCovers(picked);
}

export function filterXhsNotesByTab(notes: XhsHotNote[], tab: XhsFeedTab): XhsHotNote[] {
  let pool: XhsHotNote[];

  switch (tab) {
    case "hot":
      pool = notes;
      break;
    case "life":
      pool = filterLifeVibeNotes(notes);
      break;
    case "weekend":
      pool = filterWeekendNotes(notes);
      break;
    case "xhs":
      pool = notes.filter((n) => n.contentType === "小红书图文");
      break;
    case "moments":
      pool = filterMomentsNotes(notes);
      break;
    case "food":
      pool = notes.filter((n) => n.category === "美食打卡" || n.category === "咖啡生活");
      break;
    case "fashion":
      pool = notes.filter((n) => n.category === "穿搭变美");
      break;
    case "pet":
      pool = notes.filter((n) => n.category === "宠物萌系");
      break;
    case "work":
      pool = filterWorkNotes(notes);
      break;
    default:
      pool = notes;
  }

  const skipDiversify = tab === "moments" || tab === "life" || tab === "weekend" || tab === "work";
  if (skipDiversify) return applyUniqueXhsCovers(pool);
  return diversifyXhsNotes(pool, tab === "hot" ? 30 : 24);
}
