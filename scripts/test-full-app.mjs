/**
 * 全站冒烟测试：页面路由 + 核心 API
 * 运行: npm run test:full
 * 需先 npm run dev 或 npm run start -p 3010
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = {};
  for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const supabase =
  env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

const PAGES = [
  "/",
  "/create",
  "/create?tab=reply",
  "/emotion-chat",
  "/hot-topics",
  "/topic-box",
  "/title-gacha",
  "/publish-pack",
  "/review",
  "/review?tab=weekly",
  "/history",
  "/profile",
  "/invite",
  "/account-test",
  "/account-package",
  "/hot-plays",
  "/about",
  "/support",
  "/agreement/user",
  "/agreement/privacy",
  "/agreement/rights",
  "/admin",
  "/pay/result",
  "/generate",
  "/result",
  "/mine",
  "/ai-video",
];

const API_PUBLIC = [
  { method: "GET", path: "/api/me", expect: [401] },
  { method: "GET", path: "/api/v1/hot-topics", expect: [200] },
];

const API_AUTH_BODY = [
  {
    name: "POST /api/v1/generate/publish-pack",
    path: "/api/v1/generate/publish-pack",
    body: { platform: "抖音", topic: "自测发布包", track: "职场" },
  },
  {
    name: "POST /api/v1/topic-box",
    path: "/api/v1/topic-box",
    body: { platform: "抖音", track: "职场", goal: "涨粉", style: "温柔" },
  },
  {
    name: "POST /api/v1/title-gacha",
    path: "/api/v1/title-gacha",
    body: { platform: "抖音", topic: "自测选题", style: "温柔" },
  },
  {
    name: "POST /api/v1/score",
    path: "/api/v1/score",
    body: { title: "冒烟标题", script: "冒烟脚本" },
  },
  {
    name: "POST /api/v1/review",
    path: "/api/v1/review",
    body: { title: "本周自测复盘", views: 100, likes: 10, platform: "抖音" },
  },
  {
    name: "POST /api/v1/growth checkin",
    path: "/api/v1/growth",
    body: { action: "checkin" },
  },
];

async function detectDevPort() {
  /** 优先较新端口，且 /api/me 未登录须为 401（500 多为旧实例编译中） */
  const ports = [3010, 3006, 3005, 3004, 3003, 3002, 3001, 3000];
  for (const port of ports) {
    for (const host of ["127.0.0.1", "localhost"]) {
      try {
        const r = await fetch(`http://${host}:${port}/api/me`, {
          signal: AbortSignal.timeout(4000),
        });
        if (r.status === 401 || r.status === 200) return { port, host };
      } catch {
        /* continue */
      }
    }
  }
  return null;
}

const results = { pass: 0, fail: 0, skip: 0, rows: [] };

function parseCookie(setCookie) {
  if (!setCookie) return "";
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts.map((c) => String(c).split(";")[0]).join("; ");
}

