import type { HotTopicItem } from "@/lib/hot-topics/types";
import { ensureHotTopicFields } from "@/lib/content/hot-topic-fields";
import { resolveHotTopicCover } from "@/lib/content/hot-topic-covers";

/** 热点展示扩展字段（UI 层） */
export type HotTopicDisplay = HotTopicItem & {
  coverGradient: string;
  viralScore: number;
  platform: string;
  isNew: boolean;
  targetUsers: string[];
  recommendAngles: string[];
  heatNum: number;
  heatValue: string;
  coverImage: string;
};

const COVERS = [
  "from-[#FFB8D0] to-[#FF9A6B]",
  "from-[#FFC4A8] to-[#FF6B9D]",
  "from-[#FFD4A8] to-[#FF7AAE]",
  "from-[#FFB0C8] to-[#FF9A4D]",
  "from-[#FFE0C8] to-[#FF5C8A]",
];

const TARGET_POOL = [
  ["上班族", "情感号", "生活号"],
  ["学生党", "成长号", "Vlog号"],
  ["宝妈", "治愈号", "日常号"],
  ["宠物号", "萌宠号", "生活号"],
  ["美食号", "探店号", "种草号"],
  ["穿搭号", "时尚号", "种草号"],
];

const ANGLE_POOL = [
  ["下班vlog", "放松治愈", "周末计划"],
  ["30天改变", "真实记录", "前后对比"],
  ["萌宠日常", "治愈瞬间", "互动玩法"],
  ["一人食", "探店vlog", "性价比"],
  ["反差穿搭", "平价好物", "场景切换"],
  ["学习打卡", "效率方法", "逆袭故事"],
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function parseHeatNum(heatValue: string): number {
  const m = heatValue.match(/([\d.]+)\s*(w|万|k)?/i);
  if (!m) return 50;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "").toLowerCase();
  if (unit === "w" || unit === "万") return n;
  if (unit === "k") return n / 10;
  return n;
}

/** 为热点补齐 UI 展示字段；API 已有字段优先保留 */
export function enrichHotTopic(item: HotTopicItem, index = 0): HotTopicDisplay {
  const base = ensureHotTopicFields(item);
  const h = hashStr(base.id || base.title);
  const poolIdx = h % TARGET_POOL.length;
  const heatValue = base.heatValue!;

  return {
    ...base,
    coverImage: resolveHotTopicCover(base),
    coverGradient: COVERS[h % COVERS.length],
    viralScore: base.viralScore!,
    platform: base.platform!,
    isNew: item.isNew ?? (index < 3 || h % 5 === 0),
    targetUsers: item.targetUsers?.length ? item.targetUsers : TARGET_POOL[poolIdx],
    recommendAngles: item.recommendAngles?.length
      ? item.recommendAngles
      : base.angle
        ? [base.angle, ...ANGLE_POOL[poolIdx].slice(0, 2)]
        : ANGLE_POOL[poolIdx],
    heatNum: parseHeatNum(heatValue),
    heatValue,
  };
}

export function enrichHotTopics(items: HotTopicItem[]): HotTopicDisplay[] {
  return items.map((item, i) => enrichHotTopic(item, i));
}
