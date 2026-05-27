import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";
import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { baseXhsNoteId } from "@/lib/xhs/inspiration-pool";
import {
  buildMomentsCardCopy,
  buildXhsCardCopy,
} from "@/lib/xhs/xhs-display-copy";
import { inspirationCoverFingerprint } from "@/lib/xhs/inspiration-feed-dedupe";
import { filterLifeVibeNotes, filterWeekendNotes } from "@/lib/xhs/xhs-life-weekend-fit";
import {
  filterInspirationMomentsNotes,
  scoreMomentsFit,
} from "@/lib/xhs/xhs-moments-fit";
import {
  dedupeInspirationTabNotes,
  XHS_TAB_FEED_MAX,
} from "@/lib/xhs/inspiration-feed-dedupe";
import { applyUniqueXhsCovers, xhsCoverFingerprint } from "@/lib/xhs/xhs-unique-covers";
import { filterWorkNotes } from "@/lib/xhs/xhs-work-fit";

const TAB_POOL_FETCH_MAX = 160;

export type InspirationPlatformFilter = "all" | "xhs" | "moments";

export function filterNotesByInspirationPlatform(
  notes: XhsHotNote[],
  platform: InspirationPlatformFilter
): XhsHotNote[] {
  if (platform === "all") return notes;
  if (platform === "moments") {
    return filterInspirationMomentsNotes(notes, notes.length);
  }
  return notes
    .filter(
      (n) =>
        n.contentType === "小红书图文" ||
        n.contentType === "抖音短文案" ||
        n.category === "穿搭变美" ||
        n.category === "旅行出片"
    )
    .sort((a, b) => b.hotScore - a.hotScore);
}

function inspirationCardHeadline(
  note: XhsHotNote,
  platform: InspirationPlatformFilter
): string {
  if (platform === "moments") {
    return buildMomentsCardCopy(note).headline;
  }
  return note.displayHeadline?.trim() || buildXhsCardCopy(note).headline;
}

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
  const perCatCap = max <= 40 ? 4 : max <= 120 ? 12 : 48;
  const catThrottleAfter = max <= 40 ? 8 : 20;

  const tryPick = (n: XhsHotNote): boolean => {
    const titleKey = (
      n.displayHeadline?.trim() || n.title.trim() || inspirationCardHeadline(n, "all")
    ).slice(0, 16);
    if (seenTitle.has(titleKey)) return false;

    const cover = n.images[0];
    if (cover) {
      const fp = xhsCoverFingerprint(cover);
      if (usedCover.has(fp)) return false;
      usedCover.add(fp);
    }

    const c = catCount.get(n.category) ?? 0;
    if (c >= perCatCap && picked.length >= catThrottleAfter) return false;

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
      const titleKey = (
        n.displayHeadline?.trim() || n.title.trim() || inspirationCardHeadline(n, "all")
      ).slice(0, 16);
      if (seenTitle.has(titleKey)) continue;
      picked.push(n);
      seenTitle.add(titleKey);
    }
  }

  return applyUniqueXhsCovers(picked);
}

/** 首页「今日灵感精选」按后台分类筛选 */
export function filterXhsNotesByCategory(
  notes: XhsHotNote[],
  category: XhsNoteCategory | "all",
  max = 8
): XhsHotNote[] {
  const sorted = [...notes].sort((a, b) => b.hotScore - a.hotScore);
  if (category === "all") return diversifyXhsNotes(sorted, max);
  const pool = sorted.filter((n) => n.category === category);
  return applyUniqueXhsCovers(pool.slice(0, max));
}

/** 灵感页 Feed：分类 + 标题去重，避免扩展池同题刷屏 */
export function filterXhsNotesForInspirationFeed(
  notes: XhsHotNote[],
  category: XhsNoteCategory | "all",
  max: number,
  platform: InspirationPlatformFilter = "all"
): XhsHotNote[] {
  const sorted = [...notes].sort((a, b) => {
    if (platform === "moments") {
      return scoreMomentsFit(b) - scoreMomentsFit(a);
    }
    return b.hotScore - a.hotScore;
  });
  const pool: XhsHotNote[] = [];
  const seenId = new Set<string>();
  const seenHeadline = new Set<string>();

  for (const n of sorted) {
    if (category !== "all" && n.category !== category) continue;
    if (seenId.has(n.noteId)) continue;

    const headline = inspirationCardHeadline(n, platform).slice(0, 24);
    if (seenHeadline.has(headline)) continue;

    seenId.add(n.noteId);
    seenHeadline.add(headline);
    pool.push(n);
    if (pool.length >= max) break;
  }
  return pool;
}

/** 灵感页 Tab 数量（O(n) 单次遍历） */
export function countInspirationFeedByTab(
  notes: XhsHotNote[]
): Map<XhsNoteCategory | "all", number> {
  const m = new Map<XhsNoteCategory | "all", number>();
  m.set("all", notes.length);
  for (const n of notes) {
    m.set(n.category, (m.get(n.category) ?? 0) + 1);
  }
  return m;
}

