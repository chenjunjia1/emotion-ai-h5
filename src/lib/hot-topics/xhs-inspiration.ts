import type { AiProcessedHotTopic, RawHotFromApi } from "@/lib/hot-topics/types";
import type { HotTopicInsert } from "@/lib/server/db/hot-topics-db";
import { coverForCategory } from "@/lib/hot-topics/category-covers";
import { formatHeatValue, parseHeatScore } from "@/lib/hot-topics/filters";

/** DailyHotApi 暂无小红书热榜，从全网热点二次加工为小红书灵感 */
export const XHS_INSPIRATION_PLATFORM = "xiaohongshu_inspiration";

const XHS_FRIENDLY_CATEGORIES = new Set([
  "穿搭",
  "美食",
  "探店",
  "治愈",
  "生活",
  "宠物",
  "宝妈",
  "情感",
  "学生",
  "成长",
]);

const XHS_TITLE_SUFFIX: Record<string, string> = {
  穿搭: "｜上镜笔记",
  美食: "｜探店笔记",
  探店: "｜宝藏清单",
  治愈: "｜氛围感日常",
  生活: "｜真实记录",
  宠物: "｜萌宠日记",
  宝妈: "｜育儿日常",
  情感: "｜共鸣瞬间",
  学生: "｜学习打卡",
  成长: "｜改变记录",
};

function xhsDisplayTitle(title: string, category: string): string {
  const base = title.replace(/[|｜].*$/, "").slice(0, 12);
  const suffix = XHS_TITLE_SUFFIX[category] ?? "｜种草笔记";
  return `${base}${suffix}`.slice(0, 16);
}

function isXhsCandidate(p: AiProcessedHotTopic): boolean {
  if (XHS_FRIENDLY_CATEGORIES.has(p.category)) return true;
  const hay = `${p.display_title}${p.summary}${p.tags.join("")}${p.target_users.join("")}`;
  return /小红书|种草|OOTD|探店|氛围|笔记|图文/i.test(hay);
}

export function buildXhsInspirationRows(
  processed: AiProcessedHotTopic[],
  rawList: RawHotFromApi[],
  batchDate: string,
  limit = 6,
  excludeRawTitles: Set<string> = new Set()
): HotTopicInsert[] {
  const pool = processed.filter((p) => !excludeRawTitles.has(p.raw_title.trim()));
  const preferWeb = pool.filter((p) => p.platform !== "douyin");
  const source = preferWeb.length >= limit ? preferWeb : pool;

  const picked = source.filter(isXhsCandidate).slice(0, limit);
  if (picked.length < limit) {
    const seen = new Set(picked.map((p) => p.raw_title));
    for (const p of source) {
      if (picked.length >= limit) break;
      if (seen.has(p.raw_title)) continue;
      seen.add(p.raw_title);
      picked.push(p);
    }
  }

  return picked.map((p, i) => {
    const raw = rawList.find((r) => r.title === p.raw_title) ?? rawList[i] ?? rawList[0];
    const heatScore = Math.round(parseHeatScore(raw?.hot) * 0.92);
    const category = p.category;

    return {
      raw_title: p.raw_title,
      display_title: xhsDisplayTitle(p.display_title, category),
      summary: `${p.summary} 适合小红书图文笔记、九宫格或短 vlog 发布，普通人今天就能拍。`,
      platform: XHS_INSPIRATION_PLATFORM,
      heat_value: formatHeatValue(heatScore),
      heat_score: heatScore,
      cover_image: coverForCategory(category),
      category,
      tags: Array.from(new Set([...p.tags, "小红书", "种草", "图文"])).slice(0, 8),
      target_users: Array.from(
        new Set([...p.target_users, "小红书种草", "生活号", "图文号"])
      ).slice(0, 6),
      recommend_angles: Array.from(
        new Set([...p.recommend_angles.slice(0, 3), "封面标题", "九宫格排版", "评论区钩子"])
      ).slice(0, 6),
      viral_score: Math.min(94, Math.max(68, p.viral_score - 2 + (i % 3))),
      source_url: raw?.url ?? null,
      is_new: i < 3,
      status: "active" as const,
      updated_batch_date: batchDate,
    };
  });
}
