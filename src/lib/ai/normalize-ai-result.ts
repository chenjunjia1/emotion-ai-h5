import {
  mockPublishPack,
  mockTitleGacha,
  mockTopicBlindBox,
} from "@/lib/mock/content-v1";

function pickString(
  obj: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && !Number.isNaN(v)) return String(v);
  }
  return undefined;
}

function unwrapRecord(raw: Record<string, unknown>): Record<string, unknown> {
  for (const key of ["result", "data", "output", "blindBox", "topicBox", "选题盲盒"]) {
    const nested = raw[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested as Record<string, unknown>;
    }
  }
  return raw;
}

export function normalizeTopicBoxResult(
  raw: Record<string, unknown>,
  input: { platform: string; track: string; goal: string; style: string }
): Record<string, unknown> {
  const fallback = mockTopicBlindBox(input);
  const o = unwrapRecord(raw);

  const topic =
    pickString(o, ["topic", "选题", "title", "titleHint", "主题"]) ?? fallback.topic;

  return {
    ...fallback,
    topic,
    format:
      pickString(o, ["format", "推荐形式", "形式", "contentFormat"]) ?? fallback.format,
    angle:
      pickString(o, ["angle", "切入角度", "角度", "hook", "切入点"]) ?? fallback.angle,
    whyToday:
      pickString(o, [
        "whyToday",
        "为什么今天适合发",
        "why_today",
        "reason",
        "发布理由",
      ]) ?? fallback.whyToday,
    titleHint:
      pickString(o, ["titleHint", "标题提示", "title_hint"]) ?? fallback.titleHint,
    track: pickString(o, ["track", "赛道"]) ?? input.track,
    platform: pickString(o, ["platform", "平台"]) ?? input.platform,
    goal: pickString(o, ["goal", "目标"]) ?? input.goal,
    style: pickString(o, ["style", "风格"]) ?? input.style,
  };
}

export function normalizeTitleGachaResult(
  raw: Record<string, unknown>,
  input: {
    platform: string;
    track: string;
    theme: string;
    style: string;
    goal: string;
  }
): Record<string, unknown> {
  const fallback = mockTitleGacha(input);
  const o = unwrapRecord(raw);

  let titles = o.titles;
  if (!Array.isArray(titles) || titles.length === 0) {
    const fromList = o.titleList ?? o.标题列表;
    if (Array.isArray(fromList)) titles = fromList;
  }

  const normalizedTitles: { text: string; type: string }[] = [];
  if (Array.isArray(titles)) {
    for (let i = 0; i < titles.length; i++) {
      const t = titles[i];
      if (typeof t === "string" && t.trim()) {
        normalizedTitles.push({ text: t.trim(), type: fallback.titles[i % 5]?.type ?? "选题" });
      } else if (t && typeof t === "object") {
        const row = t as Record<string, unknown>;
        const text = pickString(row, ["text", "title", "标题", "content"]);
        if (text) {
          normalizedTitles.push({
            text,
            type: pickString(row, ["type", "类型"]) ?? fallback.titles[i % 5]?.type ?? "选题",
          });
        }
      }
    }
  }

  const safeTitles =
    normalizedTitles.length >= 3 ? normalizedTitles : fallback.titles;

  let recommendedIndex =
    typeof o.recommendedIndex === "number"
      ? o.recommendedIndex
      : typeof o.recommended_index === "number"
        ? o.recommended_index
        : fallback.recommendedIndex;

  if (recommendedIndex < 0 || recommendedIndex >= safeTitles.length) {
    recommendedIndex = Math.min(2, safeTitles.length - 1);
  }

  const recommended =
    pickString(o, ["recommended", "recommendedTitle", "推荐标题", "推荐"]) ??
    safeTitles[recommendedIndex]?.text ??
    safeTitles[0]?.text;

  return {
    ...fallback,
    titles: safeTitles,
    recommendedIndex,
    recommended,
    reason:
      pickString(o, ["reason", "推荐理由", "为什么推荐", "recommendReason"]) ??
      fallback.reason,
    input,
  };
}

