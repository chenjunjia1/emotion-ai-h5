export const GROUPED_INSPIRATION = {
  情绪嘴替: [
    "深夜emo",
    "班味很重的一天",
    "发疯但不内耗",
    "情绪价值拉满",
  ],
  生活碎片: [
    "下班躺平仪式感",
    "夜宵治愈时刻",
    "citywalk随手拍",
    "今日生活碎片",
  ],
  发圈人设: [
    "打工人嘴替",
    "i人轻社交日常",
    "小红书种草",
    "朋友圈高级感",
  ],
} as const;

/** 发布包输入框默认示例（无 URL topic 时预填） */
export const DEFAULT_PUBLISH_INPUT =
  "今日份快乐已到账，想发条元气满满的日常";

export const INPUT_PLACEHOLDERS = [
  "今天也要好好爱自己，分享生活里的小确幸",
  "周末治愈时刻，想发一条不重样的松弛感日常",
  "把自己照顾好这件事，真的很酷很想记录",
  "普普通通的一天，也值得发一条正能量碎片",
] as const;

export const ADVANCED_PLATFORMS = [
  "小红书",
  "朋友圈",
  "抖音图文",
  "视频号",
  "快手",
  "B站",
] as const;

export const ADVANCED_GOALS = [
  "想被更多人看见",
  "想涨粉",
  "想引发互动",
  "想发得高级一点",
  "想更适合朋友圈",
] as const;

export const ADVANCED_FEELINGS = [
  "温柔治愈",
  "高级松弛",
  "深夜emo",
  "真实碎碎念",
  "打工人嘴替",
  "发疯文学感",
  "i人日常感",
  "朋友圈高级感",
  "小红书博主感",
] as const;

export const ADVANCED_IMG_VIBES = [
  "iPhone随手拍",
  "朋友视角",
  "小红书博主感",
  "咖啡店随拍",
  "夜晚房间",
  "下班路上",
  "生活碎片",
  "CCD氛围感",
] as const;

export const ADVANCED_AVOID = [
  "不要AI感",
  "不要影楼风",
  "不要太鸡汤",
  "不要太营销",
  "不要摆拍",
  "不要塑料皮肤",
  "不要网红滤镜太重",
] as const;

export const IMAGE_COUNT_OPTIONS = [
  {
    count: 1 as const,
    tag: "入门推荐",
    title: "1张图",
    desc: "适合封面 / 朋友圈 / 轻量发一条",
    price: 80,
    detail: "1张高级真实感封面",
  },
  {
    count: 2 as const,
    tag: "最均衡",
    title: "2张图",
    desc: "适合轻量小红书图文",
    price: 100,
    detail: "1张封面 + 1张配图",
  },
  {
    count: 4 as const,
    tag: "完整发布",
    title: "4张图",
    desc: "适合完整小红书笔记",
    price: 140,
    detail: "1张封面 + 3张生活配图",
  },
] as const;
