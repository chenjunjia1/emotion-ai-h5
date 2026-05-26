/**
 * 入库链路自测：Supabase 结构 + 本地 API（需 npm run dev）
 * 运行: node scripts/test-supabase-ingest.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
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

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_MOBILE = `199${String(Date.now()).slice(-8)}`;
const TEST_MOBILE_INVITEE = `198${String(Date.now()).slice(-8)}`;

const report = {
  startedAt: new Date().toISOString(),
  env: [],
  schema: [],
  api: [],
  data: [],
  summary: { pass: 0, fail: 0, skip: 0 },
};

function record(section, name, status, detail = "") {
  const row = { name, status, detail };
  section.push(row);
  if (status === "PASS") report.summary.pass++;
  else if (status === "FAIL") report.summary.fail++;
  else report.summary.skip++;
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⏭️";
  console.log(`${icon} [${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function detectDevPort() {
  const ports = [3010, 3006, 3005, 3004, 3003, 3002, 3001, 3000];
  for (const port of ports) {
    for (const host of ["127.0.0.1", "localhost"]) {
      try {
        const r = await fetch(`http://${host}:${port}/api/me`, {
          signal: AbortSignal.timeout(5000),
        });
        if (r.status === 401 || r.status === 200) return { port, host };
      } catch {
        /* next */
      }
    }
  }
  return null;
}

function parseCookie(setCookie) {
  if (!setCookie) return "";
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts.map((c) => c.split(";")[0]).join("; ");
}

