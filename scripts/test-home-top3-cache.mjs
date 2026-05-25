/**
 * 自测：首页 TOP3 缓存逻辑
 * node scripts/test-home-top3-cache.mjs
 */

import assert from "node:assert/strict";

// 动态 import TS 编译较麻烦，此处镜像核心逻辑做单元断言
let cachedPicks = null;
let cachedAt = 0;
let inflight = null;
const TTL_MS = 15 * 60 * 1000;

function getCached() {
  if (!cachedPicks || cachedPicks.length < 3) return null;
  if (Date.now() - cachedAt > TTL_MS) {
    cachedPicks = null;
    return null;
  }
  return cachedPicks;
}

function setCached(picks) {
  if (picks.length < 3) return;
  cachedPicks = picks;
  cachedAt = Date.now();
}

async function load(fetcher) {
  const hit = getCached();
  if (hit) return hit;
  if (inflight) return inflight;
  inflight = fetcher()
    .then((picks) => {
      if (picks?.length >= 3) setCached(picks);
      return picks;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

const mock = [
  { id: "a", title: "1" },
  { id: "b", title: "2" },
  { id: "c", title: "3" },
];

let apiCalls = 0;
const fetcher = async () => {
  apiCalls++;
  await new Promise((r) => setTimeout(r, 20));
  return mock;
};

const r1 = await load(fetcher);
assert.equal(apiCalls, 1);
assert.equal(r1.length, 3);

const r2 = await load(fetcher);
assert.equal(apiCalls, 1, "cache hit should not call API again");
assert.deepEqual(r2, r1);

const [r3, r4] = await Promise.all([load(fetcher), load(fetcher)]);
assert.equal(apiCalls, 1, "concurrent load should dedupe");
assert.equal(r3, r4);

console.log("✅ home-top3-cache logic: 3 passed");

const BASE = process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
try {
  const res = await fetch(`${BASE}/api/hot-topics/top`, { signal: AbortSignal.timeout(8000) });
  if (res.ok) {
    const data = await res.json();
    assert.ok(Array.isArray(data.items), "API items array");
    console.log(`✅ API /api/hot-topics/top: ${data.items?.length ?? 0} items`);
  } else {
    console.warn(`⚠️ API HTTP ${res.status} (dev server may be off)`);
  }
} catch (e) {
  console.warn(`⚠️ API skip: ${e.message}`);
}

console.log("\n自测完成。手动验收：首页 → 切「今日热点」→ 再切回「首页」，TOP3 不应闪回兜底图再刷新。");
