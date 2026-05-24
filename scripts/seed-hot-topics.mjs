#!/usr/bin/env node
/**
 * 今日热点 v2：调用 /api/admin/update-hot-topics 灌入 hot_topics
 *
 * 用法:
 *   node scripts/seed-hot-topics.mjs
 *   node scripts/seed-hot-topics.mjs --via-api
 *   node scripts/seed-hot-topics.mjs --via-api --force
 *   BASE_URL=https://www.emovalue.top node scripts/seed-hot-topics.mjs --via-api
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

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
    viaApi: flags.has("--via-api"),
    force: flags.has("--force"),
    dateKey: dateArg || new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const { viaApi, force, dateKey } = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const secret = env.ADMIN_SECRET || env.CRON_SECRET;
  if (!secret) throw new Error("缺少 CRON_SECRET 或 ADMIN_SECRET");

  const base = (
    process.env.BASE_URL ||
    (viaApi ? env.SITE_URL || env.NEXT_PUBLIC_APP_URL : null) ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const qs = new URLSearchParams({ date: dateKey });
  if (force) qs.set("force", "1");

  const url = viaApi
    ? `${base}/api/cron/refresh-hot-topics?${qs}`
    : `${base}/api/admin/update-hot-topics?${qs}`;

  console.log(`\n🔥 刷新今日热点 → ${url}\n`);

  const res = await fetch(url, {
    method: viaApi ? "GET" : "POST",
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(180_000),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("❌ 失败:", res.status, body);
    process.exit(1);
  }

  console.log("✅ 成功:", JSON.stringify(body, null, 2));
  console.log("\n验收:");
  console.log(`  curl "${base}/api/hot-topics/top"`);
  console.log(`  浏览器 ${base.replace(/\/$/, "")}/hot-topics\n`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
