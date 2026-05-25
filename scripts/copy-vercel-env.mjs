/**
 * 从 .env.local 生成 Vercel 可粘贴的环境变量（不提交 Git）
 * 运行: node scripts/copy-vercel-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, ".env.local");
const out = resolve(root, ".env.vercel-paste");

const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SESSION_SECRET",
  "NEXT_PUBLIC_BACKEND_MODE",
  "DEEPSEEK_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
  "TIANAPI_KEY",
  "TIANAPI_BASE_URL",
  "DAILY_HOT_API_BASE_URL",
  "SITE_URL",
  "ADMIN_MOBILES",
  "SMS_PROVIDER",
  "PAY_PROVIDER",
  "ALIPAY_APP_ID",
  "ALIPAY_PRIVATE_KEY",
  "ALIPAY_PUBLIC_KEY",
  "ALIPAY_NOTIFY_URL",
];

function parseEnv(text) {
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

if (!existsSync(src)) {
  console.error("❌ 未找到 .env.local");
  process.exit(1);
}

const env = parseEnv(readFileSync(src, "utf8"));
const lines = [
  "# 粘贴到 Vercel → Settings → Environment Variables → Paste .env",
  "# 粘贴后检查 ADMIN_MOBILES 是否为你的手机号",
  "",
];

let missing = [];
for (const key of KEYS) {
  const val = env[key];
  if (!val) {
    if (key === "ADMIN_MOBILES") {
      lines.push(`${key}=13800000000`);
      missing.push(`${key}（已用占位 13800000000，请改成你的手机号）`);
    } else if (["ALIPAY_APP_ID", "ALIPAY_PRIVATE_KEY", "ALIPAY_PUBLIC_KEY", "ALIPAY_NOTIFY_URL"].includes(key)) {
      continue;
    } else {
      missing.push(key);
    }
    continue;
  }
  lines.push(`${key}=${val}`);
}

writeFileSync(out, lines.join("\n") + "\n", "utf8");

console.log("\n✅ 已生成:", out);
console.log("   共", lines.filter((l) => l.includes("=")).length, "条变量\n");
if (missing.length) {
  console.log("⚠️  请注意:");
  for (const m of missing) console.log("   -", m);
  console.log("");
}
console.log("下一步: 双击 scripts\\打开Vercel粘贴环境变量.bat");
