import type { AiProcessedHotTopic, RawHotFromApi } from "@/lib/hot-topics/types";
import { generateWithBudget } from "@/lib/ai/generate-budget";
import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { bundledCoverUrl } from "@/lib/content/bundled-cover-assets";
import { resolveSceneCategory } from "@/lib/content/scene-cover-presets";
import {
  dedupeRawTopics,
  formatHeatValue,
  isCreatorFriendly,
  matchKeywordBlacklist,
  parseHeatScore,
} from "@/lib/hot-topics/filters";
import { computeViralScore } from "@/lib/hot-topics/viral-score";
import { PLATFORM_LABEL } from "@/lib/hot-topics/types";
import { looksLikeNewsOrHardToFilm } from "@/lib/hot-topics/youth-content-policy";
import type { HotTopicInsert } from "@/lib/server/db/hot-topics-db";

export const SAFE_SCORE_MIN = 80;
export const CONTENT_VALUE_SCORE_MIN = 60;

export const HOT_TOPIC_AI_FILTER_PROMPT = `你是面向 Z 世代（18-30 岁）的小红书/抖音选题运营专家。
输入来自各平台热榜的「原始热搜」，你要把它变成普通人今天就能拍的「内容选题」，不是新闻摘要。

必须拒绝（is_safe=false）：
时政新闻、社会负面、灾难事故、明星撕逼、医疗恐吓、炒股暴富、硬核科技航天、体育赛事战报、官方通报、普通人无法跟拍的事件。

优先保留并改写：
情绪共鸣、打工人职场、治愈日常、宠物、美食探店、学生校园、宝妈育儿、穿搭OOTD、AI工具、副业、周末vlog、朋友圈种草、宿舍生活、平价好物。

rewritten_title 要求：
- 像小红书封面标题：口语化、有画面感、可跟拍，不超过16字
- 不要保留新闻腔（禁止「通报」「回应」「首次」「破纪录」等）
- 例：原始「航天员太空会师」→ 拒绝；原始「奶茶新品上市」→「平价奶茶拍照攻略」

category 只用：情感、职场、生活、宠物、美食、学生、宝妈、穿搭、探店、AI工具、副业、治愈、成长

输出 JSON：{"items":[...]}，条数与输入一致。每项：
{
  "is_safe": true/false,
  "safe_score": 0-100,
  "content_value_score": 0-100,
  "category": "分类",
  "reject_reason": "",
  "can_publish_reason": "",
  "rewritten_title": ""
}`;

export type HotTopicAiJudgment = {
  is_safe: boolean;
  safe_score: number;
  content_value_score: number;
  category: string;
  reject_reason: string;
  can_publish_reason: string;
  rewritten_title: string;
};

export type FilterPipelineStats = {
  raw: number;
  keywordRejected: number;
  aiRejected: number;
  active: number;
};

const PLATFORM_ANGLES: Record<string, string[]> = {
  douyin: ["跟拍挑战", "卡点转场", "热门BGM"],
  weibo: ["热搜解读", "普通人视角", "共鸣口播"],
  baidu: ["3分钟解读", "搜索热点科普", "信息差"],
  bilibili: ["热点二创", "知识解说", "年轻向盘点"],
  toutiao: ["资讯快评", "清单体干货", "真实记录"],
  zhihu: ["经验分享", "口播回答", "深度拆解"],
};

function clampScore(n: unknown, fallback = 0): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(100, Math.max(0, Math.round(v)));
}

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

function passesDisplayThreshold(j: HotTopicAiJudgment): boolean {
  return (
    j.is_safe &&
    j.safe_score >= SAFE_SCORE_MIN &&
    j.content_value_score >= CONTENT_VALUE_SCORE_MIN
  );
}

function buildSummary(
  raw: RawHotFromApi,
  j: HotTopicAiJudgment,
  category: string
): string {
  const label = PLATFORM_LABEL[raw.platform] ?? raw.platform;
  const reason = j.can_publish_reason?.trim();
  if (reason) {
    return `【${label}热榜·已筛选】${reason}`;
  }
  const angles = PLATFORM_ANGLES[raw.platform] ?? ["真实记录", "3步干货"];
  return `【${label}热榜】「${raw.title}」经安全筛选，适合${category}类账号用${angles[0]}切入创作。`;
}

