import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";

export function xhsCardButtonLabel(tab: XhsFeedTab): string {
  switch (tab) {
    case "moments":
      return "生成朋友圈文案";
    case "work":
      return "生成打工人文案";
    default:
      return "改成我的文案";
  }
}

/** Tab 标题区副文案 — 强调结果，不提「禁止复制」 */
export const XHS_TAB_SECTION_COPY: Record<
  XhsFeedTab,
  { title: string; sub: string }
> = {
  hot: {
    title: "今日爆款",
    sub: "挑一条喜欢的 · 30 秒改成你的文案",
  },
  fashion: {
    title: "OOTD 灵感",
    sub: "穿搭构图参考 · 照着拍就能出片",
  },
  life: {
    title: "生活感",
    sub: "松弛日常 · 随手拍也能发",
  },
  weekend: {
    title: "周末碎片",
    sub: "出游探店 · 周末直接发",
  },
  moments: {
    title: "朋友圈秒发",
    sub: "搭子/干饭/演出/萌宠 · 1 张图一句话",
  },
  xhs: {
    title: "小红书体",
    sub: "图文笔记结构 · 九宫格也能抄",
  },
  food: {
    title: "好吃好拍",
    sub: "探店咖啡 · 食欲感拉满",
  },
  pet: {
    title: "萌宠",
    sub: "毛孩子治愈向 · 互动率高",
  },
  work: {
    title: "打工人",
    sub: "职场嘴替 · 打工人秒懂",
  },
};

export const XHS_TAB_EMOJI: Partial<Record<XhsFeedTab, string>> = {
  hot: "🔥",
  fashion: "👗",
  life: "🌿",
  weekend: "🎒",
  moments: "💬",
  xhs: "📕",
  food: "🍜",
  pet: "🐱",
  work: "💼",
};
