/**
 * 测试 DeepSeek API 是否可用
 * 运行: npm run test:deepseek
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.log("❌ 未找到 .env.local");
    process.exit(1);
  }
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
const key = env.DEEPSEEK_API_KEY;

if (!key || !key.startsWith("sk-") || /sk-your|placeholder/i.test(key)) {
  console.log("\n❌ 请先在 .env.local 填写真实的 DEEPSEEK_API_KEY");
  console.log("   获取地址: https://platform.deepseek.com/api_keys\n");
  process.exit(1);
}

console.log("\n正在测试 DeepSeek API...\n");

const res = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    model: env.DEEPSEEK_MODEL || "deepseek-chat",
    messages: [
      { role: "user", content: '请用 JSON 回复：{"ok":true,"msg":"连接成功"}' },
    ],
    response_format: { type: "json_object" },
    max_tokens: 64,
  }),
});

const text = await res.text();
if (!res.ok) {
  console.log(`❌ 请求失败 HTTP ${res.status}`);
  console.log(text.slice(0, 300));
  if (res.status === 402) {
    console.log(
      "\n💡 原因：DeepSeek 账户余额不足（Insufficient Balance）"
    );
    console.log("   处理：打开 https://platform.deepseek.com 登录 → 充值");
    console.log(
      "   暂时：线上会自动用演示数据，配好 key 并 Redeploy 后才会真 AI。\n"
    );
  }
  process.exit(1);
}

console.log("✅ DeepSeek API 连接成功！");
console.log("   本地/线上生成将走真 AI（额度仍按站内规则扣）。\n");
