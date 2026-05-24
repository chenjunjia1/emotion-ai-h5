import type { HotTopicItem } from "@/lib/server/db/product-v1";
import { HOT_TOPICS_POOL, type HotTopicSeed } from "@/lib/hot-topics/daily-pool";
import { sortByHeat } from "@/lib/content/heat-level";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 确定性洗牌：同一天同一 batch 顺序稳定 */
function shuffleSeeded<T>(arr: T[], seedKey: string): T[] {
  const out = [...arr];
  let seed = hashSeed(seedKey);
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function toItem(seed: HotTopicSeed, id: string): HotTopicItem {
  const sources = seed.sources.join("·");
  return {
    id,
    title: seed.title,
    desc: `${seed.desc}（监测：${sources}）`,
    heat: seed.heat,
    track: seed.track,
    format: seed.format,
  };
}

export function getDailyHotTopics(dateKey: string, batch = 0): HotTopicItem[] {
  const ordered = shuffleSeeded(HOT_TOPICS_POOL, `${dateKey}-b${batch}`);
  const items = ordered.map((item, i) => toItem(item, `${dateKey}-${batch}-${i}`));
  return sortByHeat(items);
}

export function getHotTopicsMeta(dateKey: string) {
  return {
    date: dateKey,
    total: HOT_TOPICS_POOL.length,
    updatedAt: `${dateKey} 08:00`,
    sources: ["抖音", "小红书", "视频号"],
    note: "基于公开趋势与平台热门结构整理，按爆→高→中排序展示",
  };
}
