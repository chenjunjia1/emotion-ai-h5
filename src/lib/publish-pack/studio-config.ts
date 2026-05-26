import type { RestyleOption } from "@/lib/publish-pack/quick-package-types";

/** 灵感消耗（与产品 spec 对齐，可在 Admin 展示） */
export const STUDIO_QUOTA = {
  fullPackage: 30,
  regenCopy: 10,
  regenImages: 20,
  premiumCover: 30,
  openaiPremiumImage: 50,
} as const;

/** Pro 每日免费额度 */
export const PRO_DAILY_IMAGE_GRANTS = {
  regularImages: 3,
  premiumCovers: 5,
} as const;

export const INSPIRATION_CHIP_POOL = [
  "深夜emo",
  "班味很重的一天",
  "发疯但不内耗",
  "情绪价值拉满",
  "下班躺平仪式感",
  "夜宵治愈时刻",
  "citywalk随手拍",
  "今日生活碎片",
  "打工人嘴替",
  "i人轻社交日常",
  "小红书种草",
  "朋友圈高级感",
  "一个人生活感",
  "猫咪贴贴日常",
  "多巴胺小确幸",
  "租房也要好好活",
  "通勤路上的碎碎念",
  "周末低成本快乐",
  "奶茶续命日常",
  "摆烂但开心的一天",
] as const;

export const GENERATION_STEP_LABELS = [
  "正在理解你的主题",
  "正在分析适合平台",
  "正在生成标题和正文",
  "正在生成小红书风配图",
  "正在计算爆款指数",
  "正在整理可发布图文包",
] as const;

export const RESTYLE_OPTIONS: RestyleOption[] = [
  "改短一点",
  "更高级一点",
  "更温柔一点",
  "更像朋友圈",
  "更像小红书",
  "更适合抖音",
  "更情绪化一点",
  "更像真人写的",
  "更容易引发评论",
];

export const GUESS_PLATFORMS = ["小红书", "抖音", "朋友圈", "视频号", "B站"] as const;
export const GUESS_PERSONALITIES = [
  "温柔治愈感",
  "真实接地气",
  "高级松弛",
  "搞笑嘴替",
  "专业干货",
] as const;
export const GUESS_STYLES = [
  "高级松弛",
  "奶油生活感",
  "情绪共鸣",
  "种草安利",
  "vlog日常",
] as const;
export const GUESS_GOALS = [
  "想被更多人看见",
  "想引发评论互动",
  "想建立个人IP",
  "想种草转化",
] as const;
export const GUESS_IMAGE_STYLES = [
  "小红书奶油风",
  "ins生活感",
  "暖色治愈",
  "高级感静物",
  "城市夜景情绪",
] as const;
