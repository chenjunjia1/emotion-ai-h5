#!/usr/bin/env node
/**
 * 本地手动刷新小红书热门图文（需 dev 服务 + TIKHUB_API_KEY + CRON_SECRET）
 * npm run refresh:xhs-notes
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function loadEnv() {
  if (!existsSync(envPath)) return {};
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

const env = loadEnv();
const secret = env.CRON_SECRET || process.env.CRON_SECRET;
if (!secret) {
  console.error("缺少 CRON_SECRET，无法调用 Cron 接口");
  process.exit(1);
}

const url = `${base.replace(/\/$/, "")}/api/cron/refresh-hot-topics?force=1`;

console.log("刷新小红书热门图文…", url);

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
});
const json = await res.json().catch(() => ({}));
console.log(JSON.stringify(json, null, 2));
process.exit(res.ok ? 0 : 1);
