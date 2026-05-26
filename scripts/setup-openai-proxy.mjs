#!/usr/bin/env node
/**
 * 检测本地代理并写入 .env.local 的 OPENAI_PROXY_URL
 * 用法: node scripts/setup-openai-proxy.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const PORTS = [7890, 7897, 10808, 10809, 33210];

function loadEnv() {
  if (!existsSync(envPath)) return "";
  return readFileSync(envPath, "utf8");
}

async function probe(port) {
  const proxy = `http://127.0.0.1:${port}`;
  try {
    const agent = new ProxyAgent(proxy);
    const res = await undiciFetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: "Bearer test" },
      dispatcher: agent,
      signal: AbortSignal.timeout(8000),
    });
    return res.status === 401 || res.status === 200;
  } catch {
    return false;
  }
}

let text = loadEnv();
const existing = text.match(/^OPENAI_PROXY_URL=(.+)$/m)?.[1]?.trim();
if (existing) {
  console.log(`OPENAI_PROXY_URL 已存在: ${existing}`);
  console.log("若 OpenAI 仍失败，请改端口后重启 npm run dev:quick");
  process.exit(0);
}

console.log("正在检测本地代理端口…");
let found = null;
for (const port of PORTS) {
  process.stdout.write(`  127.0.0.1:${port} … `);
  if (await probe(port)) {
    console.log("✓ 可连 OpenAI");
    found = port;
    break;
  }
  console.log("×");
}

if (!found) {
  console.log("\n未检测到可用代理。请手动在 .env.local 添加（Clash 常见 7890）：");
  console.log("OPENAI_PROXY_URL=http://127.0.0.1:7890");
  console.log("HTTPS_PROXY=http://127.0.0.1:7890");
  process.exit(1);
}

const line = `OPENAI_PROXY_URL=http://127.0.0.1:${found}`;
const httpsLine = `HTTPS_PROXY=http://127.0.0.1:${found}`;
if (!text.includes("OPENAI_PROXY_URL=")) {
  text = text.replace(/\n*$/, "\n\n# OpenAI 代理（自动检测）\n") + `${line}\n${httpsLine}\n`;
  writeFileSync(envPath, text, "utf8");
  console.log(`\n已写入 ${line}`);
} else {
  console.log("\n请手动设置 OPENAI_PROXY_URL");
}
console.log("下一步: npm run dev:quick  然后  npm run test:image-providers\n");