function judgmentToProcessed(
  raw: RawHotFromApi,
  j: HotTopicAiJudgment
): AiProcessedHotTopic {
  const category = j.category?.trim() || guessCategory(raw.title);
  const heatScore = parseHeatScore(raw.hot);
  const display = (j.rewritten_title || raw.title).slice(0, 16);
  const viral = computeViralScore({
    heatScore,
    category,
    title: display,
    platform: raw.platform,
    contentValueScore: j.content_value_score,
  });
  const angles = PLATFORM_ANGLES[raw.platform] ?? ["真实记录", "前后对比", "3步干货"];

  return {
    raw_title: raw.title,
    display_title: display,
    summary: buildSummary(raw, j, category),
    category,
    tags: [category, PLATFORM_LABEL[raw.platform] ?? raw.platform, "短视频", "AI筛选"],
    target_users: [`${category}号`, "生活号", "新手创作者"],
    recommend_angles: angles,
    viral_score: viral,
    platform: raw.platform,
  };
}

function offlineJudgment(raw: RawHotFromApi): HotTopicAiJudgment {
  const category = guessCategory(raw.title);
  const friendly = isCreatorFriendly(raw.title, raw.desc);
  const safe_score = friendly ? 85 : 72;
  const content_value_score = friendly ? 72 : 55;
  const is_safe = friendly && safe_score >= SAFE_SCORE_MIN && content_value_score >= CONTENT_VALUE_SCORE_MIN;

  let display = raw.title.slice(0, 16);
  if (raw.title.length > 12) display = `${raw.title.slice(0, 10)}拍摄公式`;

  return {
    is_safe,
    safe_score,
    content_value_score,
    category,
    reject_reason: is_safe ? "" : "离线模式：创作价值或安全分不足",
    can_publish_reason: is_safe ? `适合${category}类普通人跟拍创作` : "",
    rewritten_title: display,
  };
}

function normalizeJudgment(row: unknown, raw: RawHotFromApi): HotTopicAiJudgment {
  const fb = offlineJudgment(raw);
  if (!row || typeof row !== "object") return fb;
  const o = row as Record<string, unknown>;
  const safe_score = clampScore(o.safe_score, fb.safe_score);
  const content_value_score = clampScore(o.content_value_score, fb.content_value_score);
  const is_safe = o.is_safe === true || o.is_safe === "true";
  const j: HotTopicAiJudgment = {
    is_safe,
    safe_score,
    content_value_score,
    category: String(o.category ?? fb.category),
    reject_reason: String(o.reject_reason ?? ""),
    can_publish_reason: String(o.can_publish_reason ?? ""),
    rewritten_title: String(o.rewritten_title ?? fb.rewritten_title).slice(0, 16),
  };
  if (!passesDisplayThreshold(j)) {
    j.is_safe = false;
    if (!j.reject_reason) {
      j.reject_reason =
        safe_score < SAFE_SCORE_MIN
          ? "安全分不足"
          : content_value_score < CONTENT_VALUE_SCORE_MIN
            ? "创作价值分不足"
            : "不适合普通人创作发布";
    }
  }
  if (j.is_safe && looksLikeNewsOrHardToFilm(j.rewritten_title, raw.title)) {
    j.is_safe = false;
    j.reject_reason = "改写后仍偏新闻腔，不适合跟拍";
  }
  return j;
}

async function aiJudgeBatch(batch: RawHotFromApi[]): Promise<HotTopicAiJudgment[]> {
  if (batch.length === 0) return [];

  const { result, usedMock } = await generateWithBudget({
    budget: { ...AI_GENERATE_BUDGET.review, maxTokens: 2800 },
    system: HOT_TOPIC_AI_FILTER_PROMPT,
    user: JSON.stringify(
      batch.map((r) => ({
        title: r.title,
        desc: r.desc ?? "",
        platform: r.platform,
        hot: r.hot,
      }))
    ),
    mock: () => ({ items: batch.map((r) => offlineJudgment(r)) }),
    normalize: (raw) => {
      const items = Array.isArray(raw.items) ? raw.items : [];
      return { items };
    },
  });

  const list = (result as { items?: unknown[] }).items ?? [];
  return batch.map((raw, i) => normalizeJudgment(list[i], raw));
}

