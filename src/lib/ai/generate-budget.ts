import { resolveDeepSeekBaseUrl } from "@/lib/security/deepseek-url";
import { hasDeepSeekKey } from "@/lib/ai/deepseek";
import { FAST_GENERATE_MS } from "@/lib/constants/performance";

const DEFAULT_MODEL = "deepseek-chat";

export function parseModelJson(content: string): Record<string, unknown> {
  let cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const tryParse = (text: string) => {
    const v = JSON.parse(text) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    throw new Error("not_object");
  };

  try {
    return tryParse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return tryParse(cleaned.slice(start, end + 1));
    }
    throw new Error("invalid_json");
  }
}

export type ChatBudget = {
  maxTokens: number;
  timeoutMs?: number;
  temperature?: number;
};

/** 带超时与 token 上限的 DeepSeek JSON 调用 */
export async function chatJsonBudget(
  system: string,
  user: string,
  budget: ChatBudget
): Promise<Record<string, unknown>> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!hasDeepSeekKey() || !apiKey) {
    throw new Error("no_deepseek_key");
  }

  const baseUrl = resolveDeepSeekBaseUrl();
  const timeoutMs = budget.timeoutMs ?? FAST_GENERATE_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
      temperature: budget.temperature ?? 0.65,
      max_tokens: budget.maxTokens,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (!response.ok) {
    throw new Error(`deepseek_${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty_response");
  return parseModelJson(content);
}

export type GenerateWithBudgetResult<T> = {
  result: T;
  usedMock: boolean;
  fastPath?: boolean;
};

/**
 * 在预算时间内等 AI；超时或失败则立刻返回 mock，保证 1–2s 内有结果。
 */
export async function generateWithBudget<T extends Record<string, unknown>>(opts: {
  budget: ChatBudget;
  system: string;
  user: string;
  mock: () => T;
  normalize?: (raw: Record<string, unknown>) => T;
}): Promise<GenerateWithBudgetResult<T>> {
  const mockResult = opts.mock();
  if (!hasDeepSeekKey()) {
    return { result: mockResult, usedMock: true, fastPath: true };
  }

  const normalize = opts.normalize ?? ((raw) => raw as T);

  try {
    const raw = await chatJsonBudget(opts.system, opts.user, opts.budget);
    return { result: normalize(raw), usedMock: false, fastPath: false };
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));
    return {
      result: mockResult,
      usedMock: true,
      fastPath: isTimeout || err instanceof Error,
    };
  }
}
