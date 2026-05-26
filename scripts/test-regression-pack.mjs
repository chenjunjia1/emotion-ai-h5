/**
 * 发布包 / 复盘 / 轮播 回归测试（正反向）
 * 运行: node scripts/test-regression-pack.mjs
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const results = [];

function case_(name, fn, expectPass = true) {
  try {
    fn();
    results.push({ name, pass: expectPass, note: expectPass ? "ok" : "应失败但通过了" });
  } catch (e) {
    results.push({
      name,
      pass: !expectPass,
      note: expectPass ? String(e.message || e) : "预期失败 ✓",
    });
  }
}

// —— 复盘 → 发布包 URL（正向）——
case_("review-bridge: 含推荐选题与复盘建议", () => {
  const src = read("src/lib/publish-pack/review-bridge.ts");
  assert.match(src, /buildPublishPackHrefFromReview/);
  assert.match(src, /from_review/);
  assert.match(src, /review_hint/);
});

case_("review-bridge: merge 含复盘关键字", () => {
  const src = read("src/lib/publish-pack/review-bridge.ts");
  assert.match(src, /mergeReviewExtraNote/);
  assert.match(src, /请按复盘推荐选题原创生成/);
});

// —— 两步向导（正向）——
case_("wizard: 仅两步文案", () => {
  const src = read("src/lib/publish-pack/moments-options.ts");
  assert.match(src, /WIZARD_STEPS = \["填写选题与方向", "生成内容"\]/);
});

case_("publish-pack: 无独立下一步平台步", () => {
  const src = read("src/app/publish-pack/page.tsx");
  assert.doesNotMatch(src, /PlatformSelectGrid/);
  assert.match(src, /PlatformCompactChips/);
  assert.doesNotMatch(src, /setWizardStep/);
  assert.doesNotMatch(src, /GeneratingProgressCard/);
});

// —— 首页轮播（正向）——
case_("carousel: 第二屏为盲盒+助手", () => {
  const src = read("src/components/home/home-cream-carousel.tsx");
  assert.match(src, /HomeAttractCarouselSlide/);
  assert.doesNotMatch(src, /HomePublishPackCarouselSlide/);
  assert.match(src, /"attract"/);
});

// —— AI 助手（正向）——
case_("ai-assistant: 选场景不自动 submitQuestion", () => {
  const src = read("src/components/ai-assistant/ai-assistant-view.tsx");
  const pick = src.slice(src.indexOf("const onQuickPick"), src.indexOf("const copyAnswer"));
  assert.doesNotMatch(pick, /submitQuestion\(prompt/);
  assert.match(pick, /setMessage\(prompt\)/);
});

// —— 热点卡片 ring（正向）——
case_("xhs-feed: 首条用 border 而非外扩 ring", () => {
  const src = read("src/components/hot-topics/xhs-hot-notes-feed.tsx");
  assert.match(src, /ring-inset/);
  assert.match(src, /border-2 border-\[#FF4F8B\]/);
});

// —— 反向：旧三步结构应不存在 ——
case_("反向: WIZARD_STEPS 不含「选择平台」", () => {
  const steps = read("src/lib/publish-pack/moments-options.ts");
  const m = steps.match(/WIZARD_STEPS = (\[[^\]]+\])/);
  assert.ok(m, "WIZARD_STEPS 定义缺失");
  assert.doesNotMatch(m[1], /选择平台/);
});

case_("反向: publish-pack 无「下一步：选择内容方向」", () => {
  const page = read("src/app/publish-pack/page.tsx");
  assert.doesNotMatch(page, /下一步：选择内容方向/);
});

// 输出报告
const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass);

console.log("\n=== 回归测试报告 ===\n");
for (const r of results) {
  console.log(`${r.pass ? "✅" : "❌"} ${r.name}`);
  if (!r.pass || r.note.includes("预期")) console.log(`   ${r.note}`);
}
console.log(`\n合计: ${passed}/${results.length} 通过`);
if (failed.length) {
  process.exit(1);
}
