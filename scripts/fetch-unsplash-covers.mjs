/**
 * 从 Unsplash 拉取分类实景（Wikimedia 429 时的补充）
 * node scripts/fetch-unsplash-covers.mjs
 */

import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "covers");

/** Pexels 直链（国内比 Unsplash / Wikimedia 更稳） */
const TARGETS = [
  ["fashion-1.jpg", "https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=640&h=853&fit=crop"],
  ["fashion-2.jpg", "https://images.pexels.com/photos/2983468/pexels-photo-2983468.jpeg?auto=compress&cs=tinysrgb&w=640&h=853&fit=crop"],
  ["family-1.jpg", "https://images.pexels.com/photos/3826678/pexels-photo-3826678.jpeg?auto=compress&cs=tinysrgb&w=640&h=853&fit=crop"],
  ["family-2.jpg", "https://images.pexels.com/photos/751862/pexels-photo-751862.jpeg?auto=compress&cs=tinysrgb&w=640&h=853&fit=crop"],
  ["emotional-1.jpg", "https://images.pexels.com/photos/1415750/pexels-photo-1415750.jpeg?auto=compress&cs=tinysrgb&w=640&h=853&fit=crop"],
  ["emotional-2.jpg", "https://images.pexels.com/photos/1251171/pexels-photo-1251171.jpeg?auto=compress&cs=tinysrgb&w=640&h=853&fit=crop"],
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadOne(name, url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "emotion-ai-h5/1.0" },
    signal: AbortSignal.timeout(60000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error(`too small ${buf.length}`);
  await writeFile(join(outDir, name), buf);
  console.log(`  ✅ ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  console.log("\n📥 Unsplash → public/images/covers\n");
  for (const [name, url] of TARGETS) {
    try {
      await downloadOne(name, url);
      await sleep(2500);
    } catch (e) {
      console.warn(`  ⚠️ ${name}: ${e.message}`);
    }
  }
}

main();
