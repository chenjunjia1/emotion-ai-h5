/**
 * 检查环境变量是否已配置（不输出完整 key）
 * 运行: node scripts/check-config.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.log("❌ 未找到 .env.local，请先执行: cp .env.local.example .env.local");
    process.exit(1);
  }
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

function mask(v) {
  if (!v || v.length < 8) return v ? "（已填但过短）" : "（未填）";
  return `${v.slice(0, 6)}...${v.slice(-4)}`;
}

function isPlaceholder(v, key) {
  if (!v) return true;
  if (/your-|xxxxx|sk-your|在这里粘贴/i.test(v)) return true;
  if (key === "DEEPSEEK_API_KEY" && (!v.startsWith("sk-") || v.length < 20))
    return true;
  if (
    (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY" ||
      key === "SUPABASE_SERVICE_ROLE_KEY") &&
    !v.startsWith("eyJ")
  )
    return true;
  return false;
}

const env = loadEnv();
const checks = [
  { key: "DEEPSEEK_API_KEY", label: "DeepSeek", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role", required: true },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon", required: false },
];

console.log("\n情绪价值助手 — 环境配置检查\n");

let ok = true;
for (const { key, label, required } of checks) {
  const val = env[key];
  const placeholder = isPlaceholder(val, key);
  const status = !val || placeholder ? (required ? "❌" : "⚠️ ") : "✅";
  if (required && (!val || placeholder)) ok = false;
  console.log(`${status} ${label}: ${mask(val)}${placeholder ? " ← 请替换占位符" : ""}`);
}

console.log(
  ok
    ? "\n✅ Supabase 已配置。若 DeepSeek 也已填写，可运行 npm run dev 测试生成。\n"
    : "\n⚠️  请在 .env.local 中填入真实密钥，详见 docs/SETUP.md\n"
);