async function apiFetch(base, path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  const res = await fetch(`${base}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  const setCookie = res.headers.getSetCookie?.() ?? res.headers.get("set-cookie");
  return { res, data, cookie: parseCookie(setCookie) };
}

async function runSchemaTests(db) {
  console.log("\n--- Supabase 结构 / 迁移 ---\n");

  const tables = [
    "invite_records",
    "hot_topics",
    "user_daily_usage",
    "generations",
    "users",
  ];
  for (const t of tables) {
    const { error } = await db.from(t).select("*").limit(1);
    record(
      report.schema,
      `表 ${t} 可读`,
      error ? "FAIL" : "PASS",
      error?.message ?? ""
    );
  }

  const { error: inviteCountErr } = await db
    .from("users")
    .select("invite_count")
    .limit(1);
  record(
    report.schema,
    "users.invite_count（006）",
    inviteCountErr?.message?.includes("invite_count") ? "FAIL" : "PASS",
    inviteCountErr?.message ?? "列存在"
  );

  const { error: tasksErr } = await db
    .from("users")
    .select("growth_tasks_done")
    .limit(1);
  record(
    report.schema,
    "users.growth_tasks_done（006）",
    tasksErr?.message?.includes("growth_tasks_done") ? "FAIL" : "PASS",
    tasksErr?.message ?? "列存在"
  );

  const { data: growthCols } = await db
    .from("users")
    .select("growth_xp, streak_days, last_checkin_date, invite_blind_box_count")
    .limit(1);
  record(
    report.schema,
    "users 成长/盲盒列（005）",
    growthCols !== null ? "PASS" : "FAIL",
    growthCols ? "OK" : "查询失败"
  );

  const { data: anyUser } = await db.from("users").select("id").limit(1).maybeSingle();
  const testUserId = anyUser?.id;
  if (!testUserId) {
    record(report.schema, "generations 插入探测", "SKIP", "库中无用户，跳过");
  }

  const { error: insertV1 } = testUserId
    ? await db.from("generations").insert({
    user_id: testUserId,
    type: "topic_box",
    topic: "schema-test-v1",
    input: {},
    output: { topic: "测试" },
    cost_quota: 0,
    risk_level: "低",
  })
    : { error: { message: "no_user" } };
  const need006 =
    insertV1?.message?.includes("generations_type_check") ||
    insertV1?.message?.includes("violates check constraint");
  record(
    report.schema,
    "generations.type=topic_box（006 新类型）",
    insertV1 && need006 ? "FAIL" : insertV1 ? "FAIL" : "PASS",
    insertV1
      ? need006
        ? "请执行 006_fix_generations_and_invite.sql"
        : insertV1.message
      : "CHECK 已包含 topic_box"
  );
  if (!insertV1) {
    await db.from("generations").delete().eq("topic", "schema-test-v1");
  }
}

async function runApiTests(base, db) {
  console.log("\n--- 本地 API 入库（server 模式）---\n");

  let cookie = "";

  const send = await apiFetch(base, "/api/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ mobile: TEST_MOBILE }),
  });
  const code =
    send.data.devCode ??
    (await db
      .from("sms_logs")
      .select("code")
      .eq("mobile", TEST_MOBILE)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()).data?.code;

  record(
    report.api,
    "POST /api/auth/send-code",
    send.res.ok && code ? "PASS" : "FAIL",
    send.res.ok ? `验证码已生成` : send.data.error ?? String(send.res.status)
  );
  if (!code) return;

  const login = await apiFetch(base, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobile: TEST_MOBILE, code: String(code) }),
  });
  cookie = login.cookie || cookie;
  const userId = login.data.user?.id;
  record(
    report.api,
    "POST /api/auth/login",
    login.res.ok && userId ? "PASS" : "FAIL",
    login.res.ok ? `userId=${userId?.slice(0, 8)}…` : login.data.error ?? ""
  );
  if (!userId) return;

  const beforeGen = await db
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const state = await apiFetch(base, "/api/v1/product-state", {
    headers: { Cookie: cookie },
  });
  record(
    report.api,
    "GET /api/v1/product-state",
    state.res.ok && state.data.dailyUsage ? "PASS" : "FAIL",
    state.res.ok
      ? `topicBox=${state.data.dailyUsage?.topicBox} xp=${state.data.growth?.xp}`
      : state.data.error ?? ""
  );

  const topic = await apiFetch(base, "/api/v1/topic-box", {
    method: "POST",
    headers: { Cookie: cookie },
    body: JSON.stringify({
      platform: "抖音",
      track: "职场",
      goal: "涨粉",
      style: "温柔",
    }),
  });
  record(
    report.api,
    "POST /api/v1/topic-box",
    topic.res.ok && topic.data.result ? "PASS" : "FAIL",
    topic.res.ok
      ? `saved=${topic.data.saved ?? "?"}`
      : topic.data.error ?? String(topic.res.status)
  );

  await new Promise((r) => setTimeout(r, 400));

  const afterTopic = await db
    .from("generations")
    .select("id, type, topic")
    .eq("user_id", userId)
    .eq("type", "topic_box")
    .order("created_at", { ascending: false })
    .limit(1);

  const topicRow = afterTopic.data?.[0];
  record(
    report.data,
    "DB: topic_box 写入 generations",
    topicRow ? "PASS" : "FAIL",
    topicRow ? `id=${topicRow.id}` : "无新记录（006 未跑或 recordGeneration 失败）"
  );

  const usageAfter = await db
    .from("user_daily_usage")
    .select("topic_box_count")
    .eq("user_id", userId)
    .eq("usage_date", new Date().toISOString().slice(0, 10))
    .maybeSingle();
  record(
    report.data,
    "DB: user_daily_usage.topic_box_count",
    usageAfter.data && usageAfter.data.topic_box_count >= 1 ? "PASS" : "FAIL",
    usageAfter.data
      ? `count=${usageAfter.data.topic_box_count}`
      : usageAfter.error?.message ?? "无今日行"
  );

  const growth = await apiFetch(base, "/api/v1/growth", {
    method: "POST",
    headers: { Cookie: cookie },
    body: JSON.stringify({ action: "checkin" }),
  });
  record(
    report.api,
    "POST /api/v1/growth checkin",
    growth.res.ok && growth.data.growth ? "PASS" : "FAIL",
    growth.res.ok
      ? `streak=${growth.data.growth?.streakDays}`
      : growth.data.error ?? ""
  );

  const { data: userGrowth } = await db
    .from("users")
    .select("growth_xp, streak_days, growth_tasks_done, last_checkin_date")
    .eq("id", userId)
    .single();
  record(
    report.data,
    "DB: 签到写入 users 成长字段",
    userGrowth && Number(userGrowth.streak_days) >= 1 ? "PASS" : "FAIL",
    userGrowth
      ? `xp=${userGrowth.growth_xp} streak=${userGrowth.streak_days}`
      : ""
  );

  const score = await apiFetch(base, "/api/v1/score", {
    method: "POST",
    headers: { Cookie: cookie },
    body: JSON.stringify({
      title: "自测标题",
      script: "自测脚本内容",
    }),
  });
  record(
    report.api,
    "POST /api/v1/score",
    score.res.ok && score.data.result ? "PASS" : "FAIL",
    score.res.ok ? `saved=${score.data.saved ?? "?"}` : score.data.error ?? ""
  );

  const me = await apiFetch(base, "/api/me?sync=1", {
    headers: { Cookie: cookie },
  });
  const histCount = me.data.histories?.length ?? 0;
  record(
    report.api,
    "GET /api/me?sync=1 内容库",
    me.res.ok && histCount > 0 ? "PASS" : "FAIL",
    me.res.ok ? `histories=${histCount}` : me.data.error ?? ""
  );

  const hot = await apiFetch(base, "/api/v1/hot-topics");
  record(
    report.api,
    "GET /api/v1/hot-topics",
    hot.res.ok && Array.isArray(hot.data.items) ? "PASS" : "FAIL",
    hot.res.ok ? `items=${hot.data.items?.length}` : hot.data.error ?? ""
  );

  // 邀请：需要已有邀请码的用户
  const { data: inviter } = await db
    .from("users")
    .select("id, mobile, invite_code, invite_blind_box_count")
    .not("invite_code", "is", null)
    .gt("invite_blind_box_count", 0)
    .limit(1)
    .maybeSingle();

  if (inviter?.invite_code) {
    const send2 = await apiFetch(base, "/api/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ mobile: TEST_MOBILE_INVITEE }),
    });
    const code2 =
      send2.data.devCode ??
      (
        await db
          .from("sms_logs")
          .select("code")
          .eq("mobile", TEST_MOBILE_INVITEE)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ).data?.code;

    if (code2) {
      const login2 = await apiFetch(base, "/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          mobile: TEST_MOBILE_INVITEE,
          code: String(code2),
          inviteCode: inviter.invite_code,
        }),
      });
      record(
        report.api,
        "邀请注册 POST /api/auth/login + inviteCode",
        login2.res.ok ? "PASS" : "FAIL",
        login2.res.ok ? "" : login2.data.error ?? ""
      );

      const { data: ir } = await db
        .from("invite_records")
        .select("id")
        .eq("invitee_user_id", login2.data.user?.id)
        .maybeSingle();
      record(
        report.data,
        "DB: invite_records 新记录",
        ir ? "PASS" : "FAIL",
        ir ? "" : "无 invite_records（005 未跑或邀请失败）"
      );

      record(
        report.data,
        "DB: 邀请人 invite_count",
        "SKIP",
        "可在 Table Editor 查看 inviter.invite_count 是否 +1"
      );
    }
  } else {
    record(
      report.api,
      "邀请/盲盒链路",
      "SKIP",
      "库中无 invite_blind_box_count>0 的用户，跳过"
    );
  }

  const inviterBlind = await apiFetch(base, "/api/v1/invite/blind-box", {
    method: "POST",
    headers: { Cookie: cookie },
  });
  record(
    report.api,
    "POST /api/v1/invite/blind-box（新用户）",
    inviterBlind.res.status === 402 ? "PASS" : inviterBlind.res.ok ? "PASS" : "FAIL",
    inviterBlind.res.status === 402
      ? "无盲盒次数（符合预期）"
      : inviterBlind.data.reward?.label ?? inviterBlind.data.error ?? ""
  );

  report.testUser = { mobile: TEST_MOBILE, userId };
  report.generationsBefore = beforeGen.count;
}

async function main() {
  console.log("\n========================================");
  console.log("  入库链路自测报告（自动生成）");
  console.log("========================================\n");

  record(
    report.env,
    "NEXT_PUBLIC_BACKEND_MODE=server",
    env.NEXT_PUBLIC_BACKEND_MODE === "server" ? "PASS" : "FAIL"
  );
  record(
    report.env,
    "Supabase URL + Service Role",
    SUPABASE_URL?.startsWith("https://") && SERVICE_KEY?.startsWith("eyJ")
      ? "PASS"
      : "FAIL"
  );

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log("\n❌ 缺少 Supabase 配置，退出");
    process.exit(1);
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  await runSchemaTests(db);

  const dev = await detectDevPort();
  if (!dev) {
    record(
      report.api,
      "本地 dev 服务",
      "SKIP",
      "未检测到 3000/3001/3002，请先 npm run dev"
    );
  } else {
    const base = `http://${dev.host}:${dev.port}`;
    console.log(`\nℹ️  使用 ${base}\n`);
    report.devBase = base;
    await runApiTests(base, db);
  }

  report.finishedAt = new Date().toISOString();
  const outPath = resolve(root, "docs", "测试报告-入库自测.md");
  const md = buildMarkdown(report);
  const { writeFileSync } = await import("fs");
  writeFileSync(outPath, md, "utf8");

  console.log("\n========================================");
  console.log(
    `合计: ✅ ${report.summary.pass}  ❌ ${report.summary.fail}  ⏭️ ${report.summary.skip}`
  );
  console.log(`报告已写入: docs/测试报告-入库自测.md`);
  console.log("========================================\n");

  process.exit(report.summary.fail > 0 ? 1 : 0);
}

