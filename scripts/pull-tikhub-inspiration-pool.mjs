#!/usr/bin/env node
/**
 * 从 TikHub 拉取灵感池（≥300 条）并写入 Supabase
 *
 * 用法:
 *   npm run pull:tikhub
 *   node scripts/pull-tikhub-inspiration-pool.mjs
 *   node scripts/pull-tikhub-inspiration-pool.mjs --via-cron
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const TARGET = 300;

function loadEnv() {
  if (!existsSync(envPath)) throw new Error("缺少 .env.local");
  const env = { ...process.env };
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

async function probe(base) {
  try {
    const r = await fetch(`${base}/api/xhs/hot-notes?meta=1`, {
      signal: AbortSignal.timeout(4000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function pullViaApi(base) {
  const url = `${base.replace(/\/$/, "")}/api/xhs/hot-notes?pool=inspiration&force=1&refresh=1&limit=0`;
  console.log("拉取 TikHub →", url);
  const res = await fetch(url, { signal: AbortSignal.timeout(600_000) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("请求失败", res.status, json);
    return { ok: false };
  }
  const total = json.total ?? json.data?.length ?? 0;
  const source = json.source ?? "?";
  console.log(`完成: total=${total} source=${source} cached=${json.cached}`);
  if (total < TARGET) {
    console.error(`不足 ${TARGET} 条，请检查 TIKHUB_API_KEY 额度或稍后重试`);
    return { ok: false, total };
  }
  return { ok: true, total };
}

async function pullViaCron(base, secret) {
  const url = `${base.replace(/\/$/, "")}/api/cron/refresh-hot-topics?force=1`;
  console.log("Cron 刷新（含 TikHub）→", url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(600_000),
  });
  const json = await res.json().catch(() => ({}));
  console.log(JSON.stringify(json, null, 2));
  const count = json.xhsHotNotes?.count ?? 0;
  if (!res.ok || count < TARGET) return { ok: false, total: count };
  return { ok: true, total: count };
}

async function main() {
  const viaCron = process.argv.includes("--via-cron");
  const env = loadEnv();
  Object.assign(process.env, env);

  if (!env.TIKHUB_API_KEY?.trim()) {
    console.error("未配置 TIKHUB_API_KEY，请先填写 .env.local");
    process.exit(1);
  }

  let base =
    process.env.BASE_URL ||
    env.SITE_URL ||
    env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  if (await probe("http://localhost:3000")) base = "http://localhost:3000";
  else if (!(await probe(base))) {
    console.error(
      "本地服务未启动。请先 npm run dev，或设置 BASE_URL 指向已部署站点"
    );
    process.exit(1);
  }

  const result = viaCron
    ? await pullViaCron(base, env.CRON_SECRET || env.ADMIN_SECRET)
    : await pullViaApi(base);

  process.exit(result.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
