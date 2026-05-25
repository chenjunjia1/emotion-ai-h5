/** 数据库 hot_topics 行 + API 响应 */
export interface HotTopicRecord {
  id: string;
  raw_title: string;
  display_title: string;
  summary: string;
  platform: string;
  heat_value: string;
  heat_score: number;
  cover_image: string;
  category: string;
  tags: string[];
  target_users: string[];
  recommend_angles: string[];
  viral_score: number;
  source_url: string | null;
  is_new: boolean;
  status: "active" | "inactive" | "rejected";
  reject_reason: string | null;
  safe_score: number;
  content_value_score: number;
  updated_batch_date: string;
  created_at: string;
  updated_at: string;
}

/** 前端 / 旧组件兼容条目 */
export interface HotTopicItem {
  id: string;
  title: string;
  desc: string;
  heat: string;
  track: string;
  format: string;
  coverImage?: string;
  heatValue?: string;
  viralScore?: number;
  platform?: string;
  /** 数据库 platform 字段，用于 Tab 筛选 */
  platformKey?: string;
  angle?: string;
  rawTitle?: string;
  displayTitle?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  targetUsers?: string[];
  recommendAngles?: string[];
  isNew?: boolean;
  sourceUrl?: string;
  updatedBatchDate?: string;
  updatedAt?: string;
}

export type RawHotFromApi = {
  title: string;
  platform: string;
  hot?: number;
  desc?: string;
  url?: string;
};

export type AiProcessedHotTopic = {
  raw_title: string;
  display_title: string;
  summary: string;
  category: string;
  tags: string[];
  target_users: string[];
  recommend_angles: string[];
  viral_score: number;
  platform: string;
};

/** 单次 API 默认拉取条数（分页） */
export const HOT_TOPIC_PAGE_SIZE = 50;
/** 单次请求最大条数 */
export const HOT_TOPIC_API_MAX_LIMIT = 200;
/** @deprecated 旧每日上限，现由 HOT_TOPIC_LIBRARY_MIN 控制库规模 */
export const HOT_TOPIC_LIST_LIMIT = HOT_TOPIC_API_MAX_LIMIT;
export const HOT_TOPIC_TOP_LIMIT = 3;

export const DAILY_HOT_PLATFORMS = [
  "douyin",
  "weibo",
  "baidu",
  "bilibili",
  "toutiao",
  "zhihu",
] as const;

export const PLATFORM_LABEL: Record<string, string> = {
  douyin: "抖音",
  weibo: "微博",
  baidu: "百度",
  bilibili: "B站",
  toutiao: "今日头条",
  zhihu: "知乎",
  kuaishou: "快手",
  xiaohongshu_inspiration: "小红书",
  web: "全网",
};

export function platformToLabel(platform: string): string {
  return PLATFORM_LABEL[platform] ?? platform;
}

export function recordToItem(row: HotTopicRecord): HotTopicItem {
  const heat =
    row.viral_score >= 88 ? "爆" : row.viral_score >= 75 ? "高" : "中";
  return {
    id: row.id,
    title: row.display_title,
    displayTitle: row.display_title,
    rawTitle: row.raw_title,
    desc: row.summary,
    summary: row.summary,
    heat,
    track: row.category,
    category: row.category,
    format: row.platform === "xiaohongshu_inspiration" ? "图文" : "短视频",
    coverImage: row.cover_image,
    heatValue: row.heat_value,
    viralScore: row.viral_score,
    platform: platformToLabel(row.platform),
    platformKey: row.platform,
    angle: row.recommend_angles[0],
    tags: row.tags,
    targetUsers: row.target_users,
    recommendAngles: row.recommend_angles,
    isNew: row.is_new,
    sourceUrl: row.source_url ?? undefined,
    updatedBatchDate: row.updated_batch_date,
    updatedAt: row.updated_at,
  };
}
