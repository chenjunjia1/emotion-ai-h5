/** 首页互动模块 — 模拟数据 + 跳转参数 */

import {
  coverPresetForTopic,
  titleLinesFromCardTitle,
} from "@/lib/content/scene-cover-presets";
import type { ShortVideoCoverPreset, ShortVideoCoverStyle } from "@/lib/content/short-video-covers";
import { inferCoverStyle } from "@/lib/content/short-video-covers";

export type TrendingGeneration = {
  id: string;
  label: string;
  emoji: string;
  topic: string;
  contentType: string;
  accountType: string;
  style: string;
  platform: string;
  baseUsers: number;
  grad: string;
  chip: string;
  coverImage: string;
  coverStyle: ShortVideoCoverStyle;
  coverPreset: ShortVideoCoverPreset;
};

export type AiSuggestTag = {
  id: string;
  label: string;
  topic: string;
  accountType: string;
  style: string;
  emoji: string;
  chipClass: string;
};

export type SuccessCase = {
  id: string;
  accountType: string;
  title: string;
  topic: string;
  style: string;
  views: string;
  likes: string;
  targetUsers: string;
  grad: string;
  coverImage: string;
  coverStyle: ShortVideoCoverStyle;
  coverPreset: ShortVideoCoverPreset;
};

function coverForItem(
  id: string,
  topic: string,
  accountType: string,
  label: string,
  titleLines?: string[]
): { coverImage: string; coverStyle: ShortVideoCoverStyle; coverPreset: ShortVideoCoverPreset } {
  const coverStyle = inferCoverStyle(topic, accountType, label);
  const lines = titleLines ?? [];
  const coverPreset = coverPresetForTopic(topic || label, id, lines, label);
  return {
    coverImage: coverPreset.image,
    coverStyle,
    coverPreset,
  };
}

function trendingPick(
  id: string,
  label: string,
  topic: string,
  rest: Omit<TrendingGeneration, "id" | "label" | "topic" | "coverImage" | "coverStyle" | "coverPreset">
): TrendingGeneration {
  const coverPreset = coverPresetForTopic(topic, id, [], label);
  return {
    id,
    label,
    topic,
    ...rest,
    coverImage: coverPreset.image,
    coverStyle: coverPreset.style,
    coverPreset,
  };
}

/** 首页横滑「大家都在生成」— 封面图与 label 场景一致 */
export const HOME_TRENDING_PICKS: TrendingGeneration[] = [
  trendingPick("ht1", "情绪共鸣文案", "情绪共鸣治愈日常", {
    emoji: "💬",
    contentType: "共鸣",
    accountType: "情感号",
    style: "情绪共鸣",
    platform: "抖音",
    baseUsers: 12300,
    grad: "",
    chip: "",
  }),
  trendingPick("ht2", "下班vlog脚本", "下班后的治愈时刻", {
    emoji: "🌆",
    contentType: "vlog",
    accountType: "治愈号",
    style: "松弛",
    platform: "抖音",
    baseUsers: 8700,
    grad: "",
    chip: "",
  }),
  trendingPick("ht3", "宠物治愈文案", "猫咪治愈瞬间", {
    emoji: "🐱",
    contentType: "萌宠",
    accountType: "宠物号",
    style: "温柔",
    platform: "小红书",
    baseUsers: 7200,
    grad: "",
    chip: "",
  }),
  trendingPick("ht4", "美食探店脚本", "一人食探店", {
    emoji: "🍜",
    contentType: "探店",
    accountType: "美食号",
    style: "真实",
    platform: "抖音",
    baseUsers: 6100,
    grad: "",
    chip: "",
  }),
  trendingPick("ht5", "朋友圈种草文案", "朋友圈种草氛围桌面", {
    emoji: "☕",
    contentType: "种草",
    accountType: "生活号",
    style: "真实",
    platform: "朋友圈",
    baseUsers: 5300,
    grad: "",
    chip: "",
  }),
  trendingPick("ht6", "职场成长干货", "打工人效率提升", {
    emoji: "💼",
    contentType: "干货",
    accountType: "职场号",
    style: "实用",
    platform: "抖音",
    baseUsers: 4800,
    grad: "",
    chip: "",
  }),
];

