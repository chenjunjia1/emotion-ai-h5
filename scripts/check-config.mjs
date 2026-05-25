/**
 * 检查环境变量是否已配置（不输出完整 key）
 * 运行: node scripts/check-config.mjs
 */

import { readFileSync, existsSync, readdirSync } from "fs";
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

console.log("\nAI短视频运营灵感 — 环境配置检查\n");

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
  console.log("✅ CRON_SECRET 已配置（每日热点定时任务）");
  console.log("   · vercel.json: 0 0 * * * → 北京时间每天 08:00");
  console.log("   · 本地验收: npm run verify:cron");
  console.log("   · 手动刷新: node scripts/seed-hot-topics.mjs --via-api --force");
} else {
  console.log("⚠️  CRON_SECRET 未配置：运行 node scripts/setup-hot-topics-env.mjs");
}

if (env.TIANAPI_KEY && env.TIANAPI_KEY.length >= 8) {
  console.log("✅ TIANAPI_KEY 已配置（热点主源：抖音/微博/百度/头条）");
} else {
  console.log("ℹ️  TIANAPI_KEY 未填：热点将自动使用 DailyHotApi 备用源");
}

if (env.PEXELS_API_KEY && env.PEXELS_API_KEY.length >= 8) {
  console.log("✅ PEXELS_API_KEY 已配置（/hot-topics 与首页 TOP3 封面走 Pexels）");
} else {
  console.log("ℹ️  PEXELS_API_KEY 未填：热点封面使用 public/images/topics/ 本地兜底");
  console.log("   · 申请: https://www.pexels.com/api/");
  console.log("   · 一键写入空行: npm run setup:pexels-env");
}

if (env.TIKHUB_API_KEY && env.TIKHUB_API_KEY.length >= 8) {
  console.log("✅ TIKHUB_API_KEY 已配置（小红书热门图文灵感库）");
} else {
  console.log("ℹ️  TIKHUB_API_KEY 未填：/hot-topics 小红书灵感区不可用");
  console.log("   · 申请: https://tikhub.io/");
  console.log("   · 一键写入空行: npm run setup:tikhub-env");
}

if (env.DAILY_HOT_API_BASE_URL) {
  console.log(`✅ DAILY_HOT_API_BASE_URL: ${env.DAILY_HOT_API_BASE_URL}`);
} else {
  console.log("ℹ️  DAILY_HOT_API_BASE_URL 未填：使用默认 https://api-hot.imsyy.top");
}

const vercelJson = resolve(root, "vercel.json");
if (existsSync(vercelJson)) {
  try {
    const cron = JSON.parse(readFileSync(vercelJson, "utf8")).crons?.[0];
    if (cron?.path?.includes("refresh-hot-topics")) {
      console.log(`✅ Vercel Cron 已声明: ${cron.schedule} → ${cron.path}`);
    }
  } catch {
    console.log("⚠️  vercel.json 解析失败");
  }
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

const appUrl = env.NEXT_PUBLIC_APP_URL?.trim();
if (appUrl && /^https:\/\/.+/.test(appUrl)) {
  console.log(`✅ NEXT_PUBLIC_APP_URL: ${appUrl}`);
} else {
  console.log("⚠️  NEXT_PUBLIC_APP_URL 未设或不是 https：分享链接/支付回调可能不正确");
}

if (pay && env.NEXT_PUBLIC_PAY_PROVIDER !== "alipay") {
  console.log("⚠️  PAY_PROVIDER=alipay 但 NEXT_PUBLIC_PAY_PROVIDER 未设 alipay（前端仍显示 Mock 支付）");
}

const assets = [
  ["public/brand-avatar.png", "品牌头像（顶栏/公众号）"],
  ["public/brand-avatar.svg", "品牌头像 SVG"],
  ["public/og-share.png", "微信/社交分享图"],
  ["public/favicon.svg", "浏览器标签图标"],
];
for (const [rel, label] of assets) {
  console.log(
    existsSync(resolve(root, rel))
      ? `✅ ${label}（${rel}）`
      : `❌ 缺少 ${label}：${rel}`
  );
}

const publicDir = resolve(root, "public");
const mpVerify = existsSync(publicDir)
  ? readdirSync(publicDir).filter((f) => /^MP_verify_.+\.txt$/i.test(f))
  : [];
if (mpVerify.length) {
  console.log(`✅ 微信业务域名校验文件: public/${mpVerify[0]}`);
} else {
  console.log(
    "⚠️  未找到 public/MP_verify_*.txt — 公众平台「业务域名」需下载校验文件后部署"
  );
  console.log("   详见 docs/微信H5分享配置.md");
}

if (env.NEXT_PUBLIC_ICP_BEIAN?.trim()) {
  console.log(`✅ ICP 备案号已配置: ${env.NEXT_PUBLIC_ICP_BEIAN.trim()}`);
} else {
  console.log("ℹ️  NEXT_PUBLIC_ICP_BEIAN 未填：页脚暂不显示备案号（下证后填写）");
  console.log("   详见 docs/ICP备案-流程.md");
}

if (env.VIDEO_PROVIDER && env.VIDEO_PROVIDER !== "mock") {
  console.log(`ℹ️  VIDEO_PROVIDER=${env.VIDEO_PROVIDER}（V1 页面仍展示文本创作说明）`);
} else {
  console.log("ℹ️  VIDEO_PROVIDER=mock：AI 成片页展示 V1 说明，后续可接厂商 API");
}

console.log(
  ok
    ? "\n运行: npm run dev → http://localhost:3000\n"
    : "\n详见 docs/PRODUCTION-运营上线清单.md\n"
);
