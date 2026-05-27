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

/** TikHub 额外拉取：朋友圈秒发向（90/00 后语境） */
export const XHS_MOMENTS_FETCH_KEYWORDS = [
  "朋友圈文案",
  "搭子日常",
  "citywalk",
  "演唱会现场",
  "大学生日常",
  "健身打卡",
  "探店奶茶",
  "宠物猫日常",
  "精神状态",
  "周末探店",
  "夜宵美食",
  "摸鱼打工人",
] as const;

/** 灵感池 bulk 拉取：首轮关键词不足 300 条时补搜 */
export const XHS_BULK_EXTRA_KEYWORDS = [
  "护肤",
  "美妆",
  "家居收纳",
  "读书打卡",
  "电影推荐",
  "徒步",
  "露营",
  "减脂餐",
  "早餐",
  "美甲",
  "发型",
  "租房",
  "通勤穿搭",
  "情侣日常",
  "亲子",
  "考研",
  "副业",
  "自律",
  "情绪价值",
  "氛围感拍照",
] as const;

export function mergeXhsFetchKeywords(extra?: string[]): string[] {
  const base = [
    ...XHS_DEFAULT_SEARCH_KEYWORDS,
    ...XHS_MOMENTS_FETCH_KEYWORDS,
    ...(extra ?? []),
  ];
  return [...new Set(base)];
}

/** 运营库 / TikHub 聚合目标条数（灵感页需 ≥300） */
export const XHS_HOT_NOTES_LIMIT = 400;

/** 灵感页单次渲染增量 */
export const XHS_INSPIRATION_PAGE_SIZE = 24;

/** 灵感页单分类最多展示 */
export const XHS_INSPIRATION_CATEGORY_MAX = 360;

export const XHS_CLIENT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const XHS_SERVER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
