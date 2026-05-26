#!/usr/bin/env node
/**
 * 本地检测 OpenAI / Pexels（读取 .env.local，支持 OPENAI_PROXY_URL）
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

loadEnv();

const openaiKey = process.env.OPENAI_API_KEY;
const pexelsKey = process.env.PEXELS_API_KEY;
const proxy =
  process.env.OPENAI_PROXY_URL?.trim() ||
  process.env.HTTPS_PROXY?.trim() ||
  process.env.HTTP_PROXY?.trim();

function apiFetch(url, init) {
  if (proxy) {
    const agent = new ProxyAgent(proxy);
    return undiciFetch(url, { ...init, dispatcher: agent });
  }
  return fetch(url, init);
}

console.log("\n=== AI 配图环境自检 ===\n");
console.log(`OPENAI_API_KEY: ${openaiKey ? `已配置 (${openaiKey.slice(0, 8)}…)` : "未配置"}`);
console.log(`OPENAI_PROXY:   ${proxy || "未配置（国内建议配置）"}`);
console.log(`PEXELS_API_KEY: ${pexelsKey ? "已配置" : "未配置"}`);
console.log(`高级模式:       仅 OpenAI，禁止占位图降级\n`);

async function testOpenAI() {
  if (!openaiKey) return { ok: false, reason: "no_key" };
  const models = [
    process.env.OPENAI_IMAGE_MODEL,
    "gpt-image-1",
    "dall-e-2",
  ].filter((m, i, a) => m && a.indexOf(m) === i);

  for (const model of models) {
    try {
      const res = await apiFetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: "minimal cozy lifestyle photo for social media cover, no text",
          size: "1024x1024",
          n: 1,
        }),
        signal: AbortSignal.timeout(90000),
      });
      const text = await res.text();
      if (!res.ok) {
        if (text.includes("does not exist")) continue;
        return { ok: false, reason: `http_${res.status}`, detail: text.slice(0, 200) };
      }
      const data = JSON.parse(text);
      if (data.data?.[0]?.url || data.data?.[0]?.b64_json) {
        return { ok: true, model };
      }
    } catch (e) {
      return {
        ok: false,
        reason: "network",
        detail: e instanceof Error ? e.message : String(e),
      };
    }
  }
  return { ok: false, reason: "no_working_model" };
}

async function testPexels() {
  if (!pexelsKey) return { ok: false, reason: "no_key" };
  const res = await fetch(
    "https://api.pexels.com/v1/search?query=cozy+lifestyle&per_page=1",
    { headers: { Authorization: pexelsKey }, signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return { ok: false, reason: `http_${res.status}` };
  const data = await res.json();
  return data.photos?.length ? { ok: true } : { ok: false, reason: "no_photos" };
}

console.log("正在探测…\n");
const pexels = await testPexels();
console.log("Pexels:", pexels.ok ? "✅" : `❌ ${pexels.reason}`);

let oai = { ok: false, reason: "skip" };
if (openaiKey) {
  oai = await testOpenAI();
  console.log(
    "OpenAI:",
    oai.ok
      ? `✅ 可用（模型 ${oai.model ?? "ok"}，高级图文包仅 OpenAI 出图）`
      : `❌ ${oai.reason} ${oai.detail ?? ""}`
  );
}

if (!oai.ok && openaiKey) {
  console.log("\n建议: node scripts/setup-openai-proxy.mjs");
  console.log("      或手动在 .env.local 添加 OPENAI_PROXY_URL=http://127.0.0.1:7890");
  console.log("      然后 npm run dev:quick\n");
  process.exit(1);
}
console.log("");