export const TRENDING_GENERATIONS: TrendingGeneration[] = [
  {
    id: "t1",
    label: "情绪共鸣文案",
    emoji: "💬",
    topic: "情绪共鸣日常",
    contentType: "共鸣文案",
    accountType: "情感号",
    style: "情绪共鸣",
    platform: "抖音",
    baseUsers: 12300,
    grad: "from-[#FF8EC4] to-[#FF5C8A]",
    chip: "刚刚有人在用",
    ...coverForItem("t1", "情绪共鸣日常", "情感号", "情绪共鸣文案", [
      "成年人的崩溃",
      "都是安静的",
    ]),
  },
  {
    id: "t2",
    label: "下班vlog脚本",
    emoji: "🌆",
    topic: "下班后的治愈时刻",
    contentType: "vlog脚本",
    accountType: "治愈号",
    style: "松弛",
    platform: "抖音",
    baseUsers: 8700,
    grad: "from-[#FFB86C] to-[#FF9A4D]",
    chip: "热度上升中",
    ...coverForItem("t2", "下班后的治愈时刻", "治愈号", "下班vlog脚本", [
      "下班后的1小时",
      "才是真正属于自己的",
    ]),
  },
  {
    id: "t3",
    label: "宠物治愈文案",
    emoji: "🐱",
    topic: "猫咪治愈瞬间",
    contentType: "萌宠文案",
    accountType: "宠物号",
    style: "温柔",
    platform: "小红书",
    baseUsers: 7200,
    grad: "from-[#FFC46B] to-[#FF9A6B]",
    chip: "1小时+128人",
    ...coverForItem("t3", "猫咪治愈瞬间", "宠物号", "宠物治愈文案", [
      "猫咪真的能",
      "治愈情绪",
    ]),
  },
  {
    id: "t4",
    label: "穿搭反差脚本",
    emoji: "👗",
    topic: "平价穿搭反差",
    contentType: "穿搭脚本",
    accountType: "穿搭号",
    style: "反差",
    platform: "小红书",
    baseUsers: 6100,
    grad: "from-[#FF9EC4] to-[#FF7AAE]",
    chip: "种草向",
    ...coverForItem("t4", "平价穿搭反差", "穿搭号", "穿搭反差脚本"),
  },
  {
    id: "t5",
    label: "美食探店脚本",
    emoji: "🍜",
    topic: "一人食探店",
    contentType: "探店脚本",
    accountType: "美食号",
    style: "真实",
    platform: "抖音",
    baseUsers: 5800,
    grad: "from-[#FFD4A8] to-[#FF9A4D]",
    chip: "本地生活",
    ...coverForItem("t5", "一人食探店", "美食号", "美食探店脚本", [
      "一人食火锅",
      "也是治愈时刻",
    ]),
  },
  {
    id: "t6",
    label: "朋友圈种草文案",
    emoji: "🌸",
    topic: "朋友圈种草日常",
    contentType: "种草文案",
    accountType: "生活号",
    style: "真实",
    platform: "朋友圈",
    baseUsers: 5300,
    grad: "from-[#FDA4AF] to-[#FF4F8B]",
    chip: "生活好物",
    ...coverForItem("t6", "朋友圈种草", "生活号", "朋友圈种草文案", [
      "周末桌面",
      "氛围感摆拍",
    ]),
  },
  {
    id: "t7",
    label: "职场成长干货",
    emoji: "💼",
    topic: "打工人效率提升",
    contentType: "干货口播",
    accountType: "职场号",
    style: "实用",
    platform: "抖音",
    baseUsers: 4800,
    grad: "from-[#93C5FD] to-[#6366F1]",
    chip: "收藏向",
    ...coverForItem("t7", "打工人效率提升", "职场号", "职场成长干货", [
      "打工人桌面",
      "效率提升3招",
    ]),
  },
  {
    id: "t8",
    label: "小红书种草笔记",
    emoji: "📒",
    topic: "平价好物种草",
    contentType: "种草笔记",
    accountType: "生活号",
    style: "真实",
    platform: "小红书",
    baseUsers: 4300,
    grad: "from-[#FDA4AF] to-[#FF4F8B]",
    chip: "图文向",
    ...coverForItem("t8", "平价好物种草", "生活号", "小红书种草笔记"),
  },
];

