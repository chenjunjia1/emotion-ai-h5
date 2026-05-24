import type { RawHotFromApi } from "@/lib/hot-topics/types";

const BLOCK_KEYWORDS = [
  "习近平",
  "政治",
  "战争",
  "地震",
  "死亡",
  "杀人",
  "强奸",
  "色情",
  "裸照",
  "赌博",
  "毒品",
  "恐怖",
  "爆炸",
  "坠机",
  "车祸",
  "枪击",
  "腐败",
  "贪污",
  "游行",
  "抗议",
  "台独",
  "港独",
  "分裂",
  "邪教",
];

const GOSSIP_KEYWORDS = ["离婚", "出轨", "绯闻", "恋情曝光", "明星私生子", "整容"];

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

export function shouldBlockHotTopic(title: string, desc = ""): boolean {
  const hay = norm(`${title} ${desc}`);
  if (BLOCK_KEYWORDS.some((k) => hay.includes(norm(k)))) return true;
  if (GOSSIP_KEYWORDS.some((k) => hay.includes(norm(k)))) return true;
  return false;
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

export function filterRawTopics(items: RawHotFromApi[]): RawHotFromApi[] {
  return dedupeRawTopics(items).filter((item) => {
    if (shouldBlockHotTopic(item.title, item.desc)) return false;
    if (item.title.length < 2 || item.title.length > 40) return false;
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
