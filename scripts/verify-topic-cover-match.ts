/**
 * npx tsx scripts/verify-topic-cover-match.ts
 */
import {
  getCoverImage,
  resolveCoverScene,
  resolveCoverSceneFromTitle,
} from "../src/lib/content/topic-cover-match";

const CASES: { title: string; category: string; expect: string }[] = [
  { title: "夏天味道治愈日常", category: "治愈", expect: "summer_daily" },
  { title: "夏天不完美也很美", category: "生活", expect: "summer_life" },
  { title: "开心比长生不老重要", category: "治愈", expect: "happy_mood" },
  { title: "舞台造型怎么搭？", category: "穿搭", expect: "fashion_style" },
  { title: "记录一个普通下午", category: "生活", expect: "afternoon_life" },
  { title: "面试技巧·普通人也能抄的选题", category: "职场", expect: "interview" },
  { title: "工资坦白·爆款标题公式", category: "职场", expect: "salary" },
  { title: "打工人通勤·爆款标题公式", category: "职场", expect: "commute" },
  { title: "职场避坑·评论区高互动写法", category: "职场", expect: "copywriting" },
  { title: "天津美食逛吃vlog", category: "美食", expect: "food" },
];

const TOP5 = CASES.slice(0, 5);

let failed = 0;
TOP5.forEach((c, i) => {
  const fromTitle = resolveCoverSceneFromTitle(c.title);
  const scene = resolveCoverScene(c.title, c.category);
  const cover = getCoverImage(c.title, c.category, i);
  const ok = scene === c.expect && fromTitle === c.expect;
  if (!ok) failed++;
  const usesFoodBundled =
    cover.image.includes("/food") && c.expect !== "food";
  if (usesFoodBundled) failed++;
  console.log(
    `${ok ? "✓" : "✗"} [${scene}] ${c.title}${usesFoodBundled ? " (误用 food 图)" : ""}`
  );
});

const photos = TOP5.map((c, i) => getCoverImage(c.title, c.category, i).photoId);
const unique = new Set(photos).size;
let adjacentDup = false;
for (let i = 1; i < photos.length; i++) {
  if (photos[i] === photos[i - 1]) adjacentDup = true;
}

console.log(`\n首屏 5 条: ${unique} 张不同主图 id${adjacentDup ? " · 相邻重复 ✗" : ""}`);

CASES.slice(5).forEach((c, i) => {
  const scene = resolveCoverScene(c.title, c.category);
  if (scene !== c.expect) failed++;
});

if (failed || adjacentDup || unique < 4) {
  console.error("\n校验未通过");
  process.exit(1);
}
console.log(`\n${CASES.length} 条场景规则通过`);
