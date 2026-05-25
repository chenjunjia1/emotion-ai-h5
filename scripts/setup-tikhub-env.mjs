#!/usr/bin/env node
/** 向 .env.local 写入 TikHub 变量 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

if (!existsSync(envPath)) {
  console.error("缺少 .env.local");
  process.exit(1);
}

const lines = readFileSync(envPath, "utf8").split("\n");
if (!lines.some((l) => l.trim().startsWith("TIKHUB_API_KEY="))) {
  lines.push("");
  lines.push("# TikHub 小红书热门图文（https://tikhub.io/ 申请 Token）");
  lines.push("TIKHUB_API_KEY=");
  writeFileSync(envPath, lines.join("\n").replace(/\n*$/, "\n") + "\n", "utf8");
  console.log("已添加 TIKHUB_API_KEY= 到 .env.local");
} else {
  console.log("TIKHUB_API_KEY 行已存在");
}

console.log("\n下一步：填写 Token → 重启 dev → 打开 /hot-topics\n");
