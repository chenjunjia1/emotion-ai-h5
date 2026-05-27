import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { generateWithBudget } from "@/lib/ai/generate-budget";

export type AccountDiagnosisDayPlan = {
  day: number;
  theme: string;
  content: string;
  tip: string;
};

export type AccountDiagnosisResult = {
  summary: string;
  contentDirection: string[];
  hotTopics: string[];
  publishPlan: AccountDiagnosisDayPlan[];
  monetization: string[];
};

function mockDiagnosis(positioning: string): AccountDiagnosisResult {
  const p = positioning.slice(0, 12) || "你的账号";
  return {
    summary: `「${p}」适合走「真实记录 + 轻干货」路线，先建立信任再逐步变现。`,
    contentDirection: [
      "固定人设标签：每篇开头 1 句身份自我介绍",
      "内容 70% 生活感 + 30% 可复用方法论",
      "评论区主动追问，收集下一期选题",
      "每周 1 条「复盘/踩坑」增强专业感",
    ],
    hotTopics: [
      `${p}新手最容易踩的 3 个坑`,
      `我靠${p}内容涨粉的第 1 个月`,
      `普通人做${p}，0 粉丝也能发的 5 个选题`,
      `别再做无效更新了，${p}要这样起号`,
      `一条视频讲清：${p}怎么变现`,
      `${p}爆款都在用的标题公式`,
    ],
    publishPlan: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      theme: `第 ${i + 1} 天主题`,
      content:
        i === 0
          ? `自我介绍 + ${p}定位说明`
          : i === 3
            ? `小爆款选题：${p}避坑清单`
            : `${p}日常记录 + 1 个实用小技巧`,
      tip: i % 2 === 0 ? "配图 3-6 张，封面大字标题" : "发布时间建议 12:00 或 21:30",
    })),
    monetization: [
      "粉丝 500+：接同类小店置换 / 种草笔记",
      "粉丝 3000+：开设专栏或资料包（选题库/模板）",
      "稳定更新后：直播或社群陪跑（轻咨询）",
      "有结果案例后：品牌软广报价按篇计费",
    ],
  };
}

function normalizePlan(raw: unknown): AccountDiagnosisDayPlan[] {
  if (!Array.isArray(raw)) return mockDiagnosis("").publishPlan;
  const items = raw
    .map((item, idx) => {
      const o = item as Record<string, unknown>;
      const day = Number(o.day ?? idx + 1);
      return {
        day: day >= 1 && day <= 7 ? day : idx + 1,
        theme: String(o.theme ?? `第 ${idx + 1} 天`).trim(),
        content: String(o.content ?? "").trim(),
        tip: String(o.tip ?? "").trim(),
      };
    })
    .filter((x) => x.content)
    .slice(0, 7);
  return items.length >= 5 ? items : mockDiagnosis("").publishPlan;
}

function normalize(raw: Record<string, unknown>, positioning: string): AccountDiagnosisResult {
  const fallback = mockDiagnosis(positioning);
  const contentDirection = Array.isArray(raw.contentDirection)
    ? raw.contentDirection.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
    : fallback.contentDirection;
  const hotTopics = Array.isArray(raw.hotTopics)
    ? raw.hotTopics.map((s) => String(s).trim()).filter(Boolean).slice(0, 8)
    : fallback.hotTopics;
  const monetization = Array.isArray(raw.monetization)
    ? raw.monetization.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
    : fallback.monetization;

  return {
    summary: String(raw.summary ?? fallback.summary).trim() || fallback.summary,
    contentDirection: contentDirection.length ? contentDirection : fallback.contentDirection,
    hotTopics: hotTopics.length ? hotTopics : fallback.hotTopics,
    publishPlan: normalizePlan(raw.publishPlan),
    monetization: monetization.length ? monetization : fallback.monetization,
  };
}

export async function generateAccountDiagnosis(positioning: string): Promise<{
  diagnosis: AccountDiagnosisResult;
  usedMock: boolean;
}> {
  const text = positioning.trim() || "泛生活账号";
  const { result, usedMock } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.expression_account_diagnosis,
    system: `你是抖音、小红书、视频号起号顾问。根据用户账号定位输出可执行方案。
只输出 JSON：
summary(40字内定位判断),
contentDirection(4条字符串，每条是内容方向建议),
hotTopics(6条爆款选题标题，口语化),
publishPlan(7项数组，每项 { day:1-7, theme, content, tip }),
monetization(4条变现建议，具体可落地)。
禁止【Mock】占位符。面向零基础创作者。`,
    user: JSON.stringify({ positioning: text }),
    mock: () => mockDiagnosis(text) as unknown as Record<string, unknown>,
    normalize: (raw) => normalize(raw, text) as unknown as Record<string, unknown>,
  });

  return { diagnosis: result as unknown as AccountDiagnosisResult, usedMock };
}
