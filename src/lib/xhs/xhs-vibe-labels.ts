import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

/** 卡片氛围标签：按内容分类，不按性别 */
const CATEGORY_VIBE: Record<XhsNoteCategory, string> = {
  治愈日常: "生活感",
  情绪文案: "生活感",
  城市生活: "城市感",
  咖啡生活: "生活感",
  朋友圈文案: "朋友圈体",
  旅行出片: "周末碎片",
  美食打卡: "周末碎片",
  穿搭变美: "OOTD灵感",
  宠物萌系: "萌宠",
  职场嘴替: "打工人",
};

export function formatXhsVibeLabel(note: XhsHotNote): string {
  return CATEGORY_VIBE[note.category] ?? "日常向";
}