export function countXhsNotesByCategory(
  notes: XhsHotNote[]
): Map<XhsNoteCategory | "all", number> {
  const m = new Map<XhsNoteCategory | "all", number>();
  m.set("all", notes.length);
  for (const c of notes) {
    m.set(c.category, (m.get(c.category) ?? 0) + 1);
  }
  return m;
}

function supplementTabPool(
  primary: XhsHotNote[],
  all: XhsHotNote[],
  match: (n: XhsHotNote) => boolean
): XhsHotNote[] {
  if (primary.length >= TAB_POOL_FETCH_MAX) return primary;
  const seen = new Set(primary.map((n) => n.noteId));
  const extra: XhsHotNote[] = [];
  const sorted = [...all].sort((a, b) => b.hotScore - a.hotScore);
  for (const n of sorted) {
    if (!match(n)) continue;
    if (seen.has(n.noteId)) continue;
    seen.add(n.noteId);
    extra.push(n);
    if (primary.length + extra.length >= TAB_POOL_FETCH_MAX) break;
  }
  return [...primary, ...extra];
}

/** TikHub 实景封面优先（90/00 后更认真实小红书图） */
export function hasRealXhsCover(note: XhsHotNote): boolean {
  return note.images.some(
    (img) =>
      img.startsWith("http") &&
      !img.includes("/api/cover-seed/") &&
      !img.includes("/images/hot/")
  );
}

function previewPickScore(note: XhsHotNote): number {
  let s = note.hotScore;
  if (hasRealXhsCover(note)) s += 800;
  if (!note.noteId.includes("~")) s += 300;
  return s;
}

/**
 * 灵感页列表前 N 条（与 XhsHotNotesFeed + filterXhsNotesByTab 顺序一致）
 * 首页 TOP3 须用此函数，避免与灵感页前三不一致
 */
export function inspirationFeedHeadNotes(
  notes: XhsHotNote[],
  tab: XhsFeedTab,
  count = 3
): XhsHotNote[] {
  return filterXhsNotesByTab(notes, tab).slice(0, count);
}

/**
 * 首页横滑预览：优先实景图，再严格去重（与列表前三排序不同）
 */
export function inspirationTabRailPreview(
  notes: XhsHotNote[],
  tab: XhsFeedTab,
  count = 8
): XhsHotNote[] {
  const sorted = [...notes].sort((a, b) => previewPickScore(b) - previewPickScore(a));
  const feed = filterXhsNotesByTab(sorted, tab);
  const platform: InspirationPlatformFilter = tab === "moments" ? "moments" : "all";
  const out: XhsHotNote[] = [];
  const seenHeadline = new Set<string>();
  const seenCover = new Set<string>();
  const seenBase = new Set<string>();

  for (const n of feed) {
    if (out.length >= count) break;

    const headline =
      platform === "moments"
        ? buildMomentsCardCopy(n).headline.trim()
        : buildXhsCardCopy(n).headline.trim();
    const cover = inspirationCoverFingerprint(n);
    const base = baseXhsNoteId(n.noteId);

    if (!headline || seenHeadline.has(headline)) continue;
    if (seenCover.has(cover)) continue;
    if (seenBase.has(base)) continue;

    seenHeadline.add(headline);
    seenCover.add(cover);
    seenBase.add(base);
    out.push(n);
  }

  return out;
}

export function filterXhsNotesByTab(
  notes: XhsHotNote[],
  tab: XhsFeedTab,
  max = XHS_TAB_FEED_MAX
): XhsHotNote[] {
  let pool: XhsHotNote[];

  switch (tab) {
    case "hot":
      pool = notes;
      break;
    case "life":
      pool = supplementTabPool(
        filterLifeVibeNotes(notes, TAB_POOL_FETCH_MAX),
        notes,
        (n) =>
          ["治愈日常", "城市生活", "咖啡生活", "情绪文案", "朋友圈文案"].includes(n.category)
      );
      break;
    case "weekend":
      pool = supplementTabPool(
        filterWeekendNotes(notes, TAB_POOL_FETCH_MAX),
        notes,
        (n) =>
          ["旅行出片", "美食打卡", "咖啡生活"].includes(n.category) ||
          /周末|探店|出游|打卡|brunch/i.test(`${n.title} ${n.desc}`)
      );
      break;
    case "xhs":
      pool = notes.filter((n) => n.contentType === "小红书图文");
      break;
    case "moments":
      pool = filterInspirationMomentsNotes(notes, TAB_POOL_FETCH_MAX);
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
      pool = supplementTabPool(
        filterWorkNotes(notes, TAB_POOL_FETCH_MAX),
        notes,
        (n) => n.category === "职场嘴替" || /上班|职场|打工人|工位/i.test(`${n.title} ${n.desc}`)
      );
      break;
    default:
      pool = notes;
  }

  const platform: InspirationPlatformFilter = tab === "moments" ? "moments" : "all";
  if (tab === "hot" || tab === "food" || tab === "fashion" || tab === "pet" || tab === "xhs") {
    return dedupeInspirationTabNotes(
      diversifyXhsNotes(pool, Math.max(max, TAB_POOL_FETCH_MAX)),
      max,
      platform
    );
  }
  return dedupeInspirationTabNotes(pool, max, platform);
}
