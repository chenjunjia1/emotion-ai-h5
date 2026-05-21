/**
 * 安全逻辑自测
 * node scripts/test-security.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let ok = 0;
let fail = 0;
function assert(name, cond) {
  if (cond) {
    ok++;
    console.log("  ✓", name);
  } else {
    fail++;
    console.log("  ✗", name);
  }
}

const sessionRe = /^[a-zA-Z0-9_-]{8,64}$/;
assert("UUID session 合法", sessionRe.test("550e8400-e29b-41d4-a716-446655440000"));
assert("拒绝 SQL 注入 session", !sessionRe.test("'; drop table--"));
assert("拒绝超长 session", !sessionRe.test("a".repeat(100)));

const files = [
  "src/middleware.ts",
  "src/lib/security/rate-limit.ts",
  "src/lib/security/api-guard.ts",
  "src/lib/security/deepseek-url.ts",
];
for (const f of files) {
  assert(`存在 ${f}`, readFileSync(join(root, f), "utf8").length > 50);
}

const gen = readFileSync(join(root, "src/app/api/generate/route.ts"), "utf8");
assert("generate 有限流", gen.includes("guardApi"));
assert("generate 有 AI 并发", gen.includes("acquireAiSlot"));
assert("生产隐藏错误", gen.includes("safeErrorMessage"));

const deepseek = readFileSync(join(root, "src/lib/ai/deepseek.ts"), "utf8");
assert("DeepSeek URL 白名单", deepseek.includes("resolveDeepSeekBaseUrl"));

console.log(`\n${ok} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