function buildMarkdown(r) {
  const lines = [
    `# 入库链路自测报告`,
    ``,
    `| 项目 | 值 |`,
    `|------|-----|`,
    `| 开始时间 | ${r.startedAt} |`,
    `| 结束时间 | ${r.finishedAt ?? "-"} |`,
    `| 通过 | ${r.summary.pass} |`,
    `| 失败 | ${r.summary.fail} |`,
    `| 跳过 | ${r.summary.skip} |`,
    ``,
  ];
  if (r.testUser) {
    lines.push(`**测试账号**: \`${r.testUser.mobile}\`（userId: \`${r.testUser.userId}\`）`, ``);
  }
  for (const [title, key] of [
    ["环境", "env"],
    ["Supabase 结构", "schema"],
    ["API", "api"],
    ["数据库写入", "data"],
  ]) {
    const rows = r[key];
    if (!rows?.length) continue;
    lines.push(`## ${title}`, ``, `| 用例 | 结果 | 说明 |`, `|------|------|------|`);
    for (const row of rows) {
      lines.push(`| ${row.name} | ${row.status} | ${row.detail || "-"} |`);
    }
    lines.push(``);
  }
  const need005 = r.schema?.some(
    (x) => x.name.includes("invite_records") && x.status === "FAIL"
  );
  const need006 = r.schema?.some(
    (x) => x.name.includes("topic_box") && x.status === "FAIL"
  );
  if (need005 || need006) {
    lines.push(`## 待执行 SQL（Supabase SQL Editor）`, ``);
    if (need005) {
      lines.push(
        `1. 打开并**整段执行**：\`supabase/migrations/005_v1_product_invite_growth.sql\``,
        ``
      );
    }
    if (need006) {
      lines.push(
        `${need005 ? "2" : "1"}. 再执行：\`supabase/migrations/006_fix_generations_and_invite.sql\``,
        ``
      );
    }
    lines.push(`执行后重新运行：\`node scripts/test-supabase-ingest.mjs\``, ``);
  }
  if (r.summary.fail > 0) {
    lines.push(
      `## 修复建议`,
      ``,
      `- **saved=false / 内容库为空**：多为 006 未执行，\`generations.type\` CHECK 拦住了写入`,
      `- **每日限额表报错**：005 未执行，缺 \`user_daily_usage\``,
      `- **签到/成长无变化**：005 未执行，缺 \`growth_xp\` 等列`,
      `- **API 全跳过**：\`npm run dev\` 后重跑自测脚本`,
      ``
    );
  }
  return lines.join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
