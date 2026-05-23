/**
 * 给指定手机号增加奖励额度 bonus_quota
 * 用法: node scripts/grant-bonus-quota.mjs 13798221796 300
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) throw new Error("缺少 .env.local");
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

const mobile = process.argv[2];
const amount = Number(process.argv[3] ?? 0);

if (!/^1\d{10}$/.test(mobile || "")) {
  console.error("用法: node scripts/grant-bonus-quota.mjs <手机号> <额度>");
  process.exit(1);
}
if (!Number.isFinite(amount) || amount <= 0) {
  console.error("额度须为正整数");
  process.exit(1);
}

const env = loadEnv();
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: user, error: findErr } = await db
  .from("users")
  .select("id, mobile, daily_quota, used_count, bonus_quota")
  .eq("mobile", mobile)
  .maybeSingle();

if (findErr || !user) {
  console.error("未找到用户:", mobile, findErr?.message ?? "");
  process.exit(1);
}

const beforeBonus = Number(user.bonus_quota ?? 0);
const afterBonus = beforeBonus + amount;
const remainDaily = Number(user.daily_quota ?? 0) - Number(user.used_count ?? 0);

const { error: updErr } = await db
  .from("users")
  .update({
    bonus_quota: afterBonus,
    updated_at: new Date().toISOString(),
  })
  .eq("id", user.id);

if (updErr) {
  console.error("更新失败:", updErr.message);
  process.exit(1);
}

await db.from("quota_logs").insert({
  user_id: user.id,
  change_type: "grant",
  amount,
  reason: "admin_test_grant",
  before_quota: remainDaily + beforeBonus,
  after_quota: remainDaily + afterBonus,
});

console.log("\n✅ 已增加奖励额度");
console.log(`   手机号: ${mobile}`);
console.log(`   奖励额度: ${beforeBonus} → ${afterBonus} (+${amount})`);
console.log(
  `   个人中心显示: 今日剩余 ${remainDaily} + 奖励 ${afterBonus}（刷新页面或重新登录可见）\n`
);
