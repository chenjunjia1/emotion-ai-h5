import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

const MOMENTS_CATEGORIES = new Set<XhsNoteCategory>([
  "治愈日常",
  "情绪文案",
  "咖啡生活",
  "城市生活",
  "朋友圈文案",
  "职场嘴替",
]);

const MOMENTS_HINT =
  /朋友圈|心情|今日|状态|碎碎念|记录|日常|松弛|治愈|周末|小确幸|氛围|文案|一句话/;

/** 这条笔记适不适合改写成朋友圈短文案（0–100） */
export function scoreMomentsFit(note: XhsHotNote): number {
  let score = 0;
  const text = `${note.title} ${note.desc}`;

  if (MOMENTS_CATEGORIES.has(note.category)) score += 28;
  if (note.contentType === "朋友圈文案") score += 22;
  if (MOMENTS_HINT.test(text)) score += 18;

  const copyLen = (note.desc.trim() || note.title.trim()).length;
  if (copyLen >= 6 && copyLen <= 60) score += 22;
  else if (copyLen <= 100) score += 12;
  else if (copyLen > 180) score -= 12;

  score += Math.min(Math.round(note.shareCount / 200), 8);
  score += Math.min(Math.round(note.collectedCount / 500), 6);

  return score;
}

export function isMomentsFriendlyNote(note: XhsHotNote, minScore = 22): boolean {
  return scoreMomentsFit(note) >= minScore;
}

/** 朋友圈 Tab 专用池：按适配分排序，保证有内容 */
export function filterMomentsNotes(notes: XhsHotNote[], max = 24): XhsHotNote[] {
  const scored = notes
    .map((n) => ({ n, s: scoreMomentsFit(n) }))
    .sort((a, b) => b.s - a.s);

  let pool = scored.filter((x) => x.s >= 22).map((x) => x.n);

  if (pool.length < 6) {
    pool = scored.filter((x) => x.s >= 12).map((x) => x.n);
  }

  if (pool.length < 4) {
    pool = notes.filter((n) =>
      ["治愈日常", "情绪文案", "咖啡生活", "城市生活"].includes(n.category)
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

/** 从笔记里抽一句「朋友圈秒发」预览（不暴露完整原文） */
export function extractMomentsPreview(note: XhsHotNote): string {
  const desc = note.desc.trim().replace(/\s+/g, " ");
  if (desc.length >= 8 && desc.length <= 36) {
    return desc.slice(0, 32);
  }

  const templates: Record<XhsNoteCategory, string[]> = {
    治愈日常: ["今天也要好好生活", "允许自己慢下来", "普通的一天也很可爱"],
    情绪文案: ["有些情绪不必解释", "说到心坎里的一句话", "今天的心情写在风里"],
    咖啡生活: ["一杯咖啡治愈下午", "窗边的慢时光", "今日份松弛感"],
    城市生活: ["下班路上的小风景", "城市里的温柔瞬间", "随手记录今日"],
    职场嘴替: ["打工人今日状态", "上班摸鱼文学", "打工人的内心 OS"],
    美食打卡: ["今日胃想被治愈", "好吃就要分享", "一口入魂的日常"],
    穿搭变美: ["今日 outfit 记录", "简单穿搭也很出片"],
    宠物萌系: ["今日吸猫成就达成", "毛孩子治愈一切"],
    旅行出片: ["周末出逃计划", "在路上收集快乐"],
    朋友圈文案: ["今日状态：在线", "生活碎片 +1"],
  };

  const pool = templates[note.category] ?? templates.治愈日常;
  let h = 0;
  for (let i = 0; i < note.noteId.length; i++) h = (h * 31 + note.noteId.charCodeAt(i)) >>> 0;
  return pool[h % pool.length]!;
}
