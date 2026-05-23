#!/usr/bin/env node
/**
 * 检查首页 CSS 是否可访问（无样式页 = layout.css 404）
 */
const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";

async function check() {
  const home = await fetch(BASE, { redirect: "follow" });
  if (!home.ok) {
    console.error(`[verify-dev-css] 首页 HTTP ${home.status}`);
    return false;
  }
  const html = await home.text();
  const m = html.match(/href="(\/_next\/static\/css\/[^"]+)"/);
  if (!m) {
    console.error("[verify-dev-css] HTML 中未找到 CSS 链接");
    return false;
  }
  const cssUrl = `${BASE}${m[1]}`;
  const css = await fetch(cssUrl);
  if (!css.ok) {
    console.error(`[verify-dev-css] CSS 404: ${cssUrl}`);
    console.error("请执行: npm run dev:fresh");
    return false;
  }
  const text = await css.text();
  if (text.length < 500) {
    console.error("[verify-dev-css] CSS 文件过小，可能损坏");
    return false;
  }
  console.log(`[verify-dev-css] OK (${text.length} bytes)`);
  return true;
}

const ok = await check();
process.exit(ok ? 0 : 1);
