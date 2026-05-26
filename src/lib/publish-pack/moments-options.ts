/** 创建发布包 — 平台与朋友圈选项 */

/** 轮播 Banner 展示的平台图标（对齐 UI 稿） */
export const BANNER_PLATFORMS = ["抖音", "小红书", "视频号", "快手", "朋友圈"] as const;

export const WIZARD_PLATFORMS = [
  { id: "抖音", desc: "短视频脚本" },
  { id: "小红书", desc: "种草笔记" },
  { id: "视频号", desc: "短视频脚本" },
  { id: "快手", desc: "短视频脚本" },
  { id: "B站", desc: "中长视频脚本" },
  { id: "朋友圈", desc: "朋友圈文案" },
] as const;

export type WizardPlatformId = (typeof WIZARD_PLATFORMS)[number]["id"];

export const MOMENTS_CONTENT_TYPES = [
  { id: "生活分享", desc: "日常/旅行/美食" },
  { id: "种草带货", desc: "产品/探店/好物" },
  { id: "情绪价值", desc: "情感/成长/治愈" },
  { id: "私域引流", desc: "活动/咨询/加微信" },
] as const;

export const MOMENTS_DIRECTIONS = [
  "日常分享",
  "好物推荐",
  "朋友圈成交",
  "情绪共鸣",
  "节日祝福",
  "活动宣传",
  "个人IP",
  "客户维护",
  "探店分享",
  "课程咨询",
] as const;

export const MOMENTS_COPY_FILTERS = ["全部", "生活分享", "种草带货", "情绪价值", "私域引流"] as const;

export const WIZARD_STEPS = ["填写选题与方向", "生成内容"] as const;
