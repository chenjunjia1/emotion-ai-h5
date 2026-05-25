/**
 * 自测：今日热点各分类 → 封面场景是否与标题/分类一致
 * 运行: npx tsx scripts/verify-hot-topic-covers.ts
 */
import { resolveSceneCategory } from "../src/lib/content/scene-cover-presets";

const MOODS = ["美食", "治愈", "情感", "生活", "宠物", "穿搭", "职场"] as const;

const SAMPLES: Record<(typeof MOODS)[number], { title: string; category: string }[]> = {
  美食: [
    { title: "天津美食逛吃vlog", category: "美食" },
    { title: "一人食 · 评论区高互动写法", category: "美食" },
    { title: "便利店测评 · 朋友圈同款文案", category: "美食" },
  ],
  治愈: [
    { title: "夏天味道治愈日常", category: "治愈" },
    { title: "不开心的时候先抱抱自己", category: "治愈" },
  ],
  情感: [
    { title: "情绪共鸣 · 深夜文案", category: "情感" },
    { title: "恋爱里的小委屈", category: "情感" },
  ],
  生活: [
    { title: "朋友圈种草好物清单", category: "生活" },
    { title: "桌面氛围感摆拍", category: "生活" },
  ],
  宠物: [
    { title: "猫咪治愈时刻", category: "宠物" },
    { title: "萌宠日常 vlog", category: "宠物" },
  ],
  穿搭: [
    { title: "夏日 OOTD 多巴胺穿搭", category: "穿搭" },
    { title: "美美的出门穿搭公式", category: "穿搭" },
  ],
  职场: [
    { title: "职场逆袭干货笔记", category: "职场" },
    { title: "Mac 办公效率提升", category: "职场" },
  ],
};

const EXPECTED: Record<(typeof MOODS)[number], string> = {
  美食: "food",
  治愈: "emotional",
  情感: "emotional",
  生活: "lifestyle",
  宠物: "pet",
  穿搭: "fashion",
  职场: "study",
};

let failed = 0;

for (const mood of MOODS) {
  console.log(`\n=== ${mood} ===`);
  for (const item of SAMPLES[mood]) {
    const cat = resolveSceneCategory(item.title, item.category);
    const ok = cat === EXPECTED[mood];
    if (!ok) failed++;
    console.log(`${ok ? "✓" : "✗"} [${cat}] ${item.title}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} 条分类不匹配`);
  process.exit(1);
}
console.log("\n全部通过：列表封面主图为分类实景（/images/covers + 同类图库）");
