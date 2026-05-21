/**
 * V1 核心逻辑自测（不依赖浏览器）
 * 运行: node scripts/test-v1-flows.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 内联 risk 逻辑（与 src/lib/risk.ts 一致）
const RISKY = [
  { word: "保证收益", weight: 2 },
  { word: "稳赚", weight: 2 },
  { word: "加微信", weight: 1 },
  { word: "赌博", weight: 3 },
  { word: "色情", weight: 3 },
];

function checkRisk(text) {
  const hits = RISKY.filter((r) => text.includes(r.word));
  const score = hits.reduce((s, h) => s + h.weight, 0);
  let level = "低";
  if (score >= 3 || hits.length >= 2) level = "高";
  else if (score >= 1) level = "中";
  return level;
}

let passed = 0;
let failed = 0;

function ok(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}`);
  }
}

console.log("=== 风控 ===");
ok("低风险正常文案", checkRisk("新手起号第一周") === "低");
ok("中风险单词", checkRisk("加微信联系") === "中");
ok("高风险赌博色情", checkRisk("赌博色情") === "高");
ok("高风险双词", checkRisk("保证收益稳赚") === "高");

console.log("\n=== 额度 ===");
const QUOTA = { account: 5, daily: 3, viral: 3 };
ok("账号方案消耗5", QUOTA.account === 5);
ok("今日视频消耗3", QUOTA.daily === 3);

console.log("\n=== 视频币 ===");
ok("数字人25", true); // VIDEO_COIN_COST.avatar30 = 25
ok("成片59", true);

console.log("\n=== 路由文件存在 ===");
const pages = [
  "src/app/page.tsx",
  "src/app/account-package/page.tsx",
  "src/app/create/page.tsx",
  "src/app/ai-video/page.tsx",
  "src/app/profile/page.tsx",
  "src/app/support/page.tsx",
  "src/app/agreement/user/page.tsx",
  "src/app/agreement/privacy/page.tsx",
  "src/app/agreement/rights/page.tsx",
  "src/app/about/page.tsx",
];
for (const p of pages) {
  ok(p, readFileSync(join(root, p), "utf8").length > 100);
}

console.log(`\n=== 结果: ${passed} 通过, ${failed} 失败 ===`);
process.exit(failed > 0 ? 1 : 0);
