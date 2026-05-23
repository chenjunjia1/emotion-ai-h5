import { resolveDeepSeekBaseUrl } from "@/lib/security/deepseek-url";
import { hasDeepSeekKey } from "@/lib/ai/deepseek";
import { getDailyInspirationTitles } from "@/lib/publish-pack/resolve-daily-inspiration";
import { INSPIRATION_TITLE_POOL } from "@/lib/publish-pack/inspiration-pool";

const DEFAULT_MODEL = "deepseek-chat";

function parseModelJson(content: string): Record<string, unknown> {
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
    if (start >= 0 && end > start) return tryParse(cleaned.slice(start, end + 1));
    throw new Error("invalid_json");
  }
}

async function chatJson(system: string, user: string, maxTokens = 6000) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!hasDeepSeekKey() || !apiKey) throw new Error("no_deepseek_key");

  const baseUrl = resolveDeepSeekBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

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
      temperature: 0.9,
      max_tokens: maxTokens,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`deepseek_${response.status}:${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("deepseek_empty");
  return parseModelJson(content);
}

function normalizeTitles(raw: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>)?.titles)
      ? ((raw as Record<string, unknown>).titles as unknown[])
      : Array.isArray((raw as Record<string, unknown>)?.items)
        ? ((raw as Record<string, unknown>).items as unknown[])
        : [];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const row of list) {
    const t =
      typeof row === "string"
        ? row.trim()
        : String((row as Record<string, unknown>)?.title ?? "").trim();
    if (t.length < 6 || t.length > 32 || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function buildPrompt(dateKey: string, count: number) {
  return `日期 ${dateKey}。请生成 ${count} 条「短视频发布包」可用的「今日主题/灵感标题」。
要求：
- 每条 8-28 字，像抖音小红书爆款标题：反问、反差、清单、反焦虑、起号、职场、带货、本地、情感、宠物、母婴、健身等
- 适合当「今日主题」一键生成口播脚本，不要空洞口号
- 风格多样，有悬念、有共鸣、有干货感
- 不要序号、不要 markdown

只输出 JSON：{"titles":["标题1","标题2",...]}`;
}

export async function generateDailyInspirationTitlesWithDeepSeek(
  dateKey: string,
  minCount = 30
): Promise<{ titles: string[]; source: "deepseek" | "fallback" }> {
  if (!hasDeepSeekKey()) {
    return { titles: getDailyInspirationTitles(dateKey, 0, minCount), source: "fallback" };
  }

  try {
    const system =
      "你只输出合法 JSON。面向中国短视频创作者，积极、合规、可执行。";
    const raw = await chatJson(system, buildPrompt(dateKey, 32));
    const batch = normalizeTitles(raw);

    const deduped: string[] = [];
    const seen = new Set<string>();
    for (const t of batch) {
      if (!seen.has(t)) {
        seen.add(t);
        deduped.push(t);
      }
    }

    if (deduped.length >= minCount) {
      return { titles: deduped.slice(0, Math.max(minCount, deduped.length)), source: "deepseek" };
    }

    for (const p of INSPIRATION_TITLE_POOL) {
      if (deduped.length >= minCount) break;
      if (!seen.has(p)) {
        seen.add(p);
        deduped.push(p);
      }
    }

    return {
      titles: deduped,
      source: deduped.length >= minCount ? "deepseek" : "fallback",
    };
  } catch (e) {
    console.error("[generateDailyInspirationTitlesWithDeepSeek]", e);
    return { titles: getDailyInspirationTitles(dateKey, 0, minCount), source: "fallback" };
  }
}
