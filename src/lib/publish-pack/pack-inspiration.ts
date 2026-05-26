export const GROUPED_INSPIRATION = {
  情绪类: [
    "下班后的治愈时刻",
    "深夜emo",
    "一个人生活感",
    "被生活治愈的一刻",
  ],
  生活类: [
    "周末低成本快乐",
    "咖啡店坐一下午",
    "朋友圈高级感",
    "今日生活碎片",
  ],
  账号类: ["打工人嘴替", "小红书种草", "猫咪贴贴日常", "情绪价值文案"],
} as const;

export const INPUT_PLACEHOLDERS = [
  "今天下班好累，想发一条有松弛感的内容",
  "周末不知道干嘛，想发低成本治愈小事",
  "猫咪今天很粘人，想发一条可爱的日常",
  "想发朋友圈，但不想太刻意",
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
