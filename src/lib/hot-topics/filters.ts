import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { looksLikeNewsOrHardToFilm } from "@/lib/hot-topics/youth-content-policy";

/** 关键词黑名单（命中即拒绝，不进入 AI 展示流程） */
export const KEYWORD_BLACKLIST = [
  "习近平",
  "政治",
  "事故",
  "死亡",
  "杀人",
  "诈骗",
  "吸毒",
  "赌博",
  "彩票",
  "暴力",
  "血腥",
  "战争",
  "冲突",
  "偷拍",
  "色情",
  "低俗",
  "网暴",
  "维权",
  "造谣",
  "传销",
  "暴富",
  "稳赚",
  "保本",
  "贷款",
  "疾病",
  "癌症",
  "抑郁",
  "自杀",
  "离婚撕逼",
  "出轨爆料",
  "地震",
  "爆炸",
  "坠机",
  "车祸",
  "枪击",
  "恐怖",
  "腐败",
  "贪污",
  "游行",
  "抗议",
  "台独",
  "港独",
  "分裂",
  "邪教",
  "强奸",
  "裸照",
  "毒品",
  "明星绯闻",
  "恋情曝光",
  "私生子",
  "世界杯",
  "神舟",
  "航天员",
  "通报",
  "发布会",
  "外交部",
  "涨停",
  "跌停",
  "确诊",
  "遇难",
];

const GOSSIP_KEYWORDS = ["离婚", "出轨", "绯闻", "撕逼", "爆料", "整容", "恋情"];

const CREATOR_FRIENDLY = [
  "穿搭",
  "美食",
  "宠物",
  "猫",
  "狗",
  "职场",
  "打工人",
  "下班",
  "治愈",
  "vlog",
  "日常",
  "AI",
  "工具",
  "副业",
  "存钱",
  "成长",
  "学生",
  "宝妈",
  "探店",
  "咖啡",
  "健身",
  "情感",
  "生活",
  "多巴胺",
  "种草",
  "干货",
  "教程",
  "技巧",
  "公式",
];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function matchKeywordBlacklist(title: string, desc = ""): string | null {
  const hay = norm(`${title} ${desc}`);
  if (looksLikeNewsOrHardToFilm(title, desc)) {
    return "新闻/硬资讯类，不适合普通人跟拍";
  }
  for (const k of KEYWORD_BLACKLIST) {
    if (hay.includes(norm(k))) return `命中黑名单关键词：${k}`;
  }
  for (const k of GOSSIP_KEYWORDS) {
    if (hay.includes(norm(k))) return `明星八卦或争议内容：${k}`;
  }
  return null;
}

export function shouldBlockHotTopic(title: string, desc = ""): boolean {
  return matchKeywordBlacklist(title, desc) != null;
}

export function isCreatorFriendly(title: string, desc = ""): boolean {
  const hay = `${title}${desc}`;
  return CREATOR_FRIENDLY.some((k) => hay.includes(k));
}

export function dedupeRawTopics(items: RawHotFromApi[]): RawHotFromApi[] {
  const seen = new Set<string>();
  const out: RawHotFromApi[] = [];
  for (const item of items) {
    const key = item.title.replace(/\s+/g, "").slice(0, 24);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** 仅去重与长度校验；安全过滤在 filter-pipeline 中完成 */
export function filterRawTopics(items: RawHotFromApi[]): RawHotFromApi[] {
  return dedupeRawTopics(items).filter((item) => {
    if (item.title.length < 2 || item.title.length > 48) return false;
    return true;
  });
}

export function prioritizeCreatorTopics(items: RawHotFromApi[]): RawHotFromApi[] {
  return [...items].sort((a, b) => {
    const fa = isCreatorFriendly(a.title, a.desc) ? 1 : 0;
    const fb = isCreatorFriendly(b.title, b.desc) ? 1 : 0;
    return fb - fa || (b.hot ?? 0) - (a.hot ?? 0);
  });
}

export function formatHeatValue(score: number): string {
  if (score >= 1_000_000) return `${(score / 10_000).toFixed(1)}w`;
  if (score >= 10_000) return `${(score / 10_000).toFixed(1)}w`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(Math.max(score, 10));
}

export function parseHeatScore(hot: unknown, fallback = 50000): number {
  if (typeof hot === "number" && Number.isFinite(hot)) return Math.round(hot);
  if (typeof hot === "string") {
    const m = hot.match(/([\d.]+)\s*(万|w|k)?/i);
    if (m) {
      const n = parseFloat(m[1]);
      const u = (m[2] || "").toLowerCase();
      if (u === "万" || u === "w") return Math.round(n * 10_000);
      if (u === "k") return Math.round(n * 1000);
      return Math.round(n);
    }
  }
  return fallback;
}
