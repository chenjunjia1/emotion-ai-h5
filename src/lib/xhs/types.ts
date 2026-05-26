export type XhsAudience = "女生爱发" | "男生爱发" | "通用";

export type XhsContentType = "小红书图文" | "朋友圈文案" | "抖音短文案";

export type XhsNoteCategory =
  | "美食打卡"
  | "穿搭变美"
  | "宠物萌系"
  | "旅行出片"
  | "城市生活"
  | "治愈日常"
  | "情绪文案"
  | "职场嘴替"
  | "咖啡生活"
  | "朋友圈文案";

/** 清洗后的小红书热门图文灵感 */
export type XhsHotNote = {
  id: string;
  noteId: string;
  title: string;
  desc: string;
  images: string[];
  authorName: string;
  authorAvatar: string;
  likedCount: number;
  collectedCount: number;
  commentCount: number;
  shareCount: number;
  tags: string[];
  category: XhsNoteCategory;
  audience: XhsAudience;
  contentType: XhsContentType;
  hotScore: number;
  source: "xiaohongshu";
  createdAt: string;
  /** 管理后台指定：出现在首页 TOP1/2/3 */
  homeTop3Slot?: 1 | 2 | 3;
  /** 管理后台覆盖：用户端卡片展示标题（不设则自动生成） */
  displayHeadline?: string;
  /** 管理后台覆盖：用户端卡片副文案 */
  displaySubline?: string;
};

export type XhsHotNotesResponse = {
  success: boolean;
  data: XhsHotNote[];
  cached?: boolean;
  cachedAt?: string;
  /** 与 Supabase xhs_hot_notes_daily.fetched_at 一致，后台保存后变化 */
  dataRevision?: string;
  message?: string;
};

export type XhsHotNotesMetaResponse = {
  dataRevision: string | null;
  dateKey: string;
};
