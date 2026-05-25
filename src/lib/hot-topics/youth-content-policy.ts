/**
 * Z 世代 / 小红书风选题策略：首页与「今日热点」只展示可拍、可发的灵感，不展示新闻感内容
 */

export const YOUTH_CREATOR_CATEGORIES = [
  "情感",
  "职场",
  "生活",
  "宠物",
  "美食",
  "学生",
  "宝妈",
  "穿搭",
  "探店",
  "AI工具",
  "副业",
  "治愈",
  "成长",
] as const;

/** 命中即倾向拒绝（在关键词黑名单之外补充） */
export const NEWS_LIKE_PATTERNS: RegExp[] = [
  /习近平|总书记|中央|国务院|两会|政协|人大|外交部|国防部/,
  /战争|冲突|制裁|台海|台独|港独|俄乌|以巴|导弹|军演/,
  /地震|爆炸|坠机|车祸|死亡|遇难|伤亡|事故|坍塌|火灾|山洪/,
  /世界杯|欧冠|神舟|航天员|火箭|航母|卫星发射|阅兵/,
  /判决|立案|被查|落马|纪委|法院|检察|拘留|逮捕|走私/,
  /疫情|病毒|确诊|死亡病例|流感暴发/,
  /股价|涨停|跌停|A股|港股|美联储|加息|降准|IPO/,
  /明星.*离婚|出轨|绯闻|撕逼|塌房|应援|饭圈大战/,
  /院士|专家会诊|临床实验|药品获批|集采/,
  /热搜第一|通报|发布会|官方回应|联合声明/,
];

const HARD_NEWS_WORDS =
  /通报|发布会|部委|省政府|全市|全省|全国|通报|首例|破纪录|创历史|创历史新高/;

export function isYouthCreatorCategory(category: string): boolean {
  const c = category.trim();
  return (YOUTH_CREATOR_CATEGORIES as readonly string[]).includes(c);
}

/** 标题是否像「新闻/时政/硬资讯」，不适合年轻人跟拍 */
export function looksLikeNewsOrHardToFilm(title: string, rawTitle = ""): boolean {
  const hay = `${title}${rawTitle}`.trim();
  if (!hay || hay.length < 2) return true;
  if (NEWS_LIKE_PATTERNS.some((re) => re.test(hay))) return true;
  if (HARD_NEWS_WORDS.test(hay) && !/职场|打工|生活|治愈|美食|宠物|穿搭|情感|vlog|日常/i.test(hay)) {
    return true;
  }
  if (/^\d{4}年/.test(hay) && /世界杯|奥运|两会|航天|GDP/i.test(hay)) return true;
  return false;
}

export function isYouthFriendlyHotTopic(item: {
  title?: string;
  displayTitle?: string;
  rawTitle?: string;
  category?: string;
  track?: string;
  platform?: string;
  platformKey?: string;
}): boolean {
  const title = item.displayTitle ?? item.title ?? "";
  const raw = item.rawTitle ?? "";
  const category = item.category ?? item.track ?? "";
  const platform = item.platformKey ?? item.platform ?? "";

  if (looksLikeNewsOrHardToFilm(title, raw)) return false;
  if (isYouthCreatorCategory(category)) return true;
  if (/小红书|xiaohongshu|种草|笔记/i.test(`${platform}${title}`)) return true;
  if (/抖音|douyin/i.test(platform) && !looksLikeNewsOrHardToFilm(title, raw)) return true;
  if (/治愈|vlog|日常|共鸣|穿搭|美食|宠物|职场|情感|探店|副业|AI/i.test(`${title}${category}`)) {
    return true;
  }
  return false;
}

/** 平台采样权重：少采新闻感重的源，多采短视频/社区 */
export const YOUTH_PLATFORM_SAMPLE_LIMIT: Record<string, number> = {
  douyin: 24,
  bilibili: 8,
  zhihu: 6,
  xiaohongshu_inspiration: 10,
  weibo: 6,
  baidu: 4,
  toutiao: 4,
};
