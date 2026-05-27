import type { XhsNoteCategory } from "@/lib/xhs/types";

/** 与后台「今日热点」管理页一致的分类 Tab（首页灵感精选） */
export const XHS_HOME_INSPIRATION_CATEGORIES: XhsNoteCategory[] = [
  "美食打卡",
  "穿搭变美",
  "宠物萌系",
  "旅行出片",
  "城市生活",
  "治愈日常",
  "情绪文案",
  "职场嘴替",
];

export type XhsHomeInspirationTab = "all" | XhsNoteCategory;

export const XHS_HOME_INSPIRATION_TABS: { id: XhsHomeInspirationTab; label: string }[] = [
  { id: "all", label: "全部" },
  ...XHS_HOME_INSPIRATION_CATEGORIES.map((c) => ({ id: c, label: c })),
];