/** 首页默认展示的标签（与效果图一致） */
export const HOME_AI_SUGGEST_TAGS: AiSuggestTag[] = [
  { id: "s1", label: "情绪共鸣", topic: "情绪共鸣日常", accountType: "情感号", style: "情绪共鸣", emoji: "💗", chipClass: "from-[#FFF0F5] to-[#FFE8F0] text-[#FF4F8B] ring-[#FFD0E8]" },
  { id: "s2", label: "治愈向", topic: "下班后的治愈时刻", accountType: "治愈号", style: "松弛", emoji: "🌙", chipClass: "from-[#FAF5FF] to-[#F3E8FF] text-[#9333EA] ring-[#E9D5FF]" },
  { id: "s3", label: "搞笑反转", topic: "打工人搞笑日常", accountType: "生活号", style: "搞笑", emoji: "😂", chipClass: "from-[#FFFBEB] to-[#FEF9C3] text-[#CA8A04] ring-[#FEF08A]" },
  { id: "s4", label: "宠物萌趣", topic: "猫咪治愈瞬间", accountType: "宠物号", style: "温柔", emoji: "🐾", chipClass: "from-[#FFF7ED] to-[#FFEDD5] text-[#C2410C] ring-[#FED7AA]" },
  { id: "s5", label: "下班vlog", topic: "下班vlog一人食", accountType: "生活号", style: "真实", emoji: "🏠", chipClass: "from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" },
  { id: "s6", label: "小红书种草", topic: "平价好物种草", accountType: "生活号", style: "真实", emoji: "🌸", chipClass: "from-[#FFF0F5] to-[#FFE4EC] text-[#BE185D] ring-[#FBCFE8]" },
  { id: "a2", label: "探店美食", topic: "宝藏小店探店", accountType: "美食号", style: "真实", emoji: "🍲", chipClass: "from-[#FFF8F0] to-[#FFF3E8] text-[#FF9A4D] ring-[#FFE0C8]" },
  { id: "a4", label: "穿搭种草", topic: "百元穿搭出片", accountType: "穿搭号", style: "高级", emoji: "👠", chipClass: "from-[#FFF0F5] to-[#FFE4EC] text-[#BE185D] ring-[#FBCFE8]" },
];

export const AI_SUGGEST_TAG_POOL: AiSuggestTag[] = [
  ...HOME_AI_SUGGEST_TAGS,
  { id: "s3x", label: "反差类", topic: "普通人30天改变", accountType: "成长号", style: "反差", emoji: "⚡", chipClass: "" },
  { id: "a1", label: "职场成长类", topic: "打工人逆袭故事", accountType: "职场号", style: "实用", emoji: "📈", chipClass: "from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" },
  { id: "a2b", label: "美食探店类", topic: "宝藏小店探店", accountType: "美食号", style: "真实", emoji: "🍲", chipClass: "from-[#FFF7ED] to-[#FFEDD5] text-[#C2410C] ring-[#FED7AA]" },
  { id: "a3", label: "学习打卡类", topic: "30天自律改变", accountType: "学生号", style: "实用", emoji: "📚", chipClass: "from-[#F0FDF4] to-[#DCFCE7] text-[#16A34A] ring-[#BBF7D0]" },
  { id: "a4", label: "穿搭种草类", topic: "百元穿搭出片", accountType: "穿搭号", style: "高级", emoji: "👠", chipClass: "from-[#FFF0F5] to-[#FFE4EC] text-[#BE185D] ring-[#FBCFE8]" },
  { id: "a5", label: "情感治愈类", topic: "一个人也要好好生活", accountType: "情感号", style: "温柔", emoji: "🫶", chipClass: "from-[#FFF0F5] to-[#FFE8F0] text-[#FF4F8B] ring-[#FFD0E8]" },
  { id: "a6", label: "副业搞钱类", topic: "普通人副业实录", accountType: "成长号", style: "真实", emoji: "💰", chipClass: "from-[#FFFBEB] to-[#FEF3C7] text-[#D97706] ring-[#FDE68A]" },
  { id: "a7", label: "宝妈日常类", topic: "宝妈一天真实记录", accountType: "宝妈号", style: "温柔", emoji: "👶", chipClass: "from-[#FFF0F5] to-[#FFE8F0] text-[#EC4899] ring-[#FBCFE8]" },
  { id: "a8", label: "探店vlog类", topic: "人均50宝藏小店", accountType: "探店号", style: "搞笑", emoji: "📍", chipClass: "from-[#FFF8F0] to-[#FFF3E8] text-[#FF9A4D] ring-[#FFE0C8]" },
  { id: "a9", label: "口播干货类", topic: "3分钟讲清楚一个点", accountType: "职场号", style: "实用", emoji: "🎙️", chipClass: "from-[#F8FAFC] to-[#F1F5F9] text-[#475569] ring-[#E2E8F0]" },
  { id: "a10", label: "氛围感日常", topic: "周末慢生活记录", accountType: "生活号", style: "高级", emoji: "✨", chipClass: "from-[#FAF5FF] to-[#F3E8FF] text-[#9333EA] ring-[#E9D5FF]" },
  { id: "a11", label: "搞笑反转类", topic: "打工人搞笑日常", accountType: "生活号", style: "搞笑", emoji: "😂", chipClass: "from-[#FFFBEB] to-[#FEF9C3] text-[#CA8A04] ring-[#FEF08A]" },
  { id: "a12", label: "起号模板类", topic: "新手7天起号计划", accountType: "成长号", style: "实用", emoji: "🚀", chipClass: "from-[#EFF6FF] to-[#DBEAFE] text-[#1D4ED8] ring-[#BFDBFE]" },
];

