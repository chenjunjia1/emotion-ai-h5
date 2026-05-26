#!/usr/bin/env node
/**
 * 向 .env.local 合并 AI 发布包环境变量（星绘 + CDN，保留已有 DEEPSEEK 等）
 * 用法: node scripts/setup-publish-pack-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

const LINES = [
  "",
  "# ── AI 发布包：文案 + 星绘配图 + CDN（仅服务端）──",
  "# 文案 DeepSeek（若已有 DEEPSEEK_API_KEY 可忽略此行）",
  "# DEEPSEEK_API_KEY=sk-xxx",
  "",
  "# 星绘官方企业 API（生产填真实值；本地演示可只开 MOCK）",
  "XINGHUI_APP_ID=",
  "XINGHUI_API_KEY=",
  "# XINGHUI_API_SECRET=",
  "# XINGHUI_AUTH_HEADER=Bearer ...",
  "XINGHUI_API_URL=https://xingchen-api.cn-huabei-1.xf-yun.com/v2.1/tti",
  "XINGHUI_DOMAIN=",
  "XINGHUI_MOCK=1",
  "",
  "# 图片 CDN（本地开发用本站；上线换成正式 CDN 域名）",
  "CDN_BASE_URL=http://localhost:3000",
  "# 腾讯云 COS 预签名上传（{key} 为对象路径占位）；未配则存 public/generated",
  "# COS_UPLOAD_URL_TEMPLATE=https://bucket.cos.region.myqcloud.com/{key}?sign=...",
  "COS_UPLOAD_URL_TEMPLATE=",
  "",
];

function upsert(text, key, value) {
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (re.test(text)) {
    return text.replace(re, line);
  }
  return text.replace(/\n*$/, "\n") + line + "\n";
}

let text = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

if (!text.includes("XINGHUI_APP_ID=")) {
  text += LINES.join("\n");
}

text = upsert(text, "XINGHUI_MOCK", "1");
text = upsert(text, "CDN_BASE_URL", "http://localhost:3000");
if (!/^XINGHUI_API_URL=/m.test(text)) {
  text = upsert(text, "XINGHUI_API_URL", "https://xingchen-api.cn-huabei-1.xf-yun.com/v2.1/tti");
}
if (!/^NEXT_PUBLIC_BACKEND_MODE=/m.test(text)) {
  text = upsert(text, "NEXT_PUBLIC_BACKEND_MODE", "server");
}

writeFileSync(envPath, text.replace(/\n{4,}/g, "\n\n\n"), "utf8");
console.log("已更新 .env.local：星绘 MOCK=1、CDN_BASE_URL=localhost:3000");
console.log("请填入 XINGHUI_APP_ID / XINGHUI_API_KEY 后把 XINGHUI_MOCK 改为 0 或删掉");
console.log("上线前配置 COS_UPLOAD_URL_TEMPLATE 与正式 CDN_BASE_URL");
console.log("重启: npm run dev:quick");
