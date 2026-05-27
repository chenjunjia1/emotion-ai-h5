import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

const WORK_CATEGORIES = new Set<XhsNoteCategory>(["职场嘴替", "城市生活"]);

const WORK_HINT =
  /上班|职场|打工人|同事|老板|工资|面试|工位|摸鱼|内卷|通勤|开会|加班|述职|ppt|PPT|打工|班味|离职|裸辞|996|周报|汇报/i;

/** 打工人 Tab 适配分 */
export function scoreWorkFit(note: XhsHotNote): number {
  let score = 0;
  const text = `${note.title} ${note.desc} ${note.tags.join(" ")}`;

  if (note.category === "职场嘴替") score += 32;
  if (WORK_CATEGORIES.has(note.category)) score += 12;
  if (WORK_HINT.test(text)) score += 24;
  if (note.contentType === "抖音短文案" && WORK_HINT.test(text)) score += 10;
  if (/治愈|宠物|穿搭|OOTD|美食|探店/.test(text) && !WORK_HINT.test(text)) score -= 14;

  score += Math.min(Math.round(note.commentCount / 300), 8);
  score += Math.min(Math.round(note.shareCount / 150), 6);

  return score;
}

/** 打工人 Tab：优先职场嘴替，不够时用关键词兜底 */
export function filterWorkNotes(notes: XhsHotNote[], max = 100): XhsHotNote[] {
  const scored = notes
    .map((n) => ({ n, s: scoreWorkFit(n) }))
    .sort((a, b) => b.s - a.s);

  let pool = scored.filter((x) => x.s >= 20).map((x) => x.n);

  if (pool.length < 4) {
    pool = scored.filter((x) => x.s >= 10).map((x) => x.n);
  }

  if (pool.length < 3) {
    pool = notes.filter(
      (n) => n.category === "职场嘴替" || WORK_HINT.test(`${n.title} ${n.desc}`)
    );
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
