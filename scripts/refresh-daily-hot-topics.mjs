#!/usr/bin/env node
/**
 * 每日 DeepSeek 生成 32+ 条爆品热点并写入 Supabase daily_hot_topics
 *
 * 用法:
 *   node scripts/refresh-daily-hot-topics.mjs
 *   node scripts/refresh-daily-hot-topics.mjs --date 2026-05-23
 *   node scripts/refresh-daily-hot-topics.mjs --force
 *   node scripts/refresh-daily-hot-topics.mjs --dry-run
 *   node scripts/refresh-daily-hot-topics.mjs --via-api   # 调已部署站点�?/api/cron/refresh-hot-topics
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

const TRACKS = [
  "婚恋情感",
  "宠物博主",
  "电商带货",
  "职场成长",
  "本地生活",
  "小红书运�?,
  "个人IP",
  "母婴育儿",
  "美妆护肤",
  "健身减脂",
  "生活干货",
];
const FORMATS = ["口播", "图文", "短视�?, "直播切片"];
const HEATS = ["�?, "�?, "�?];
const SOURCES = ["抖音", "小红�?, "视频�?];

function loadEnv() {
  if (!existsSync(envPath)) throw new Error("缺少 .env.local");
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const dateArg = argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  return {
    force: flags.has("--force"),
    dryRun: flags.has("--dry-run"),
    viaApi: flags.has("--via-api"),
    dateKey: dateArg || new Date().toISOString().slice(0, 10),
  };
}

function parseModelJson(content) {
  let cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const v = JSON.parse(cleaned);
    if (v && typeof v === "object" && !Array.isArray(v)) return v;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  }
  throw new Error("invalid_json");
}

function resolveDeepSeekBaseUrl(env) {
  const raw = (env.DEEPSEEK_API_URL || "https://api.deepseek.com").trim().replace(/\/$/, "");
  try {
    const u = new URL(raw);
    if (u.protocol === "https:" && ["api.deepseek.com", "api.deepseek.com.cn"].includes(u.hostname)) {
      return u.origin;
    }
  } catch {
    /* ignore */
  }
  return "https://api.deepseek.com";
}

function isValidKey(key) {
  return key && key.startsWith("sk-") && !/sk-your|placeholder/i.test(key);
}

function buildPrompt(dateKey, count, label) {
  return `你是「AI短视频运营灵感」平台的爆品策划。日期：${dateKey}，批次：${label}�?
请生�?${count} 条「今日可拍」的短视频爆品选题，覆盖抖音、小红书、视频号近期热门方向�?

要求：标�?8-22 字；desc 20-45 字；heat �?�?�?中；track �?${TRACKS.join("�?)}；format �?${FORMATS.join("�?)}；sources �?抖音/小红�?视频号；angle 10-20 字。各赛道都要覆盖�?

只输�?JSON：{"items":[{"title":"","desc":"","heat":"","track":"","format":"","sources":[],"angle":""}]}`;
}

