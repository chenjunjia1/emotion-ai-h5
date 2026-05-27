import type { XhsHotNote } from "@/lib/xhs/types";

export type RailCoverStyle = {
  from: string;
  to: string;
  emoji: string;
};

const BY_CATEGORY: Record<string, RailCoverStyle> = {
  美食打卡: { from: "#FFD6A5", to: "#FF9A6B", emoji: "🍜" },
  穿搭变美: { from: "#E8B4FF", to: "#FF9EC4", emoji: "👗" },
  宠物萌系: { from: "#FFE8A3", to: "#FFC46B", emoji: "🐱" },
  旅行出片: { from: "#A8E6CF", to: "#7EC8E3", emoji: "✈️" },
  城市生活: { from: "#C4B5FD", to: "#FF9EC4", emoji: "🏙️" },
  治愈日常: { from: "#FFD6EC", to: "#FFE8F0", emoji: "🌸" },
  情绪文案: { from: "#FFC8DD", to: "#FFAFCC", emoji: "💭" },
  职场嘴替: { from: "#B8C5E8", to: "#9EC5FF", emoji: "💼" },
  咖啡生活: { from: "#E8D4C4", to: "#D4A574", emoji: "☕" },
  朋友圈文案: { from: "#FFE8F0", to: "#FF9EC4", emoji: "💬" },
};

const DEFAULT: RailCoverStyle = { from: "#FFE8F0", to: "#FF9A4D", emoji: "✨" };

export function railCoverStyleForNote(note: XhsHotNote): RailCoverStyle {
  return BY_CATEGORY[note.category] ?? DEFAULT;
}

/** 不作为全屏封面加载的 URL（SVG 插画会显成「剪影」） */
export function isDecorativeCoverUrl(url: string): boolean {
  return url.includes(".svg") || url.startsWith("/images/hot/");
}
