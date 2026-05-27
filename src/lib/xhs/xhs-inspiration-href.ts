import { buildMomentsCardCopy, buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import { baseXhsNoteId } from "@/lib/xhs/inspiration-pool";
import type { XhsHotNote } from "@/lib/xhs/types";

/** 首页灵感精选 / 热点卡片 → 发布包（小红书图文） */
export function buildXhsInspirationHref(note: XhsHotNote): string {
  const copy = buildXhsCardCopy(note);
  const q = new URLSearchParams({
    platform: "小红书",
    topic: copy.headline.slice(0, 32),
    inspiration_mode: "xhs",
    inspiration_id: baseXhsNoteId(note.noteId),
    inspiration_category: note.category,
  });
  q.set("inspiration_hint", `${copy.angle}；请 AI 原创改写，禁止照搬原文与图片`);
  q.set("from", "inspiration");
  q.set("returnTo", "/inspiration");
  return `/publish-pack?${q.toString()}`;
}

/** 灵感卡片 → 朋友圈文案创作 */
export function buildMomentsInspirationHref(note: XhsHotNote): string {
  const copy = buildMomentsCardCopy(note);
  const q = new URLSearchParams({
    topic: copy.headline.slice(0, 32),
    from: "inspiration",
    inspiration_id: baseXhsNoteId(note.noteId),
  });
  if (copy.subline) q.set("hint", copy.subline.slice(0, 48));
  q.set("from", "inspiration");
  q.set("returnTo", "/inspiration");
  return `/expression/moments?${q.toString()}`;
}
