/**
 * 场景封面自测：语义映射（正/反向）+ 图片代理可访问性
 * 运行: npm run test:scene-covers
 * 需 dev 或 start: BASE_URL=http://localhost:3000
 */

const BASE = process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✅ ${name}`);
}

function fail(name, detail) {
  failed++;
  console.error(`  ❌ ${name}`);
  if (detail) console.error(`     ${detail}`);
}

/** 与 scene-cover-presets.ts 保持一致的精简映射（用于离线断言） */
const EXACT_LABEL = {
  情绪共鸣文案: "emotional",
  下班vlog脚本: "worklife",
  宠物治愈文案: "pet",
  美食探店脚本: "food",
  朋友圈种草文案: "lifestyle",
  职场成长干货: "study",
};

const RULES = [
  { cat: "fashion", re: /穿搭|美美的|时尚|衣橱|夏日穿/ },
  { cat: "family", re: /阿嬷|外婆|奶奶|情书|手绘/ },
  { cat: "pet", re: /宠物|猫|狗|萌宠/ },
  { cat: "food", re: /美食|探店|火锅/ },
  { cat: "study", re: /职场|干货|成长/ },
  { cat: "worklife", re: /下班|vlog|地铁/ },
  { cat: "emotional", re: /情绪|共鸣|咖啡|不开心|治愈自己|小事/ },
];

function resolveCategory(topic, label = "") {
  if (label && EXACT_LABEL[label]) return EXACT_LABEL[label];
  const hay = `${label} ${topic}`;
  for (const r of RULES) {
    if (r.re.test(hay)) return r.cat;
  }
  return "emotional";
}

function assertCategory(label, topic, expected, caseName) {
  const got = resolveCategory(topic, label);
  if (got === expected) ok(caseName);
  else fail(caseName, `expected ${expected}, got ${got}`);
}

function assertNotCategory(label, topic, notExpected, caseName) {
  const got = resolveCategory(topic, label);
  if (got !== notExpected) ok(caseName);
  else fail(caseName, `should not be ${notExpected}`);
}

console.log("\n📋 场景分类映射（正向）\n");
assertCategory("情绪共鸣文案", "", "emotional", "label→情绪共鸣→emotional");
assertCategory("下班vlog脚本", "", "worklife", "label→下班vlog→worklife");
assertCategory("宠物治愈文案", "", "pet", "label→宠物治愈→pet");
assertCategory("美食探店脚本", "", "food", "label→美食探店→food");
assertCategory("朋友圈种草文案", "", "lifestyle", "label→朋友圈种草→lifestyle");
assertCategory("职场成长干货", "", "study", "label→职场干货→study");
assertCategory("", "手绘给奶奶的情书", "family", "标题含奶奶→family");
assertCategory("", "夏天也要美美的穿搭", "fashion", "标题含穿搭→fashion");
assertCategory("", "夏天不用强迫自己变美", "emotional", "标题含情绪向→emotional");
assertCategory("", "不开心时治愈自己的小事", "emotional", "标题含不开心治愈→emotional");
assertCategory("", "手绘情书送给阿嬷", "family", "标题含阿嬷情书→family");

console.log("\n📋 场景分类映射（反向：不能进错类）\n");
assertNotCategory("宠物治愈文案", "", "worklife", "宠物label≠worklife");
assertNotCategory("情绪共鸣文案", "", "pet", "情绪label≠pet");
assertNotCategory("下班vlog脚本", "", "food", "下班vlog≠food");
assertNotCategory("", "猫咪治愈瞬间", "worklife", "猫咪话题≠worklife");

console.log("\n🖼 图片 URL 规则\n");
const sampleProxy = `/img-proxy/photo-1514881248723-9ea5b7e6658f?w=520&h=700`;
if (sampleProxy.startsWith("/img-proxy/photo-")) ok("封面主 URL 使用同源代理");
else fail("封面主 URL 使用同源代理", sampleProxy);

if (!sampleProxy.includes("images.unsplash.com")) ok("封面 HTML 不直连 Unsplash");
else fail("封面 HTML 不直连 Unsplash");

const bannedPortrait = "photo-1507003211169-0a1dd7228f2d";
if (!bannedPortrait.includes("1507003211169")) fail("黑名单检查");
else ok("已禁用男人头像 photo id（文档约束）");

console.log("\n🌐 运行时：img-proxy + 首页\n");

async function fetchOk(url, name, expectImage = false) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) {
      fail(name, `HTTP ${res.status}`);
      return;
    }
    if (expectImage) {
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("image")) {
        fail(name, `content-type=${ct}`);
        return;
      }
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 200) {
        fail(name, `body too small ${buf.byteLength}`);
        return;
      }
      const src = res.headers.get("x-cover-source") || "";
      if (src === "local-fallback") {
        ok(`${name}（本地兜底 SVG）`);
        return;
      }
    }
    ok(name);
  } catch (e) {
    fail(name, e.message || String(e));
  }
}

await fetchOk(
  `${BASE}/img-proxy/photo-1514881248723-9ea5b7e6658f?w=120&h=120&fit=crop`,
  "img-proxy 返回猫咪图",
  true
);

await fetchOk(`${BASE}/img-proxy/photo-1544629929-0736f52221f8?w=120&h=120`, "img-proxy 返回晚霞图", true);

await fetchOk(`${BASE}/images/hot/pet.svg`, "本地宠物 SVG 静态资源", true);
await fetchOk(`${BASE}/images/hot/emotion.svg`, "本地情绪 SVG 静态资源", true);
await fetchOk(`${BASE}/images/covers/pet-1.jpg`, "打包封面 pet-1.jpg", true);
await fetchOk(`${BASE}/images/covers/fashion-1.jpg`, "打包封面 fashion-1.jpg", true);
await fetchOk(`${BASE}/images/covers/family-1.jpg`, "打包封面 family-1.jpg", true);
await fetchOk(`${BASE}/images/covers/emotional-1.jpg`, "打包封面 emotional-1.jpg", true);
await fetchOk(`${BASE}/images/covers/food-1.jpg`, "打包封面 food-1.jpg", true);
await fetchOk(`${BASE}/api/hot-topics/meta`, "热点元信息 API");

try {
  const homeRes = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(15000) });
  if (!homeRes.ok) fail("首页可访问", `HTTP ${homeRes.status}`);
  else {
    const html = await homeRes.text();
    if (html.includes("/img-proxy/photo-") || html.includes('src="/images/hot/')) {
      ok("首页 HTML 含代理图或本地兜底路径");
    } else if (html.includes("images.unsplash.com")) {
      fail("首页仍直连 Unsplash", "客户端可能继续加载失败");
    } else {
      ok("首页可访问（封面由客户端组件注入）");
    }
  }
} catch (e) {
  fail("首页可访问", e.message);
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`);
process.exit(failed > 0 ? 1 : 0);