function log(status, name, detail = "") {
  results.rows.push({ status, name, detail });
  if (status === "PASS") results.pass++;
  else if (status === "FAIL") results.fail++;
  else results.skip++;
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⏭️";
  console.log(`${icon} [${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log("\n========================================");
  console.log("  全站功能冒烟测试");
  console.log("========================================\n");

  const dev = await detectDevPort();
  if (!dev) {
    log("SKIP", "开发服务", "未检测到 dev，请先 npm run dev:fresh");
    printSummary();
    process.exit(1);
  }

  const base = `http://${dev.host}:${dev.port}`;
  log("PASS", "开发服务", base);

  try {
    const homeHtml = await fetch(base, { signal: AbortSignal.timeout(10000) }).then((r) =>
      r.text()
    );
    const cssMatch = homeHtml.match(/href="(\/_next\/static\/css\/[^"]+)"/);
    if (!cssMatch) {
      log("FAIL", "首页 CSS 链接", "未找到 stylesheet");
    } else {
      const cssRes = await fetch(`${base}${cssMatch[1]}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (cssRes.ok) log("PASS", "首页 CSS 可访问", String(cssRes.status));
      else
        log(
          "FAIL",
          "首页 CSS 可访问",
          `${cssRes.status} — 无样式页，请 npm run dev:fresh`
        );
    }
  } catch (e) {
    log("FAIL", "首页 CSS 可访问", e.message);
  }

  console.log("\n--- 页面路由 ---\n");
  for (const path of PAGES) {
    try {
      const r = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(15000) });
      if (r.status === 200) log("PASS", `GET ${path}`, String(r.status));
      else log("FAIL", `GET ${path}`, `status ${r.status}`);
    } catch (e) {
      log("FAIL", `GET ${path}`, e.message);
    }
  }

  console.log("\n--- 公开 API ---\n");
  for (const api of API_PUBLIC) {
    try {
      const r = await fetch(`${base}${api.path}`, {
        method: api.method,
        signal: AbortSignal.timeout(10000),
      });
      if (api.expect.includes(r.status)) log("PASS", `${api.method} ${api.path}`, String(r.status));
      else log("FAIL", `${api.method} ${api.path}`, `status ${r.status}`);
    } catch (e) {
      log("FAIL", `${api.method} ${api.path}`, e.message);
    }
  }

  console.log("\n--- 登录后核心 API ---\n");
  const mobile = `199${String(Date.now()).slice(-8)}`;
  let cookie = "";
  try {
    const send = await fetch(`${base}/api/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
      signal: AbortSignal.timeout(15000),
    });
    const sendData = await send.json();
    let code = sendData.devCode;
    if (!code && supabase) {
      const { data: row } = await supabase
        .from("sms_logs")
        .select("code")
        .eq("mobile", mobile)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      code = row?.code;
    }
    if (!send.ok || !code) {
      log("FAIL", "登录 send-code", sendData.error ?? String(send.status));
    } else {
      log("PASS", "POST /api/auth/send-code", "devCode");
      const login = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, code: String(code) }),
        signal: AbortSignal.timeout(15000),
      });
      const loginData = await login.json();
      const setCookie = login.headers.getSetCookie?.() ?? login.headers.get("set-cookie");
      cookie = parseCookie(setCookie);
      if (login.ok && loginData.user?.id) {
        log("PASS", "POST /api/auth/login", loginData.user.id.slice(0, 8) + "…");
        if (supabase) {
          const { error: grantErr } = await supabase
            .from("users")
            .update({
              bonus_quota: 30,
              used_count: 0,
              updated_at: new Date().toISOString(),
            })
            .eq("id", loginData.user.id);
          if (grantErr) {
            log("FAIL", "测试账号奖励灵感", grantErr.message);
          }
        }
      } else {
        log("FAIL", "POST /api/auth/login", loginData.error ?? String(login.status));
      }
    }
  } catch (e) {
    log("FAIL", "登录流程", e.message);
  }

  if (cookie) {
    for (const api of API_AUTH_BODY) {
      try {
        const r = await fetch(`${base}${api.path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify(api.body),
          signal: AbortSignal.timeout(60000),
        });
        const data = await r.json().catch(() => ({}));
        const quotaOk =
          r.status === 402 &&
          data.error === "quota_insufficient" &&
          api.path.includes("publish-pack");
        const ok =
          quotaOk ||
          (r.ok &&
            (data.result !== undefined ||
              data.growth !== undefined ||
              data.saved === true));
        log(
          ok ? "PASS" : "FAIL",
          api.name,
          quotaOk
            ? "402 免费额度不足（符合产品规则）"
            : ok
              ? String(r.status)
              : data.error ?? String(r.status)
        );
      } catch (e) {
        log("FAIL", api.name, e.message);
      }
    }
    try {
      const r = await fetch(`${base}/api/me?sync=1`, {
        headers: { Cookie: cookie },
        signal: AbortSignal.timeout(15000),
      });
      const data = await r.json();
      const n = data.histories?.length ?? 0;
      log(r.ok && n > 0 ? "PASS" : "FAIL", "GET /api/me?sync=1 内容库", `histories=${n}`);
    } catch (e) {
      log("FAIL", "GET /api/me?sync=1", e.message);
    }
  }

  printSummary();
  process.exit(results.fail > 0 ? 1 : 0);
}

function printSummary() {
  console.log("\n========================================");
  console.log(`合计: ✅ ${results.pass}  ❌ ${results.fail}  ⏭️ ${results.skip}`);
  console.log("========================================\n");
}

main();
