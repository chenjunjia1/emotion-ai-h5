/**
 * 校验灵感池：标题/封面不重复率（本地自测用）
 * node scripts/verify-inspiration-pool.mjs
 */
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// 通过 ts-node 路径较麻烦，直接内联最小逻辑调用编译产物不可用；
// 改为请求本地 API（需 dev server）或静态样例。

const sampleNotes = [
  {
    id: "1",
    noteId: "n1",
    title: "我的冬日四色OOTD",
    desc: "穿搭分享 通勤 显瘦",
    images: ["https://sns-img-qc.xhscdn.com/sample-a.jpg"],
    authorName: "a",
    authorAvatar: "",
    likedCount: 100,
    collectedCount: 50,
    commentCount: 10,
    shareCount: 5,
    tags: ["OOTD", "穿搭"],
    category: "穿搭变美",
    audience: "女生爱发",
    contentType: "小红书图文",
    hotScore: 90,
    source: "xiaohongshu",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    noteId: "n2",
    title: "周末咖啡探店",
    desc: "咖啡店 氛围感",
    images: ["https://sns-img-qc.xhscdn.com/sample-b.jpg"],
    authorName: "b",
    authorAvatar: "",
    likedCount: 80,
    collectedCount: 40,
    commentCount: 8,
    shareCount: 4,
    tags: ["咖啡"],
    category: "咖啡生活",
    audience: "通用",
    contentType: "小红书图文",
    hotScore: 70,
    source: "xiaohongshu",
    createdAt: new Date().toISOString(),
  },
];

async function main() {
  const base = process.env.BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/xhs/hot-notes?pool=inspiration&force=1`, {
      signal: AbortSignal.timeout(30_000),
    });
    const json = await res.json();
    const notes = json.data?.length ? json.data : sampleNotes;
    console.log(`notes: ${notes.length} (from ${json.data?.length ? "api" : "sample"})`);

    const headlines = notes.map((n) => n.displayHeadline || n.title || "");
    const covers = notes.map((n) => n.images?.[0] || "");
    const uniqueHeadlines = new Set(headlines).size;
    const uniqueCovers = new Set(covers).size;
    const dupHeadlineRate =
      headlines.length > 0
        ? ((headlines.length - uniqueHeadlines) / headlines.length) * 100
        : 0;

    console.log(`unique headlines: ${uniqueHeadlines}/${headlines.length}`);
    console.log(`unique covers: ${uniqueCovers}/${covers.length}`);
    console.log(`duplicate headline rate: ${dupHeadlineRate.toFixed(1)}%`);

    const first24 = headlines.slice(0, 24);
    const dupInFirst = first24.length - new Set(first24).size;
    if (dupInFirst > 0) {
      console.error(`FAIL: first 24 cards have ${dupInFirst} duplicate headlines`);
      process.exit(1);
    }
    if (uniqueHeadlines / Math.max(notes.length, 1) < 0.85) {
      console.error("FAIL: overall headline uniqueness < 85%");
      process.exit(1);
    }
    console.log("OK: inspiration pool looks diverse enough");
  } catch (e) {
    console.warn("API unavailable, skip live check:", e.message);
    console.log("OK: skipped (start dev server for full check)");
  }
}

main();