export const SUCCESS_CASES: SuccessCase[] = [
  {
    id: "c1",
    accountType: "情感号",
    title: "「一个人也要好好吃饭」共鸣向",
    topic: "一个人也要好好生活",
    style: "情绪共鸣",
    views: "128.6w",
    likes: "8.2w",
    targetUsers: "情感号 · 生活号",
    grad: "from-[#FF8EC4] to-[#FF5C8A]",
    ...coverForItem("c1", "一个人也要好好生活", "情感号", "情感号", [
      "成年人的崩溃",
      "都是安静的",
    ]),
  },
  {
    id: "c2",
    accountType: "宠物号",
    title: "「猫咪治愈瞬间」萌宠日常",
    topic: "猫咪治愈瞬间",
    style: "温柔",
    views: "98.3w",
    likes: "6.5w",
    targetUsers: "宠物号 · 萌宠号",
    grad: "from-[#FFB86C] to-[#FF9A4D]",
    ...coverForItem("c2", "猫咪治愈瞬间", "宠物号", "宠物号", ["猫咪真的能", "治愈情绪"]),
  },
  {
    id: "c3",
    accountType: "美食号",
    title: "「一人食探店」本地生活向",
    topic: "一人食探店",
    style: "真实",
    views: "76.5w",
    likes: "4.1w",
    targetUsers: "美食号 · 探店号",
    grad: "from-[#FF9EC4] to-[#FF7AAE]",
    ...coverForItem("c3", "一人食探店", "美食号", "美食号", [
      "深圳人下班",
      "都吃什么",
    ]),
  },
  {
    id: "c4",
    accountType: "穿搭号",
    title: "「百元穿搭出片」种草向",
    topic: "平价穿搭反差",
    style: "反差",
    views: "65.2w",
    likes: "3.8w",
    targetUsers: "穿搭号 · 种草号",
    grad: "from-[#FFC46B] to-[#FF9A6B]",
    ...coverForItem("c4", "平价穿搭反差", "穿搭号", "穿搭号"),
  },
  {
    id: "c5",
    accountType: "职场号",
    title: "「打工人效率3招」干货口播",
    topic: "打工人效率提升",
    style: "实用",
    views: "53.6w",
    likes: "2.9w",
    targetUsers: "职场号 · 成长号",
    grad: "from-[#A78BFA] to-[#FF7AAE]",
    ...coverForItem("c5", "打工人效率提升", "职场号", "职场号"),
  },
];

function showcaseCase(
  id: string,
  accountType: string,
  title: string,
  topic: string,
  style: string,
  views: string,
  likes: string
): SuccessCase {
  const lines = titleLinesFromCardTitle(title);
  const coverPreset = coverPresetForTopic(topic, id, lines, title);
  return {
    id,
    accountType,
    title,
    topic,
    style,
    views,
    likes,
    targetUsers: accountType,
    grad: "",
    coverImage: coverPreset.image,
    coverStyle: coverPreset.style,
    coverPreset,
  };
}

/** 首页「大家都在用」— 封面图 + 叠字与标题一致 */
export const HOME_SHOWCASE_CASES: SuccessCase[] = [
  showcaseCase(
    "c1",
    "情感号",
    "成年人的崩溃都是安静的",
    "成年人的崩溃都是安静的",
    "情绪共鸣",
    "3.2w",
    "8.2w"
  ),
  showcaseCase("c2", "宠物号", "猫咪真的能治愈情绪", "猫咪治愈瞬间", "温柔", "5.6w", "6.5w"),
  showcaseCase("c3", "美食号", "深圳人下班都吃什么", "深圳人下班都吃什么", "真实", "2.8w", "4.1w"),
];

/** 刷新时随机增加人数，制造动态感 */
export function bumpLiveUsers(base: number): number {
  const pct = 0.02 + Math.random() * 0.07;
  const extra = Math.floor(base * pct) + (Math.floor(Math.random() * 40) + 1);
  return base + extra;
}

export function formatLiveUsers(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function pickRandomSuggestTags(count = 6): AiSuggestTag[] {
  const pool = [...AI_SUGGEST_TAG_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function buildPublishPackHref(opts: {
  topic: string;
  accountType?: string;
  style?: string;
  platform?: string;
  from?: string;
}): string {
  const qs = new URLSearchParams();
  qs.set("topic", opts.topic);
  if (opts.accountType) qs.set("account_type", opts.accountType);
  if (opts.style) qs.set("style", opts.style);
  if (opts.platform) qs.set("platform", opts.platform);
  if (opts.from) qs.set("from", opts.from);
  return `/publish-pack?${qs.toString()}`;
}