async function chatJson(env, system, user, maxTokens = 8000) {
  const key = env.DEEPSEEK_API_KEY;
  if (!isValidKey(key)) throw new Error("no_deepseek_key");

  const base = resolveDeepSeekBaseUrl(env);
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`deepseek_${res.status}:${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("deepseek_empty");
  return parseModelJson(content);
}

function normalizeItems(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : [];
  const items = [];
  const seen = new Set();

  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (!o || typeof o !== "object") continue;
    const title = String(o.title ?? o.topic ?? "").trim();
    if (!title || title.length < 4 || seen.has(title)) continue;
    seen.add(title);

    const sources = (Array.isArray(o.sources) ? o.sources : [])
      .map((x) => String(x).trim())
      .filter((x) => SOURCES.includes(x));
    const src = sources.length ? sources : ["抖音"];
    const angle = String(o.angle ?? o.hook ?? "").trim();
    const descRaw = String(o.desc ?? o.description ?? "").trim();
    const desc = descRaw
      ? `${descRaw}（监测：${src.join("·")}）`
      : angle
        ? `${angle}（监测：${src.join("·")}）`
        : `短视频爆品选题（监测：${src.join("·")}）`;

    const heat = HEATS.includes(String(o.heat).trim()) ? String(o.heat).trim() : "�?;
    const track = TRACKS.includes(String(o.track).trim()) ? String(o.track).trim() : "个人IP";
    const format = FORMATS.includes(String(o.format).trim()) ? String(o.format).trim() : "口播";

    items.push({
      id: `ai-${i}`,
      title,
      desc,
      heat,
      track,
      format,
    });
  }
  return items;
}

async function generateWithDeepSeek(env, dateKey) {
  const system =
    "你只输出合法 JSON，不�?markdown。面向中国短视频创作者，合规、积极、可执行�?;
  const batch1 = normalizeItems(await chatJson(env, system, buildPrompt(dateKey, 20, "A")));
  const batch2 = normalizeItems(await chatJson(env, system, buildPrompt(dateKey, 18, "B")));

  const merged = [...batch1, ...batch2];
  const deduped = [];
  const seen = new Set();
  for (const item of merged) {
    if (seen.has(item.title)) continue;
    seen.add(item.title);
    deduped.push({ ...item, id: `${dateKey}-${deduped.length}` });
  }
  return deduped;
}

async function viaApi(env, { dateKey, force }) {
  const site = (env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const secret = env.CRON_SECRET;
  if (!secret) throw new Error("via-api 需�?.env.local 配置 CRON_SECRET");

  const url = `${site}/api/cron/refresh-hot-topics?date=${dateKey}${force ? "&force=1" : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(180_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `http_${res.status}`);
  return body;
}

function writeDoc(dateKey, items) {
  const lines = [
    `# 今日爆品热点库（${dateKey}）`,
    "",
    `> �?\`scripts/refresh-daily-hot-topics.mjs\` + DeepSeek 自动生成，共 ${items.length} 条。`,
    "",
    "| # | 标题 | 热度 | 赛道 | 形式 | 说明 |",
    "|---|------|------|------|------|------|",
  ];
  items.forEach((it, idx) => {
    lines.push(
      `| ${idx + 1} | ${it.title} | ${it.heat} | ${it.track} | ${it.format} | ${it.desc} |`
    );
  });
  const out = resolve(root, "docs/今日爆品热点�?md");
  writeFileSync(out, lines.join("\n") + "\n", "utf8");
  return out;
}

async function main() {
  const { force, dryRun, viaApi: useApi, dateKey } = parseArgs(process.argv.slice(2));
  const env = loadEnv();

  console.log(`\n📅 日期: ${dateKey}${force ? "（强制覆盖）" : ""}${dryRun ? "（仅预览�? : ""}\n`);

  if (useApi) {
    const body = await viaApi(env, { dateKey, force });
    console.log("�?已通过 API 刷新:", JSON.stringify(body, null, 2));
    return;
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL �?SUPABASE_SERVICE_ROLE_KEY");

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  let hotCount = 0;
  let inspCount = 0;

  if (!force) {
    const { data: existingHot } = await db
      .from("daily_hot_topics")
      .select("items")
      .eq("topic_date", dateKey)
      .maybeSingle();
    hotCount = Array.isArray(existingHot?.items) ? existingHot.items.length : 0;

    const { data: existingInsp } = await db
      .from("daily_inspiration_titles")
      .select("titles")
      .eq("topic_date", dateKey)
      .maybeSingle();
    inspCount = Array.isArray(existingInsp?.titles) ? existingInsp.titles.length : 0;

    if (hotCount >= 30 && inspCount >= 30) {
      console.log(`⏭️  今日爆品 ${hotCount} 条、灵感标�?${inspCount} 条均已就绪。加 --force 可覆盖。\n`);
      return;
    }
  }

  if (force || hotCount < 30) {
    let items;
    try {
      items = await generateWithDeepSeek(env, dateKey);
      if (items.length < 30) {
        console.warn(`⚠️  爆品�?${items.length} 条`);
      }
    } catch (e) {
      console.error("�?爆品 DeepSeek 失败:", e.message);
      process.exit(1);
    }

    console.log(`�?爆品 ${items.length} 条，样例:`, items.slice(0, 2).map((i) => i.title).join(" | "));

    if (!dryRun) {
      const { error } = await db.from("daily_hot_topics").upsert(
        { topic_date: dateKey, items },
        { onConflict: "topic_date" }
      );
      if (error) {
        console.error("�?爆品写入失败:", error.message);
        process.exit(1);
      }
      const docPath = writeDoc(dateKey, items);
      console.log(`�?daily_hot_topics 已写�?· ${docPath}`);
    }
  } else {
    console.log(`⏭️  爆品已有 ${hotCount} 条，跳过`);
  }

  if (force || inspCount < 30) {
    let titles;
    try {
      titles = await generateInspirationTitles(env, dateKey);
    } catch (e) {
      console.error("�?灵感标题 DeepSeek 失败:", e.message);
      process.exit(1);
    }

    console.log(`�?灵感标题 ${titles.length} 条，样例:`, titles.slice(0, 2).join(" | "));

    if (!dryRun) {
      const { error: inspErr } = await db.from("daily_inspiration_titles").upsert(
        { topic_date: dateKey, titles },
        { onConflict: "topic_date" }
      );
      if (inspErr) {
        console.error("�?灵感标题写入失败:", inspErr.message);
        process.exit(1);
      }
      console.log("�?daily_inspiration_titles 已写�?);
    }
  } else {
    console.log(`⏭️  灵感标题已有 ${inspCount} 条，跳过`);
  }

  if (dryRun) console.log("\n(dry-run 未写入数据库)\n");
  else console.log("");
}

function normalizeTitles(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.titles)
      ? raw.titles
      : [];
  const out = [];
  const seen = new Set();
  for (const row of list) {
    const t = typeof row === "string" ? row.trim() : String(row?.title ?? "").trim();
    if (t.length < 6 || t.length > 32 || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

async function generateInspirationTitles(env, dateKey) {
  const system = "你只输出合法 JSON。面向中国短视频创作者�?;
  const user = `日期 ${dateKey}。生�?32 条短视频「今日主�?灵感标题」，8-28字，反问反差清单反焦虑起号职场带货等，适合一键出发布包。JSON：{"titles":["..."]}`;
  const raw = await chatJson(env, system, user, 5000);
  const titles = normalizeTitles(raw);
  if (titles.length >= 30) return titles;
  throw new Error(`inspiration_too_few:${titles.length}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
