import { resolveDeepSeekBaseUrl } from "@/lib/security/deepseek-url";
import { hasDeepSeekKey } from "@/lib/ai/deepseek";
import {
  mockAccountPackage,
  mockDailyVideo,
  mockViralCopy,
} from "@/lib/mock/v1-generators";

const DEFAULT_MODEL = "deepseek-chat";

async function chatJson(system: string, user: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!hasDeepSeekKey() || !apiKey) {
    throw new Error("no_deepseek_key");
  }

  const baseUrl = resolveDeepSeekBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
      max_tokens: 3000,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`deepseek_${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty_response");
  return JSON.parse(content) as Record<string, unknown>;
}

export async function generateAccountPackage(input: {
  platform: string;
  track: string;
  goal: string;
  style: string;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean }> {
  try {
    const result = await chatJson(
      "你是短视频起号顾问。只输出合法 JSON，字段：positioning, audience, persona, names(字符串数组10个), bios(字符串数组5个), pillars(字符串数组3个), hooks(字符串数组5个), firstWeekPlan(对象含day1-day7每天title和tasks数组), riskTips(字符串数组)。",
      JSON.stringify(input)
    );
    return { result, usedMock: false };
  } catch {
    return { result: mockAccountPackage(input) as Record<string, unknown>, usedMock: true };
  }
}

export async function generateDailyVideo(topic: string): Promise<{
  result: Record<string, unknown>;
  usedMock: boolean;
}> {
  try {
    const result = await chatJson(
      "你是短视频脚本策划。只输出 JSON：title, hook, outline(数组), script(完整口播), shots(数组每项含scene和line), cta, hashtags(数组)。",
      `选题：${topic}`
    );
    return { result, usedMock: false };
  } catch {
    return { result: mockDailyVideo(topic) as Record<string, unknown>, usedMock: true };
  }
}

export async function generateViralCopy(
  title: string,
  copy: string
): Promise<{ result: Record<string, unknown>; usedMock: boolean }> {
  try {
    const result = await chatJson(
      "你是爆款文案改写专家。只输出 JSON：analysis, rewrites(数组3项含title和copy), hooks(数组5个), comments(数组5条神评论), risks(字符串)。",
      JSON.stringify({ title, copy })
    );
    return { result, usedMock: false };
  } catch {
    return {
      result: mockViralCopy(title, copy) as Record<string, unknown>,
      usedMock: true,
    };
  }
}
