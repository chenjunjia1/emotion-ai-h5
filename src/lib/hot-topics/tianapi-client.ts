import type { RawHotFromApi } from "@/lib/hot-topics/types";
import { parseHeatScore } from "@/lib/hot-topics/filters";

const TIAN_API_BASE = (process.env.TIANAPI_BASE_URL ?? "https://apis.tianapi.com").replace(
  /\/$/,
  ""
);

/** TianAPI 业务码：额度不足、无权限、未申请等 → 应切换备用源 */
export const TIAN_API_FAIL_CODES = new Set([130, 140, 150, 160, 170, 180, 190, 230, 240, 250]);

type TianEndpoint = {
  platform: string;
  path: string;
  titleKeys: string[];
  hotKeys: string[];
  descKeys?: string[];
};

/** PRD 主源：抖音 / 微博 / 百度 / 头条 */
export const TIAN_API_ENDPOINTS: TianEndpoint[] = [
  {
    platform: "douyin",
    path: "douyinhot/index",
    titleKeys: ["word", "title", "name"],
    hotKeys: ["hotindex", "hot", "index"],
  },
  {
    platform: "weibo",
    path: "weibohot/index",
    titleKeys: ["hotword", "word", "title"],
    hotKeys: ["hotwordnum", "hotindex", "hot"],
  },
  {
    platform: "baidu",
    path: "nethot/index",
    titleKeys: ["keyword", "word", "title"],
    hotKeys: ["index", "hotindex", "hot"],
    descKeys: ["brief", "desc"],
  },
  {
    platform: "toutiao",
    path: "toutiaohot/index",
    titleKeys: ["word", "title", "name"],
    hotKeys: ["hotindex", "hot", "index"],
  },
];

type TianApiJson = {
  code?: number;
  msg?: string;
  result?: unknown;
};

function pickField(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

function extractList(result: unknown): Record<string, unknown>[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (typeof result !== "object") return [];
  const o = result as Record<string, unknown>;
  for (const key of ["list", "newslist", "data", "items"]) {
    if (Array.isArray(o[key])) return o[key] as Record<string, unknown>[];
  }
  return [];
}

function mapRow(row: Record<string, unknown>, ep: TianEndpoint): RawHotFromApi | null {
  const title = pickField(row, ep.titleKeys);
  if (title.length < 2) return null;
  const hotRaw = pickField(row, ep.hotKeys) || row.hotindex || row.index;
  const desc = ep.descKeys ? pickField(row, ep.descKeys) : "";
  const url = row.url ?? row.link ?? row.mobileUrl;
  return {
    title,
    desc,
    hot: parseHeatScore(hotRaw, 50000),
    platform: ep.platform,
    url: url != null ? String(url) : undefined,
  };
}

export function getTianApiKey(): string | null {
  const key = process.env.TIANAPI_KEY?.trim();
  return key || null;
}

export async function fetchTianPlatformHotTopics(
  ep: TianEndpoint,
  apiKey: string
): Promise<{ items: RawHotFromApi[]; code?: number; msg?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const url = `${TIAN_API_BASE}/${ep.path}?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "emotion-ai-h5/1.0" },
      cache: "no-store",
    });
    if (!res.ok) {
      return { items: [], code: res.status, msg: `http_${res.status}` };
    }
    const json = (await res.json()) as TianApiJson;
    const code = Number(json.code ?? 0);
    if (code !== 200) {
      return { items: [], code, msg: json.msg ?? "tianapi_error" };
    }
    const list = extractList(json.result);
    const items = list
      .map((row) => mapRow(row, ep))
      .filter((r): r is RawHotFromApi => Boolean(r));
    if (items.length === 0) {
      return { items: [], code: 250, msg: "empty_list" };
    }
    console.info(`[TianAPI] ${ep.platform} ok (${items.length})`);
    return { items, code: 200 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch_error";
    console.warn(`[TianAPI] ${ep.platform} failed:`, msg);
    return { items: [], msg };
  } finally {
    clearTimeout(timer);
  }
}

export type TianFetchStats = Record<string, number>;

export async function fetchTianApiHotTopicsWithStats(): Promise<{
  items: RawHotFromApi[];
  stats: TianFetchStats;
  source: "tianapi" | "empty";
  quotaOrAuthFailure: boolean;
  error?: string;
}> {
  const apiKey = getTianApiKey();
  if (!apiKey) {
    return {
      items: [],
      stats: {},
      source: "empty",
      quotaOrAuthFailure: false,
      error: "missing_tianapi_key",
    };
  }

  const stats: TianFetchStats = {};
  const items: RawHotFromApi[] = [];
  let quotaOrAuthFailure = false;
  let lastError: string | undefined;

  for (const ep of TIAN_API_ENDPOINTS) {
    const r = await fetchTianPlatformHotTopics(ep, apiKey);
    stats[ep.platform] = r.items.length;
    items.push(...r.items);
    if (r.code && TIAN_API_FAIL_CODES.has(r.code)) {
      quotaOrAuthFailure = true;
      lastError = r.msg;
    }
    if (!r.items.length && r.msg) lastError = r.msg;
  }

  const total = items.length;
  return {
    items,
    stats,
    source: total > 0 ? "tianapi" : "empty",
    quotaOrAuthFailure,
    error: total > 0 ? undefined : lastError,
  };
}
