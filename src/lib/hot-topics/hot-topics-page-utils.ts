import type { HotTopicItem } from "@/lib/hot-topics/types";

export type HotTopicsSceneTab = "all" | "douyin" | "xhs" | "moments";

export const HOT_SCENE_TABS: { id: HotTopicsSceneTab; label: string; hint: string }[] = [
  { id: "all", label: "今日精选", hint: "跟拍就能火" },
  { id: "douyin", label: "发抖音", hint: "短视频脚本向" },
  { id: "xhs", label: "发小红书", hint: "种草笔记向" },
  { id: "moments", label: "发朋友圈", hint: "短文案向" },
];

/** 首页二级分类（精简，避免信息过载） */
export const HOT_MOOD_FILTERS = [
  "全部",
  "治愈",
  "情感",
  "生活",
  "美食",
  "宠物",
  "穿搭",
  "职场",
] as const;

export function platformLabelForItem(item: HotTopicItem): string {
  const p = item.platformKey ?? item.platform ?? "";
  if (p === "douyin" || p === "抖音") return "抖音";
  if (p === "xiaohongshu_inspiration" || p === "xiaohongshu" || p === "小红书") return "小红书";
  if (/朋友圈|moments/i.test(p)) return "朋友圈";
  return "多平台";
}

export function filterBySceneTab(items: HotTopicItem[], tab: HotTopicsSceneTab): HotTopicItem[] {
  if (tab === "all") return items;
  if (tab === "douyin") {
    return items.filter(
      (i) =>
        i.platformKey === "douyin" ||
        i.platform === "抖音" ||
        /抖音|短视频|vlog/i.test(`${i.title}${i.track}${i.category ?? ""}`)
    );
  }
  if (tab === "xhs") {
    return items.filter(
      (i) =>
        i.platformKey === "xiaohongshu_inspiration" ||
        i.platform === "小红书" ||
        /小红书|种草|笔记|OOTD|穿搭/i.test(`${i.title}${i.track}${i.category ?? ""}`)
    );
  }
  /** 适合朋友圈：生活向、情感向、短句可发 */
  return items.filter((i) => {
    const hay = `${i.title}${i.category ?? ""}${i.track}${(i.tags ?? []).join("")}`;
    return /生活|情感|治愈|美食|宠物|日常|共鸣|朋友圈|小事|治愈自己/i.test(hay);
  });
}

export function filterByMood(items: HotTopicItem[], mood: string): HotTopicItem[] {
  if (mood === "全部") return items;
  return items.filter((i) => {
    const hay = `${i.title}${i.category ?? ""}${i.track}${i.desc ?? ""}`;
    return hay.includes(mood);
  });
}

export function suggestPublishPlatform(tab: HotTopicsSceneTab): string | undefined {
  if (tab === "douyin") return "抖音";
  if (tab === "xhs") return "小红书";
  if (tab === "moments") return "朋友圈";
  return undefined;
}
