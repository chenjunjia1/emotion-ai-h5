import type { GenerateFormData, GenerateResult } from "@/lib/types";
import { resolveDeepSeekBaseUrl } from "@/lib/security/deepseek-url";
import { buildMockResult } from "@/lib/mock";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { parseAiResponse } from "./parse";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

function isValidDeepSeekKey(key?: string): boolean {
  const k = key?.trim();
  if (!k) return false;
  if (!k.startsWith("sk-")) return false;
  if (/sk-your|placeholder|example/i.test(k)) return false;
  return k.length > 20;
}

export function hasDeepSeekKey(): boolean {
  return isValidDeepSeekKey(process.env.DEEPSEEK_API_KEY);
}

export interface GenerateOutcome {
  result: GenerateResult;
  usedMock: boolean;
  warning?: string;
}

export async function generateWithDeepSeek(
  form: GenerateFormData
): Promise<GenerateOutcome> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!isValidDeepSeekKey(apiKey)) {
    return { result: buildMockResult(form), usedMock: true };
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
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(form) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2048,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errText = await response.text();
    const isBalanceError =
      response.status === 402 || /Insufficient Balance/i.test(errText);

    if (isBalanceError) {
      return {
        result: buildMockResult(form),
        usedMock: true,
        warning:
          "DeepSeek 账户余额不足，已使用演示数据。请前往 platform.deepseek.com 充值后重试。",
      };
    }

    if (process.env.NODE_ENV === "development") {
      throw new Error(
        `DeepSeek API 错误 (${response.status}): ${errText.slice(0, 200)}`
      );
    }
    throw new Error("AI 服务暂时不可用，请稍后重试");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek 返回内容为空");
  }

  return {
    result: parseAiResponse(content, form),
    usedMock: false,
  };
}
