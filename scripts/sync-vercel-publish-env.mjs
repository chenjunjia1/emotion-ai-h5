#!/usr/bin/env node
/**
 * 从 .env.local 同步发布包 / Seedream / Supabase 存储 到 Vercel Production
 * 用法: node scripts/sync-vercel-publish-env.mjs
 */
import { readFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const TARGET = "production";

function parseEnvFile(path) {
  const text = readFileSync(path, "utf8");
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

function supabaseCdnBase(supabaseUrl) {
  const base = supabaseUrl?.replace(/\/$/, "");
  if (!base) return "";
  return `${base}/storage/v1/object/public/uploads`;
}

function runVercel(args, stdin) {
  const r = spawnSync("npx", ["vercel", ...args], {
    cwd: root,
    input: stdin,
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  return r;
}

function upsertEnv(name, value) {
  if (!value) {
    console.log(`[skip] ${name} (empty)`);
    return;
  }
  runVercel(["env", "rm", name, TARGET, "--yes"]);
  const r = runVercel(["env", "add", name, TARGET], value);
  if (r.status !== 0) {
    console.error(`[fail] ${name}:`, (r.stderr || r.stdout || "").trim().slice(0, 200));
    return false;
  }
  console.log(`[ok] ${name}`);
  return true;
}

if (!existsSync(envPath)) {
  console.error("缺少 .env.local");
  process.exit(1);
}

const local = parseEnvFile(envPath);
const supabaseUrl = local.NEXT_PUBLIC_SUPABASE_URL;

const bundle = {
  ARK_IMAGE_ENABLED: "1",
  ARK_API_KEY: local.ARK_API_KEY,
  ARK_IMAGE_ENDPOINT: local.ARK_IMAGE_ENDPOINT,
  ARK_API_BASE: local.ARK_API_BASE || "https://ark.cn-beijing.volces.com/api/v3",
  ARK_IMAGE_SIZE: local.ARK_IMAGE_SIZE || "2K",
  ARK_IMAGE_WATERMARK: local.ARK_IMAGE_WATERMARK ?? "0",
  SUPABASE_STORAGE_BUCKET: local.SUPABASE_STORAGE_BUCKET || "uploads",
  CDN_BASE_URL: supabaseCdnBase(supabaseUrl) || local.CDN_BASE_URL,
  XINGHUI_MOCK: "0",
};

console.log(`Syncing ${Object.keys(bundle).length} vars → Vercel ${TARGET}…`);
console.log(`CDN_BASE_URL → ${bundle.CDN_BASE_URL?.slice(0, 60)}…`);

let ok = 0;
for (const [k, v] of Object.entries(bundle)) {
  if (upsertEnv(k, v)) ok++;
}

console.log(`\nDone: ${ok}/${Object.keys(bundle).length}. Run: npx vercel deploy --prod`);
