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

function alipayReady(env) {
  const keys = [
    "ALIPAY_APP_ID",
    "ALIPAY_PRIVATE_KEY",
    "ALIPAY_PUBLIC_KEY",
    "ALIPAY_NOTIFY_URL",
  ];
  return keys.every((k) => env[k] && !isPlaceholder(env[k], k));
}

const env = loadEnv();
const checks = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role", required: true },
  { key: "SESSION_SECRET", label: "SESSION_SECRET（≥16位）", required: true },
  { key: "NEXT_PUBLIC_BACKEND_MODE", label: "BACKEND_MODE=server", required: false },
  { key: "DEEPSEEK_API_KEY", label: "DeepSeek", required: false },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon", required: false },
];

console.log("\nAI短视频运营助手 — 环境配置检查\n");

let ok = true;
for (const { key, label, required } of checks) {
  const val = env[key];
  let placeholder = isPlaceholder(val, key);
  if (key === "SESSION_SECRET" && val && val.length < 16) placeholder = true;
  if (key === "NEXT_PUBLIC_BACKEND_MODE" && val !== "server") placeholder = true;
  const status = !val || placeholder ? (required ? "❌" : "⚠️ ") : "✅";
  if (required && (!val || placeholder)) ok = false;
  const display =
    key === "NEXT_PUBLIC_BACKEND_MODE" ? val || "（未填）" : mask(val);
  console.log(`${status} ${label}: ${display}${placeholder ? " ← 需配置" : ""}`);
}

const serverReady =
  !isPlaceholder(env.NEXT_PUBLIC_SUPABASE_URL, "") &&
  !isPlaceholder(env.SUPABASE_SERVICE_ROLE_KEY, "") &&
  env.SESSION_SECRET?.length >= 16 &&
  env.NEXT_PUBLIC_BACKEND_MODE === "server";

console.log(
  serverReady
    ? "\n✅ 服务端模式可启用（登录/订单/成片走 API + Supabase）"
    : "\n⚠️  服务端模式未就绪：需 Supabase + SESSION_SECRET + NEXT_PUBLIC_BACKEND_MODE=server"
);

const pay = env.PAY_PROVIDER === "alipay";
if (pay && alipayReady(env)) {
  console.log("✅ 支付宝：密钥齐全，可设 PAY_PROVIDER=alipay");
} else if (alipayReady(env)) {
  console.log("⚠️  支付宝密钥已填，但 PAY_PROVIDER=mock；上线请改为 alipay");
} else if (pay) {
  console.log("❌ PAY_PROVIDER=alipay 但 ALIPAY_* 未配全");
}

if (env.CRON_SECRET && env.CRON_SECRET.length >= 16) {
  console.log("✅ CRON_SECRET 已配置（每日爆品定时任务）");
} else {
  console.log("⚠️  CRON_SECRET 未配置：线上定时刷新爆品库可能失败");
}

if (env.ADMIN_MOBILES?.trim()) {
  console.log(`✅ 管理员白名单: ${env.ADMIN_MOBILES.split(/[,，]/).length} 个手机号`);
} else {
  console.log("ℹ️  ADMIN_MOBILES 未填：无人可访问 /admin（更安全）");
}

if (env.SMS_PROVIDER === "aliyun") {
  const smsOk = [
    "ALIYUN_SMS_ACCESS_KEY_ID",
    "ALIYUN_SMS_ACCESS_KEY_SECRET",
    "ALIYUN_SMS_SIGN_NAME",
    "ALIYUN_SMS_TEMPLATE_CODE",
  ].every((k) => env[k]);
  console.log(smsOk ? "✅ 阿里云短信已配置" : "❌ 短信变量未配全");
} else {
  console.log("ℹ️  短信：dev 模式（验证码见服务端日志）");
}

console.log(
  ok
    ? "\n运行: npm run dev → http://localhost:3000\n"
    : "\n详见 docs/PRODUCTION-运营上线清单.md\n"
);
