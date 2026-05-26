#!/usr/bin/env node
/**
 * 从 xinghui.credentials.local 合并星绘凭证到 .env.local
 *
 * 1. 复制 xinghui.credentials.local.example → xinghui.credentials.local
 * 2. 填入 AppId / Key / Domain，要真实出图则设 DISABLE_MOCK=1
 * 3. node scripts/apply-xinghui-credentials.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const credPath = resolve(root, "xinghui.credentials.local");
const envPath = resolve(root, ".env.local");

function parseBlock(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

function upsertEnv(text, key, value) {
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  return re.test(text) ? text.replace(re, line) : `${text.replace(/\n*$/, "\n")}${line}\n`;
}

if (!existsSync(credPath)) {
  console.error("未找到 xinghui.credentials.local");
  console.error("请: copy xinghui.credentials.local.example xinghui.credentials.local");
  process.exit(1);
}

const creds = parseBlock(readFileSync(credPath, "utf8"));
const required = ["XINGHUI_APP_ID", "XINGHUI_API_KEY", "XINGHUI_DOMAIN"];
const missing = required.filter((k) => !creds[k]?.trim());
if (missing.length) {
  console.error("缺少:", missing.join(", "));
  process.exit(1);
}

let env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
for (const [k, v] of Object.entries(creds)) {
  if (k.startsWith("XINGHUI_") || k === "CDN_BASE_URL" || k === "XINGHUI_AUTH_HEADER") {
    env = upsertEnv(env, k, v);
  }
}

const disableMock = creds.DISABLE_MOCK === "1" || creds.XINGHUI_MOCK === "0";
env = upsertEnv(env, "XINGHUI_MOCK", disableMock ? "0" : "1");

writeFileSync(envPath, env, "utf8");
console.log("已写入 .env.local ·", disableMock ? "MOCK=0 真实出图" : "MOCK=1 演示");
console.log("重启: npm run dev:quick");