export function toInsertRowFromFilter(
  processed: AiProcessedHotTopic,
  raw: RawHotFromApi,
  batchDate: string,
  rank: number,
  judgment: HotTopicAiJudgment,
  status: "active" | "rejected"
): HotTopicInsert {
  const heatScore = parseHeatScore(raw.hot);
  return {
    raw_title: processed.raw_title,
    display_title: processed.display_title,
    summary: processed.summary,
    platform: processed.platform || raw.platform,
    heat_value: formatHeatValue(heatScore),
    heat_score: heatScore,
    cover_image: bundledCoverUrl(
      resolveSceneCategory(processed.display_title, processed.category),
      `${batchDate}-${rank}-${processed.display_title}`
    ),
    category: processed.category,
    tags: processed.tags,
    target_users: processed.target_users,
    recommend_angles: processed.recommend_angles,
    viral_score: processed.viral_score,
    source_url: raw.url ?? null,
    is_new: rank < 5 && status === "active",
    status,
    reject_reason: status === "rejected" ? judgment.reject_reason || "未通过筛选" : null,
    safe_score: judgment.safe_score,
    content_value_score: judgment.content_value_score,
    updated_batch_date: batchDate,
  };
}

function rejectedRow(
  raw: RawHotFromApi,
  batchDate: string,
  reason: string,
  safe_score = 0,
  content_value_score = 0
): HotTopicInsert {
  return {
    raw_title: raw.title,
    display_title: raw.title.slice(0, 16),
    summary: "",
    platform: raw.platform,
    heat_value: formatHeatValue(parseHeatScore(raw.hot)),
    heat_score: parseHeatScore(raw.hot),
    cover_image: bundledCoverUrl(
      resolveSceneCategory(raw.title, guessCategory(raw.title)),
      raw.title
    ),
    category: guessCategory(raw.title),
    tags: [],
    target_users: [],
    recommend_angles: [],
    viral_score: 0,
    source_url: raw.url ?? null,
    is_new: false,
    status: "rejected",
    reject_reason: reason,
    safe_score,
    content_value_score,
    updated_batch_date: batchDate,
  };
}

/** 关键词 → AI 安全/创作价值 → 改写；返回可展示 active 与 rejected */
export async function runHotTopicFilterPipeline(
  rawList: RawHotFromApi[],
  batchDate: string,
  opts?: { maxAiItems?: number }
): Promise<{
  active: HotTopicInsert[];
  rejected: HotTopicInsert[];
  processed: AiProcessedHotTopic[];
  stats: FilterPipelineStats;
}> {
  const maxAi = opts?.maxAiItems ?? 72;
  const deduped = dedupeRawTopics(rawList).filter(
    (r) => r.title.length >= 2 && r.title.length <= 48
  );

  const keywordRejected: HotTopicInsert[] = [];
  const pending: RawHotFromApi[] = [];

  for (const raw of deduped) {
    const kw = matchKeywordBlacklist(raw.title, raw.desc);
    if (kw) {
      keywordRejected.push(rejectedRow(raw, batchDate, kw));
      continue;
    }
    pending.push(raw);
  }

  const aiInput = pending.slice(0, maxAi);
  const judgments: HotTopicAiJudgment[] = [];
  const CHUNK = 8;
  for (let i = 0; i < aiInput.length; i += CHUNK) {
    const chunk = aiInput.slice(i, i + CHUNK);
    const part = await aiJudgeBatch(chunk);
    judgments.push(...part);
  }

  const active: HotTopicInsert[] = [];
  const aiRejected: HotTopicInsert[] = [];
  const processed: AiProcessedHotTopic[] = [];
  let activeRank = 0;

  for (let i = 0; i < aiInput.length; i++) {
    const raw = aiInput[i]!;
    const j = judgments[i] ?? offlineJudgment(raw);

    if (!passesDisplayThreshold(j)) {
      const reason =
        j.reject_reason ||
        (j.safe_score < SAFE_SCORE_MIN
          ? "安全分不足"
          : j.content_value_score < CONTENT_VALUE_SCORE_MIN
            ? "创作价值分不足"
            : "AI判定不适合发布");
      aiRejected.push(
        rejectedRow(raw, batchDate, reason, j.safe_score, j.content_value_score)
      );
      continue;
    }

    const p = judgmentToProcessed(raw, j);
    processed.push(p);
    active.push(toInsertRowFromFilter(p, raw, batchDate, activeRank++, j, "active"));
  }

  return {
    active,
    rejected: [...keywordRejected, ...aiRejected],
    processed,
    stats: {
      raw: deduped.length,
      keywordRejected: keywordRejected.length,
      aiRejected: aiRejected.length,
      active: active.length,
    },
  };
}
