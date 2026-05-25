/**
 * 下载实景封面 → public/images/covers（进仓库，国内可访问 Wikimedia）
 * 运行: npm run download:covers
 */

import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images", "covers");

/** 直链 Commons（非 thumb 路径，避免 400） */
const FILES = [
  ["emotional-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG"],
  ["emotional-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/16/Overlooking_the_city_at_night.jpg"],
  ["worklife-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/9/91/Train_in_Moscow_%28metro%29.jpg"],
  ["worklife-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/14/Evening_commute.jpg"],
  ["pet-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"],
  ["pet-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/2/26/YellowLabradorLooking_new.jpg"],
  ["food-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg"],
  ["food-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/7f/Chinese_dumplings.jpg"],
  ["lifestyle-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/57/Cosmetics_on_display.jpg"],
  ["lifestyle-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/4/45/Table_setting.jpg"],
  ["study-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/50/Desk-lamp_and_laptop_on_desk.jpg"],
  ["study-2.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/0c/Notebook_and_pencil.jpg"],
  ["fashion-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/8/84/Clothing_rack.jpg"],
  ["family-1.jpg", "https://upload.wikimedia.org/wikipedia/commons/d/d8/Grandmother_and_granddaughter.jpg"],
];

async function downloadOne(name, url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "emotion-ai-h5/1.0 (cover-assets)" },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error(`too small ${buf.length}`);
  await writeFile(join(outDir, name), buf);
  console.log(`  ✅ ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  console.log("\n📥 下载实景封面 → public/images/covers\n");
  let ok = 0;
  let fail = 0;
  for (const [name, url] of FILES) {
    try {
      await downloadOne(name, url);
      ok++;
    } catch (e) {
      fail++;
      console.warn(`  ⚠️ ${name}: ${e.message}`);
    }
  }
  console.log(`\n完成: ${ok} 成功, ${fail} 失败\n`);
  process.exit(fail > 4 ? 1 : 0);
}

main();
