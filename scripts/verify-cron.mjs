/**
 * 本地验收 Vercel Cron 接口（需 CRON_SECRET + 服务已启动）
 * 用法: npm run verify:cron
 * 可选: BASE_URL=https://www.emovalue.top npm run verify:cron
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

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
const secret = env.CRON_SECRET?.trim();
let base = (process.env.BASE_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

if (!process.env.BASE_URL) {
  try {
    const probe = await fetch("http://localhost:3000/", { signal: AbortSignal.timeout(2000) });
    if (probe.ok) base = "http://localhost:3000";
  } catch {
    /* keep base */
  }
}

if (!secret || secret.length < 16) {
  console.error("❌ CRON_SECRET 未配置或过短，请在 .env.local 填写 ≥16 位随机字符串");
  process.exit(1);
}

const url = `${base}/api/cron/refresh-hot-topics?probe=1`;
console.log(`\n验收 Cron 鉴权 → GET ${url}\n`);

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text.slice(0, 200);
}

if (res.status === 401) {
  console.error("❌ 401 unauthorized — CRON_SECRET 与服务端不一致");
  process.exit(1);
}

if (!res.ok) {
  console.error(`❌ HTTP ${res.status}`, body);
  process.exit(1);
}

console.log("✅ Cron 鉴权通过", body);
console.log("\nVercel 部署后：");
console.log("  · vercel.json schedule 0 0 * * * = 北京时间每天 08:00");
console.log("  · Environment Variables 须有 CRON_SECRET（与本地相同）");
console.log("  · Deployments → 对应部署 → Cron Jobs 可查看执行记录\n");
