#!/usr/bin/env node
/**
 * 向 .env.local 写入 AI 配图环境变量占位（fal + OpenAI）
 * 用法: node scripts/setup-image-env.mjs
 * 然后编辑 .env.local 填入真实 Key，重启 npm run dev:quick
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

const BLOCK = `
# ── AI 发布包配图（仅服务端，勿提交 Git）──
# fal.ai 普通配图: https://fal.ai/dashboard/keys → 复制 Key
FAL_KEY=
# OpenAI 高级封面: https://platform.openai.com/api-keys
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1
`;

if (!existsSync(envPath)) {
  writeFileSync(envPath, BLOCK.trim() + "\n", "utf8");
  console.log("已创建 .env.local 并写入配图变量占位");
  process.exit(0);
}

let text = readFileSync(envPath, "utf8");
const keys = ["FAL_KEY", "FAL_API_KEY", "OPENAI_API_KEY", "OPENAI_IMAGE_MODEL"];
const missing = keys.filter((k) => !text.split("\n").some((line) => line.trim().startsWith(`${k}=`)));

if (missing.length === 0 && text.includes("FAL_KEY=")) {
  console.log(".env.local 已包含 FAL_KEY / OPENAI_API_KEY 行");
  console.log("若未填值，请打开 .env.local 粘贴 Key 后重启 dev");
  process.exit(0);
}

if (!text.includes("FAL_KEY=")) {
  text = text.replace(/\n*$/, "\n") + BLOCK + "\n";
  writeFileSync(envPath, text, "utf8");
  console.log("已追加 FAL_KEY、OPENAI_API_KEY 到 .env.local");
} else {
  console.log("请手动检查 .env.local 中 FAL_KEY 与 OPENAI_API_KEY 是否已填写");
}

console.log("\n下一步:");
console.log("  1. 编辑 .env.local 填入 Key");
console.log("  2. npm run dev:quick");
console.log("  3. node scripts/test-image-providers.mjs   # 自检");
console.log("  4. 打开 /publish-pack 生成图文包\n");
