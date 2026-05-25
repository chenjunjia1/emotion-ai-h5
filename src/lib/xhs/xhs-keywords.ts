/** 默认搜索关键词池（服务端拉取热门图文） */
export const XHS_DEFAULT_SEARCH_KEYWORDS = [
  "美食",
  "穿搭",
  "咖啡",
  "旅行",
  "宠物",
  "打工人",
  "职场嘴替",
  "城市生活",
  "朋友圈文案",
  "OOTD",
  "周末去哪儿",
  "上班日常",
] as const;

export const XHS_HOT_NOTES_LIMIT = 30;

export const XHS_CLIENT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const XHS_SERVER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