export function normalizePublishPackResult(
  raw: Record<string, unknown>,
  input: {
    topic: string;
    platform: string;
    track: string;
    goal: string;
    style: string;
    withXhs?: boolean;
  }
): Record<string, unknown> {
  const fallback = mockPublishPack(input);
  const o = unwrapRecord(raw);

  const topic = pickString(o, ["topic", "选题", "主题"]) ?? input.topic;
  const titlesRaw = o.titles ?? o.标题列表;
  let titles: string[] = fallback.titles as string[];
  if (Array.isArray(titlesRaw) && titlesRaw.length > 0) {
    titles = titlesRaw.map((t) =>
      typeof t === "string" ? t : pickString(t as Record<string, unknown>, ["text", "title"]) ?? ""
    ).filter(Boolean);
  }
  if (titles.length === 0) titles = fallback.titles as string[];

  const commentRepliesRaw = o.commentReplies ?? o.评论回复;
  let commentReplies = fallback.commentReplies as string[];
  if (Array.isArray(commentRepliesRaw) && commentRepliesRaw.length > 0) {
    commentReplies = commentRepliesRaw.map((c) => String(c));
  }

  return {
    ...fallback,
    packName: pickString(o, ["packName", "包名"]) ?? fallback.packName,
    topic,
    platform: pickString(o, ["platform", "平台"]) ?? input.platform,
    track: pickString(o, ["track", "赛道"]) ?? input.track,
    titles,
    recommendedTitle:
      pickString(o, ["recommendedTitle", "推荐标题", "recommended"]) ??
      titles[0] ??
      fallback.recommendedTitle,
    script30s:
      pickString(o, ["script30s", "口播脚本", "script", "脚本"]) ??
      fallback.script30s,
    xhsNote:
      pickString(o, ["xhsNote", "小红书笔记", "xhs", "note"]) ??
      (input.withXhs ? fallback.xhsNote : undefined),
    coverCopy: pickString(o, ["coverCopy", "封面文案"]) ?? fallback.coverCopy,
    firstComment: pickString(o, ["firstComment", "首评"]) ?? fallback.firstComment,
    commentReplies,
    tags: Array.isArray(o.tags)
      ? (o.tags as unknown[]).map(String)
      : fallback.tags,
    publishTime: pickString(o, ["publishTime", "发布时间"]) ?? fallback.publishTime,
    publishTips: pickString(o, ["publishTips", "发布建议"]) ?? fallback.publishTips,
    safetyScore:
      typeof o.safetyScore === "number"
        ? o.safetyScore
        : typeof o.safety_score === "number"
          ? o.safety_score
          : fallback.safetyScore,
    safetyLevel:
      pickString(o, ["safetyLevel", "安全等级"]) ?? fallback.safetyLevel,
  };
}

import { normalizeReviewResult as normalizeReviewShape } from "@/lib/review/result-shape";

export function normalizeReviewResult(raw: Record<string, unknown>): Record<string, unknown> {
  return normalizeReviewShape(raw);
}

/** 从历史 output 中提取主文案（运营顾问 / 树洞等） */
export function pickStringFromOutput(
  output: Record<string, unknown>,
  keys: string[]
): string | undefined {
  return pickString(output, keys);
}

/** 是否为 AI 运营顾问类结果（emotion-chat API 实际返回结构） */
export function isConsultantHistoryOutput(output: Record<string, unknown>): boolean {
  const analysis = pickString(output, ["analysis", "reply", "text", "content"]);
  if (analysis) return true;
  if (Array.isArray(output.todayTopics) && output.todayTopics.length > 0) return true;
  if (Array.isArray(output.titleSuggestions) && output.titleSuggestions.length > 0) return true;
  if (Array.isArray(output.contentStructure) && output.contentStructure.length > 0) return true;
  return false;
}

/** 是否为树洞陪聊结果（text + tags） */
export function isTreeholeHistoryOutput(output: Record<string, unknown>): boolean {
  if (isConsultantHistoryOutput(output)) return false;
  return Boolean(pickString(output, ["text", "reply", "content"]));
}

/** 是否为情绪陪聊类结果（心动值 + 回复话术） */
export function isEmotionHistoryOutput(output: Record<string, unknown>): boolean {
  const replies = output.replies;
  if (Array.isArray(replies) && replies.length > 0) {
    const first = replies[0];
    if (first && typeof first === "object" && "text" in (first as object)) return true;
  }
  const insight = pickString(output, ["insight"]);
  const stage = pickString(output, ["stage"]);
  if (insight && !pickString(output, ["analysis"])) return true;
  if (stage && typeof output.heartbeat === "number") return true;
  return false;
}

/** 页面展示：避免 String(undefined) === "undefined" */
export function displayField(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  if (!s || s === "undefined" || s === "null") return fallback;
  return s;
}
