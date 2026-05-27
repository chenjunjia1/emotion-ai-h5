import type { XhsHotNote } from "@/lib/xhs/types";

import { jitterInspirationEngagement } from "@/lib/xhs/inspiration-feed-dedupe";
import { buildInspirationVariantCopy } from "@/lib/xhs/xhs-display-copy";
import { applyUniqueXhsCovers } from "@/lib/xhs/xhs-unique-covers";



export const INSPIRATION_POOL_TARGET = 300;



/** 灵感卡片跳转用真实 noteId（扩展池带 ~ 后缀） */

export function baseXhsNoteId(noteId: string): string {

  const i = noteId.indexOf("~");

  return i === -1 ? noteId : noteId.slice(0, i);

}



/**

 * 运营库不足时，用已有笔记轮换扩展至目标条数；

 * 每条克隆分配独立标题 + 封面，避免灵感页「全一样」

 */

export function buildInspirationFeedPool(

  notes: XhsHotNote[],

  target = INSPIRATION_POOL_TARGET

): XhsHotNote[] {

  if (!notes.length) return [];

  const sorted = [...notes].sort((a, b) => b.hotScore - a.hotScore);



  const out: XhsHotNote[] = sorted.map((n) => {

    const copy = buildInspirationVariantCopy(n, 0);

    return {

      ...n,

      displayHeadline: copy.displayHeadline,

      displaySubline: copy.displaySubline,

    };

  });



  if (out.length >= target) {

    return ensureUniqueDisplayHeadlines(applyUniqueXhsCovers(out.slice(0, target)));

  }



  let round = 0;

  while (out.length < target) {

    const base = sorted[round % sorted.length]!;

    round += 1;

    const copy = buildInspirationVariantCopy(base, round);

    const variantId = `${base.noteId}~p${round}`;
    const variantSeed = encodeURIComponent(variantId.replace(/~/g, "_"));
    out.push({
      ...base,
      ...jitterInspirationEngagement(base, variantId),
      noteId: variantId,
      id: `${base.id}~p${round}`,
      hotScore: Math.max(5, base.hotScore - (round % 60)),
      displayHeadline: copy.displayHeadline,
      displaySubline: copy.displaySubline,
      images: [
        `/api/cover-seed/${variantSeed}?w=400&h=500`,
        ...base.images.filter((img) => !img.includes("/api/cover-seed/")),
      ],
    });

  }



  return ensureUniqueDisplayHeadlines(applyUniqueXhsCovers(out));

}



/** 扩展池兜底：强制每条展示标题不同 */

function ensureUniqueDisplayHeadlines(notes: XhsHotNote[]): XhsHotNote[] {

  const used = new Set<string>();

  return notes.map((note, i) => {

    let headline = (note.displayHeadline?.trim() || note.title || "灵感").slice(0, 32);

    let n = 1;

    while (used.has(headline)) {

      const suffix = n < 10 ? `·${n}` : `·${i}`;

      headline = `${headline.slice(0, Math.max(8, 32 - suffix.length))}${suffix}`;

      n += 1;

    }

    used.add(headline);

    if (headline === note.displayHeadline) return note;

    return { ...note, displayHeadline: headline };

  });

}

