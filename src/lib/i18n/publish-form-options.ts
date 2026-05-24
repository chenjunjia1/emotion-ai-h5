/** 发布包 / 复盘页账号类型（UI 展示） */
export const ACCOUNT_TYPE_VALUES = [
  "情感号",
  "治愈号",
  "职场号",
  "宠物号",
  "学生号",
  "宝妈号",
  "穿搭号",
  "美食号",
  "成长号",
  "探店号",
  "生活号",
  "其他",
] as const;

export const PUBLISH_STYLE_VALUES = [
  "温柔",
  "搞笑",
  "情绪共鸣",
  "松弛",
  "高级",
  "真实",
  "反差",
  "实用",
] as const;

export const PUBLISH_GOAL_VALUES = [
  "涨粉",
  "引流",
  "互动",
  "带货",
  "种草",
  "起号",
  "复盘优化",
] as const;

export const PUBLISH_PLATFORM_VALUES = ["抖音", "小红书", "视频号", "快手", "B站"] as const;

export const PUBLISH_TIME_OPTIONS = [
  "早上 6-9点",
  "中午 12-13点",
  "下午 17-19点",
  "晚上 19-22点",
  "深夜 22-24点",
] as const;

export const PLATFORM_EMOJI: Record<string, string> = {
  抖音: "🎵",
  小红书: "📕",
  视频号: "📺",
  快手: "⚡",
  B站: "📺",
};
