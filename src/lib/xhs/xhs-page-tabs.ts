export type XhsFeedTab =
  | "hot"
  | "life"
  | "weekend"
  | "moments"
  | "xhs"
  | "food"
  | "fashion"
  | "pet"
  | "work";

/** 种草灵感库 Tab */
export const XHS_FEED_TABS: { id: XhsFeedTab; label: string; hint?: string }[] = [
  { id: "hot", label: "今日爆款", hint: "热度最高" },
  { id: "fashion", label: "OOTD灵感", hint: "穿搭变美" },
  { id: "life", label: "生活感", hint: "日常随手" },
  { id: "weekend", label: "周末碎片", hint: "出游探店" },
  { id: "moments", label: "朋友圈秒发", hint: "短文案" },
  { id: "xhs", label: "小红书体", hint: "图文笔记" },
  { id: "food", label: "好吃好拍", hint: "探店咖啡" },
  { id: "pet", label: "萌宠", hint: "毛孩子" },
  { id: "work", label: "打工人", hint: "职场嘴替" },
];

export { XHS_TAB_SECTION_COPY, XHS_TAB_EMOJI } from "@/lib/xhs/xhs-tab-ui";
