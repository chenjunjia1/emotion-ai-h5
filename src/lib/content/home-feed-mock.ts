/** 首页互动模块 — 模拟数据 + 跳转参数 */

import { COVER_BY_CATEGORY, DEFAULT_COVER_URL } from "@/lib/content/hot-topic-covers";

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
};

function coverForTopic(topic: string, category = "生活"): string {
  for (const [cat, url] of Object.entries(COVER_BY_CATEGORY)) {
    if (topic.includes(cat) || category === cat) return url;
  }
  if (/穿搭|OOTD/i.test(topic)) return COVER_BY_CATEGORY["穿搭"];
  if (/宠物|猫/i.test(topic)) return COVER_BY_CATEGORY["宠物"];
  if (/美食|探店/i.test(topic)) return COVER_BY_CATEGORY["美食"];
  if (/职场|打工/i.test(topic)) return COVER_BY_CATEGORY["职场"];
  if (/情感|共鸣/i.test(topic)) return COVER_BY_CATEGORY["情感"];
  return DEFAULT_COVER_URL;
}

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
    coverImage: coverForTopic("情绪共鸣日常", "情感"),
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
    coverImage: coverForTopic("下班后的治愈时刻", "治愈"),
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
    coverImage: coverForTopic("猫咪治愈瞬间", "宠物"),
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
    coverImage: coverForTopic("平价穿搭反差", "穿搭"),
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
    coverImage: coverForTopic("一人食探店", "美食"),
  },
  {
    id: "t6",
    label: "独处日常vlog",
    emoji: "☕",
    topic: "独处日常vlog",
    contentType: "日常vlog",
    accountType: "生活号",
    style: "松弛",
    platform: "视频号",
    baseUsers: 4900,
    grad: "from-[#C4B5FD] to-[#FF7AAE]",
    chip: "慢节奏",
    coverImage: coverForTopic("独处日常vlog", "生活"),
  },
  {
    id: "t7",
    label: "职场干货口播",
    emoji: "💼",
    topic: "打工人效率提升",
    contentType: "干货口播",
    accountType: "职场号",
    style: "实用",
    platform: "抖音",
    baseUsers: 4600,
    grad: "from-[#93C5FD] to-[#6366F1]",
    chip: "收藏向",
    coverImage: coverForTopic("打工人效率提升", "职场"),
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
    coverImage: coverForTopic("平价好物种草", "生活"),
  },
];

export const AI_SUGGEST_TAG_POOL: AiSuggestTag[] = [
  { id: "s1", label: "情绪类", topic: "情绪共鸣日常", accountType: "情感号", style: "情绪共鸣", emoji: "💗", chipClass: "from-[#FFF0F5] to-[#FFE8F0] text-[#FF4F8B] ring-[#FFD0E8]" },
  { id: "s2", label: "治愈类", topic: "下班后的治愈时刻", accountType: "治愈号", style: "松弛", emoji: "🌙", chipClass: "from-[#FFF8F0] to-[#FFF3E8] text-[#FF9A4D] ring-[#FFE0C8]" },
  { id: "s3", label: "反差类", topic: "普通人30天改变", accountType: "成长号", style: "反差", emoji: "⚡", chipClass: "from-[#F5F3FF] to-[#EDE9FE] text-[#7C3AED] ring-[#DDD6FE]" },
  { id: "s4", label: "宠物萌趣类", topic: "猫咪治愈瞬间", accountType: "宠物号", style: "温柔", emoji: "🐾", chipClass: "from-[#FFF7ED] to-[#FFEDD5] text-[#EA580C] ring-[#FED7AA]" },
  { id: "s5", label: "下班vlog类", topic: "下班vlog一人食", accountType: "生活号", style: "真实", emoji: "🏠", chipClass: "from-[#ECFEFF] to-[#CFFAFE] text-[#0891B2] ring-[#A5F3FC]" },
  { id: "s6", label: "小红书种草类", topic: "平价好物种草", accountType: "生活号", style: "真实", emoji: "🌸", chipClass: "from-[#FFF0F5] to-[#FFE4EC] text-[#DB2777] ring-[#FBCFE8]" },
  { id: "a1", label: "职场成长类", topic: "打工人逆袭故事", accountType: "职场号", style: "实用", emoji: "📈", chipClass: "from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB] ring-[#BFDBFE]" },
  { id: "a2", label: "美食探店类", topic: "宝藏小店探店", accountType: "美食号", style: "真实", emoji: "🍲", chipClass: "from-[#FFF7ED] to-[#FFEDD5] text-[#C2410C] ring-[#FED7AA]" },
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
    coverImage: coverForTopic("一个人也要好好生活", "情感"),
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
    coverImage: coverForTopic("猫咪治愈瞬间", "宠物"),
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
    coverImage: coverForTopic("一人食探店", "美食"),
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
    coverImage: coverForTopic("平价穿搭反差", "穿搭"),
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
    coverImage: coverForTopic("打工人效率提升", "职场"),
  },
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
