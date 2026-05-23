import { resolveDeepSeekBaseUrl } from "@/lib/security/deepseek-url";
import { hasDeepSeekKey } from "@/lib/ai/deepseek";
import type { HotTopicItem } from "@/lib/server/db/product-v1";
import { getDailyHotTopics } from "@/lib/hot-topics/resolve-daily";

const DEFAULT_MODEL = "deepseek-chat";
const TRACKS = [
  "婚恋情感",
  "宠物博主",
  "电商带货",
  "职场成长",
  "本地生活",
  "小红书运营",
  "个人IP",
  "个人Vlog",
  "母婴育儿",
  "美妆护肤",
  "健身减脂",
  "生活干货",
] as const;
const FORMATS = ["口播", "图文", "短视频", "直播切片"] as const;
const HEATS = ["爆", "高", "中"] as const;
const SOURCES = ["抖音", "小红书", "视频号"] as const;

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

async function chatJson(system: string, user: string, maxTokens = 8000) {
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
      temperature: 0.85,
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

function pickHeat(raw: unknown): string {
  const s = String(raw ?? "中").trim();
  return HEATS.includes(s as (typeof HEATS)[number]) ? s : "中";
}

function pickTrack(raw: unknown): string {
  const s = String(raw ?? "个人IP").trim();
  return TRACKS.includes(s as (typeof TRACKS)[number]) ? s : "个人IP";
}

function pickFormat(raw: unknown): string {
  const s = String(raw ?? "口播").trim();
  return FORMATS.includes(s as (typeof FORMATS)[number]) ? s : "口播";
}

function normalizeSources(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ["抖音"];
  const out = raw
    .map((x) => String(x).trim())
    .filter((x) => SOURCES.includes(x as (typeof SOURCES)[number]));
  return out.length ? out : ["抖音"];
}

function normalizeRawItems(raw: unknown): HotTopicItem[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>)?.items)
      ? ((raw as Record<string, unknown>).items as unknown[])
      : [];

  const items: HotTopicItem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < list.length; i++) {
    const row = list[i];
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const title = String(o.title ?? o.topic ?? "").trim();
    if (!title || title.length < 4 || seen.has(title)) continue;
    seen.add(title);

    const sources = normalizeSources(o.sources ?? o.platforms);
    const angle = String(o.angle ?? o.hook ?? "").trim();
    const descRaw = String(o.desc ?? o.description ?? "").trim();
    const desc = descRaw
      ? `${descRaw}（监测：${sources.join("·")}）`
      : angle
        ? `${angle}（监测：${sources.join("·")}）`
        : `短视频爆品选题（监测：${sources.join("·")}）`;

    items.push({
      id: `ai-${i}`,
      title,
      desc,
      heat: pickHeat(o.heat),
      track: pickTrack(o.track),
      format: pickFormat(o.format),
    });
  }

  return items;
}

function buildPrompt(dateKey: string, count: number, batchLabel: string) {
  return `你是「ai短视频运营」平台的爆品策划。日期：${dateKey}，批次：${batchLabel}。
请生成 ${count} 条「今日可拍」的短视频爆品选题，覆盖抖音、小红书、视频号近期热门方向（结合当季、节点、情绪消费、本地生活、职场、母婴、情感、带货等）。

要求：
1. 标题 8-22 字，像真实平台热门话题，不要空泛
2. desc 一句话说明怎么拍、为什么今天适合发（20-45字）
3. heat 只能是：爆、高、中（约 20% 爆 / 50% 高 / 30% 中）
4. track 从：${TRACKS.join("、")}
5. format 从：${FORMATS.join("、")}
6. sources 数组，从：抖音、小红书、视频号（可多选）
7. angle 给创作者可执行的爆点角度（10-20字）
8. 各赛道都要覆盖，不要 30 条都写同一类

只输出 JSON：
{"items":[{"title":"","desc":"","heat":"","track":"","format":"","sources":[],"angle":""}]}`;
}

async function fetchBatch(dateKey: string, count: number, label: string) {
  const system =
    "你只输出合法 JSON，不要 markdown。面向中国短视频创作者，合规、积极、可执行。";
  const raw = await chatJson(system, buildPrompt(dateKey, count, label));
  return normalizeRawItems(raw);
}

/** DeepSeek 生成每日爆品库，不足时用本地池补足 */
export async function generateDailyHotTopicsWithDeepSeek(
  dateKey: string,
  minCount = 32
): Promise<{ items: HotTopicItem[]; source: "deepseek" | "fallback" }> {
  if (!hasDeepSeekKey()) {
    return { items: getDailyHotTopics(dateKey, 0), source: "fallback" };
  }

  try {
    const batch1 = await fetchBatch(dateKey, 20, "A-泛热点");
    const batch2 = await fetchBatch(dateKey, 18, "B-补充赛道");
    const merged = [...batch1, ...batch2];
    const deduped: HotTopicItem[] = [];
    const seen = new Set<string>();
    for (const item of merged) {
      if (seen.has(item.title)) continue;
      seen.add(item.title);
      deduped.push({ ...item, id: `${dateKey}-${deduped.length}` });
    }

    if (deduped.length >= minCount) {
      return { items: deduped.slice(0, Math.max(minCount, deduped.length)), source: "deepseek" };
    }

    const pool = getDailyHotTopics(dateKey, 0);
    for (const p of pool) {
      if (deduped.length >= minCount) break;
      if (!seen.has(p.title)) {
        seen.add(p.title);
        deduped.push({ ...p, id: `${dateKey}-${deduped.length}` });
      }
    }

    return {
      items: deduped,
      source: deduped.length >= minCount ? "deepseek" : "fallback",
    };
  } catch (e) {
    console.error("[generateDailyHotTopicsWithDeepSeek]", e);
    return { items: getDailyHotTopics(dateKey, 0), source: "fallback" };
  }
}
