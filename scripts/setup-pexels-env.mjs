#!/usr/bin/env node
/**
 * 向 .env.local 写入 Pexels 封面相关变量（不覆盖已有非空 Key）
 * 用法: node scripts/setup-pexels-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
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
    if (cur) return false;
    lines[idx] = `${key}=${value}`;
    return true;
  }
  return false;
}

const lines = loadLines();
const env = parseEnv(lines);
const changed = [];

if (!env.PEXELS_API_KEY) {
  const hasLine = lines.some((l) => l.trim().startsWith("PEXELS_API_KEY="));
  if (!hasLine) {
    lines.push("");
    lines.push("# Pexels 今日热点封面（仅服务端 /api/pexels/search，https://www.pexels.com/api/ 申请）");
    lines.push("PEXELS_API_KEY=");
    changed.push("PEXELS_API_KEY（已添加空行，请粘贴密钥）");
  } else {
    changed.push("PEXELS_API_KEY 行已存在，请手动填写");
  }
} else {
  changed.push("PEXELS_API_KEY 已配置，无需修改");
}

writeFileSync(envPath, lines.join("\n").replace(/\n*$/, "\n") + "\n", "utf8");

console.log("\n.env.local Pexels 配置：\n");
for (const c of changed) console.log("  ·", c);

console.log("\n下一步：");
console.log("  1. 打开 https://www.pexels.com/api/ 注册并复制 API Key");
console.log("  2. 编辑 .env.local → PEXELS_API_KEY=你的密钥");
console.log("  3. 重启 dev: npm run dev:quick");
console.log("  4. 打开 /hot-topics 或首页 TOP3 验收封面");
console.log("  5. 若仍见旧图：清 localStorage 里 pexels_topic_image_* 后硬刷新\n");
