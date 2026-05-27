/** 朋友圈创作页 — 提示词与风格 */

export type MomentsTone = "松弛" | "治愈" | "搞笑" | "高级" | "真诚";

export const MOMENTS_TONE_OPTIONS: { id: MomentsTone; label: string; emoji: string }[] = [
  { id: "松弛", label: "松弛感", emoji: "🌿" },
  { id: "治愈", label: "治愈", emoji: "☁️" },
  { id: "搞笑", label: "搞笑", emoji: "😂" },
  { id: "高级", label: "高级感", emoji: "✨" },
  { id: "真诚", label: "走心", emoji: "💬" },
];

export const MOMENTS_PROMPT_CHIPS: { text: string; tag?: string }[] = [
  { text: "下班好累，写条不矫情的朋友圈", tag: "热门" },
  { text: "自拍不露脸，氛围感配文", tag: "热门" },
  { text: "周末躺平自嘲一句", tag: "热门" },
  { text: "探店打卡，自然不硬广", tag: "探店" },
  { text: "健身第一天，轻松记录", tag: "运动" },
  { text: "猫咪闯祸了，可爱吐槽", tag: "萌宠" },
  { text: "奶茶到了，开心但不尬", tag: "日常" },
  { text: "旅行九宫格，简短有画面", tag: "旅行" },
  { text: "生日感谢，不长篇大论", tag: "节日" },
  { text: "加班到深夜，带点幽默", tag: "打工人" },
  { text: "见朋友聚餐，温馨不煽情", tag: "社交" },
  { text: "下雨天宅家，治愈碎碎念", tag: "情绪" },
];

export const MOMENTS_EXAMPLE_SNIPPETS = [
  "「今天不想卷了，只想把生活调成喜欢的滤镜。」",
  "「普通日子，也要发得好看一点。」",
  "「下班路上的风，比咖啡还提神。」",
];
