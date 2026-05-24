import type { AiProcessedHotTopic, RawHotFromApi } from "@/lib/hot-topics/types";
import { generateWithBudget } from "@/lib/ai/generate-budget";
import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { coverForCategory } from "@/lib/hot-topics/category-covers";
import {
  formatHeatValue,
  isCreatorFriendly,
  parseHeatScore,
} from "@/lib/hot-topics/filters";
import { computeViralScore } from "@/lib/hot-topics/viral-score";

const AI_PROMPT = `你是一个短视频运营选题专家。现在给你一批全网热搜标题，请你筛选出适合普通人用于抖音、小红书、视频号创作的热点。

你需要过滤掉：
政治敏感、负面新闻、灾难事故、暴力犯罪、低俗内容、纯娱乐八卦、普通人难以创作的热点。

你需要优先保留：
情绪共鸣、职场、生活方式、宠物、美食、学生、宝妈、穿搭、探店、AI工具、副业、治愈、成长、反差、日常vlog。

请对每个保留热点输出以下字段：
1. raw_title：原始标题
2. display_title：改写成普通人能拍的短视频选题标题，要求短、吸引人、适合发布
3. summary：热点解读，说明为什么适合拍
4. category：分类
5. tags：标签数组
6. target_users：适合人群数组
7. recommend_angles：推荐切入方向数组
8. viral_score：爆款概率，0-100
9. platform：来源平台

输出要求：
1. 只返回 JSON 数组
2. 不要返回解释文字
3. 每条 display_title 不超过 16 个中文字符
4. viral_score 根据热点热度、创作门槛、共鸣程度综合判断
5. 内容要适合普通人拍摄
6. 不要承诺一定爆
7. 不要包含敏感词

只返回 JSON 对象：{"items":[...]}，items 为数组。`;

function guessCategory(title: string): string {
  if (/AI|工具|脚本|ChatGPT/i.test(title)) return "AI工具";
  if (/穿搭|OOTD|多巴胺|时尚/i.test(title)) return "穿搭";
  if (/宠物|猫|狗|萌宠/i.test(title)) return "宠物";
  if (/美食|探店|咖啡|餐饮/i.test(title)) return "美食";
  if (/职场|打工人|上班|副业/i.test(title)) return "职场";
  if (/宝妈|育儿|宝宝/i.test(title)) return "宝妈";
  if (/学生|校园/i.test(title)) return "学生";
  if (/治愈|下班|生活|vlog/i.test(title)) return "治愈";
  if (/情感|恋爱/i.test(title)) return "情感";
  if (/探店/i.test(title)) return "探店";
  if (/副业|赚钱/i.test(title)) return "副业";
  return "生活";
}

function fallbackRewrite(raw: RawHotFromApi): AiProcessedHotTopic {
  const category = guessCategory(raw.title);
  const heatScore = parseHeatScore(raw.hot);
  const viral = computeViralScore({
    heatScore,
    category,
    title: raw.title,
    platform: raw.platform,
  });

  const displayMap: Record<string, string> = {
    多巴胺: "多巴胺穿搭上镜公式",
    AI: "AI工具帮写短视频脚本",
    下班: "下班后的治愈时刻",
    宠物: "猫咪治愈瞬间",
    猫: "猫咪治愈瞬间",
    存钱: "普通人的30天改变",
  };

  let display = raw.title.slice(0, 16);
  for (const [k, v] of Object.entries(displayMap)) {
    if (raw.title.includes(k)) {
      display = v;
      break;
    }
  }
  if (display === raw.title && raw.title.length > 12) {
    display = `${raw.title.slice(0, 10)}拍摄公式`;
  }

  return {
    raw_title: raw.title,
    display_title: display.slice(0, 16),
    summary: `「${raw.title}」近期热度较高，适合${category}类账号用真实场景切入，普通人今天就能拍。`,
    category,
    tags: [category, "短视频", "普通人"],
    target_users: [`${category}号`, "生活号", "新手创作者"],
    recommend_angles: ["真实记录", "前后对比", "3步干货"],
    viral_score: viral,
    platform: raw.platform,
  };
}

function normalizeAiRow(row: unknown, raw: RawHotFromApi): AiProcessedHotTopic {
  const fb = fallbackRewrite(raw);
  if (!row || typeof row !== "object") return fb;
  const o = row as Record<string, unknown>;
  const display = String(o.display_title ?? fb.display_title).slice(0, 16);
  const category = String(o.category ?? fb.category);
  const heatScore = parseHeatScore(raw.hot);
  const viralRaw = Number(o.viral_score);
  const viral = Number.isFinite(viralRaw)
    ? Math.min(95, Math.max(60, Math.round(viralRaw)))
    : computeViralScore({ heatScore, category, title: raw.title, platform: raw.platform });

  return {
    raw_title: String(o.raw_title ?? raw.title),
    display_title: display,
    summary: String(o.summary ?? fb.summary),
    category,
    tags: Array.isArray(o.tags) ? o.tags.map(String).slice(0, 8) : fb.tags,
    target_users: Array.isArray(o.target_users)
      ? o.target_users.map(String).slice(0, 6)
      : fb.target_users,
    recommend_angles: Array.isArray(o.recommend_angles)
      ? o.recommend_angles.map(String).slice(0, 6)
      : fb.recommend_angles,
    viral_score: viral,
    platform: String(o.platform ?? raw.platform),
  };
}

export async function processHotTopicsWithAi(
  rawList: RawHotFromApi[],
  maxCount = 24
): Promise<AiProcessedHotTopic[]> {
  const picked = rawList
    .filter((r) => isCreatorFriendly(r.title, r.desc) || parseHeatScore(r.hot) >= 80000)
    .slice(0, maxCount);

  const input = picked.length ? picked : rawList.slice(0, maxCount);
  if (input.length === 0) return [];

  try {
    const { result, usedMock } = await generateWithBudget({
      budget: AI_GENERATE_BUDGET.review,
      system: AI_PROMPT,
      user: JSON.stringify(
        input.map((r) => ({
          title: r.title,
          desc: r.desc,
          platform: r.platform,
          hot: r.hot,
        }))
      ),
      mock: () => ({ items: input.map((r) => fallbackRewrite(r)) }),
      normalize: (raw) => {
        const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [];
        return { items };
      },
    });

    const list = (result as { items?: unknown[] }).items ?? [];
    if (usedMock || !list.length) {
      return input.map((r) => fallbackRewrite(r));
    }

    return input.map((raw, i) => normalizeAiRow(list[i], raw));
  } catch (e) {
    console.warn("[processHotTopicsWithAi]", e);
    return input.map((r) => fallbackRewrite(r));
  }
}

export function toInsertRow(
  processed: AiProcessedHotTopic,
  raw: RawHotFromApi,
  batchDate: string,
  rank: number
) {
  const heatScore = parseHeatScore(raw.hot);
  return {
    raw_title: processed.raw_title,
    display_title: processed.display_title,
    summary: processed.summary,
    platform: processed.platform || raw.platform,
    heat_value: formatHeatValue(heatScore),
    heat_score: heatScore,
    cover_image: coverForCategory(processed.category),
    category: processed.category,
    tags: processed.tags,
    target_users: processed.target_users,
    recommend_angles: processed.recommend_angles,
    viral_score: processed.viral_score,
    source_url: raw.url ?? null,
    is_new: rank < 5,
    status: "active" as const,
    updated_batch_date: batchDate,
  };
}
