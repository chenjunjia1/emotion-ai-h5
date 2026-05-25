#!/usr/bin/env node
/**
 * 向 .env.local 写入今日热点相关变量（不覆盖已有非空值）
 * 用法: node scripts/setup-hot-topics-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadLines() {
  if (!existsSync(envPath)) {
    console.error("缺少 .env.local，请先: cp .env.local.example .env.local");
    process.exit(1);
  }
  return readFileSync(envPath, "utf8").split("\n");
}

function parseEnv(lines) {
  const env = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function upsert(lines, key, value) {
  const prefix = `${key}=`;
  const idx = lines.findIndex((l) => l.trim().startsWith(prefix));
  if (idx >= 0) {
    const cur = lines[idx].split("=").slice(1).join("=").trim();
    if (cur && !/请替换|请换成/i.test(cur)) return false;
    lines[idx] = `${key}=${value}`;
    return true;
  }
  lines.push(`${key}=${value}`);
  return true;
}

const lines = loadLines();
const env = parseEnv(lines);
const changed = [];

if (!env.CRON_SECRET || env.CRON_SECRET.length < 16 || /请替换/i.test(env.CRON_SECRET)) {
  const secret = randomBytes(24).toString("hex");
  if (upsert(lines, "CRON_SECRET", secret)) changed.push("CRON_SECRET（已生成随机值）");
}

if (!env.TIANAPI_KEY) {
  if (!lines.some((l) => l.trim().startsWith("TIANAPI_KEY="))) {
    lines.push("");
    lines.push("# 今日热点 — TianAPI 主源（https://www.tianapi.com/console/ 复制 ApiKey）");
    lines.push("TIANAPI_KEY=");
  }
  changed.push("TIANAPI_KEY（已添加空行，请粘贴天聚数行 ApiKey）");
}

if (!env.TIANAPI_BASE_URL) {
  if (upsert(lines, "TIANAPI_BASE_URL", "https://apis.tianapi.com")) {
    changed.push("TIANAPI_BASE_URL");
  }
}

if (!env.DAILY_HOT_API_BASE_URL) {
  if (upsert(lines, "DAILY_HOT_API_BASE_URL", "https://api-hot.imsyy.top")) {
    changed.push("DAILY_HOT_API_BASE_URL");
  }
}

writeFileSync(envPath, lines.join("\n").replace(/\n*$/, "\n") + "\n", "utf8");

console.log("\n.env.local 今日热点配置：\n");
if (changed.length) {
  for (const c of changed) console.log("  ·", c);
} else {
  console.log("  · 无需修改，变量已齐全");
}

console.log("\n状态：");
console.log(
  "  CRON_SECRET:",
  env.CRON_SECRET?.length >= 16 ? "已配置" : "已生成/请检查"
);
console.log(
  "  TIANAPI_KEY:",
  env.TIANAPI_KEY?.length >= 8
    ? "已配置（将走 TianAPI 主源）"
    : "未填（将自动走 DailyHotApi 备用）"
);
console.log(
  "  DAILY_HOT_API_BASE_URL:",
  env.DAILY_HOT_API_BASE_URL || "https://api-hot.imsyy.top（默认）"
);
console.log("\n下一步：");
console.log("  1. 若有天聚数行密钥：编辑 .env.local 填写 TIANAPI_KEY=你的key");
console.log("  2. 重启 dev: npm run dev");
console.log("  3. 刷新热点: node scripts/seed-hot-topics.mjs --via-api --force\n");
