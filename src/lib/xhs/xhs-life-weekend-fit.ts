import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

const LIFE_CATEGORIES = new Set<XhsNoteCategory>([
  "治愈日常",
  "情绪文案",
  "城市生活",
  "咖啡生活",
  "朋友圈文案",
]);

const LIFE_HINT =
  /日常|生活|松弛|慢生活|氛围|随手|记录|小确幸|治愈|窗边|午后|宅家|独居|仪式感|碎片|vlog/i;

const WEEKEND_CATEGORIES = new Set<XhsNoteCategory>(["旅行出片", "美食打卡", "咖啡生活"]);

const WEEKEND_HINT =
  /周末|出游|假期|旅行|探店|打卡|去哪儿|野餐|露营|逛|出片|citywalk|City Walk|一日游|周边游|brunch/i;

function textOf(note: XhsHotNote): string {
  return `${note.title} ${note.desc} ${note.tags.join(" ")}`;
}

export function scoreLifeVibe(note: XhsHotNote): number {
  let score = 0;
  const text = textOf(note);

  if (LIFE_CATEGORIES.has(note.category)) score += 28;
  if (LIFE_HINT.test(text)) score += 20;
  if (note.category === "城市生活" || note.category === "咖啡生活") score += 8;
  if (/旅行|探店|周末/.test(text) && note.category === "旅行出片") score -= 8;

  score += Math.min(Math.round(note.collectedCount / 800), 6);
  return score;
}

export function scoreWeekendVibe(note: XhsHotNote): number {
  let score = 0;
  const text = textOf(note);

  if (WEEKEND_CATEGORIES.has(note.category)) score += 28;
  if (WEEKEND_HINT.test(text)) score += 22;
  if (note.category === "旅行出片") score += 12;
  if (note.category === "美食打卡") score += 10;
  if (/宅家|上班|打工人|工位/.test(text)) score -= 10;

  score += Math.min(Math.round(note.likedCount / 3000), 6);
  return score;
}

function pickScoredNotes(
  notes: XhsHotNote[],
  scoreFn: (n: XhsHotNote) => number,
  minScore: number,
  fallbackMin: number,
  fallbackCategories: XhsNoteCategory[],
  max = 24
): XhsHotNote[] {
  const scored = notes
    .map((n) => ({ n, s: scoreFn(n) }))
    .sort((a, b) => b.s - a.s);

  let pool = scored.filter((x) => x.s >= minScore).map((x) => x.n);

  if (pool.length < 6) {
    pool = scored.filter((x) => x.s >= fallbackMin).map((x) => x.n);
  }

  if (pool.length < 4) {
    pool = notes.filter((n) => fallbackCategories.includes(n.category));
  }

  const seen = new Set<string>();
  const out: XhsHotNote[] = [];
  for (const n of pool) {
    if (seen.has(n.noteId)) continue;
    seen.add(n.noteId);
    out.push(n);
    if (out.length >= max) break;
  }
  return out;
}

/** 生活感：松弛日常、城市漫游、咖啡窗边 */
export function filterLifeVibeNotes(notes: XhsHotNote[], max = 24): XhsHotNote[] {
  return pickScoredNotes(
    notes,
    scoreLifeVibe,
    22,
    12,
    ["治愈日常", "城市生活", "咖啡生活", "情绪文案"],
    max
  );
}

/** 周末碎片：出游、探店、打卡出片 */
export function filterWeekendNotes(notes: XhsHotNote[], max = 24): XhsHotNote[] {
  return pickScoredNotes(
    notes,
    scoreWeekendVibe,
    22,
    12,
    ["旅行出片", "美食打卡", "咖啡生活"],
    max
  );
}
