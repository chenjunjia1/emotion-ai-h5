import type { LibraryIconKind } from "@/components/icons/library-type-icons";

export type LibraryFilter = "all" | "pack" | "topic" | "review" | "emotion" | "treehole";

export type HistoryTypeIconKind = LibraryIconKind | "emoji";

export type HistoryTypeMeta = {
  icon: HistoryTypeIconKind;
  emoji?: string;
  label: string;
  shortLabel: string;
  grad: string;
  ring: string;
};

export const PACK_HISTORY_META: HistoryTypeMeta = {
  icon: "pack",
  label: "发布包",
  shortLabel: "发布包",
  grad: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
  ring: "ring-[#FF7AAE]/25",
};

export const BLINDBOX_HISTORY_META: HistoryTypeMeta = {
  icon: "blindbox",
  label: "灵感盲盒",
  shortLabel: "盲盒选题",
  grad: "from-[#FF8FAB] via-[#FF7AAE] to-[#FFC46B]",
  ring: "ring-[#FF7AAE]/30",
};

export const EMOTION_HISTORY_META: HistoryTypeMeta = {
  icon: "emotion",
  label: "AI助手",
  shortLabel: "AI助手",
  grad: "from-[#FF8EC4] via-[#FF5C8A] to-[#FF7AAE]",
  ring: "ring-[#FF7AAE]/30",
};

export const TREEHOLE_HISTORY_META: HistoryTypeMeta = {
  icon: "emoji",
  emoji: "🌙",
  label: "树洞陪聊",
  shortLabel: "树洞",
  grad: "from-[#7C3AED] via-[#A78BFA] to-[#FF9A4D]",
  ring: "ring-violet-300/50",
};

export const REVIEW_HISTORY_META: HistoryTypeMeta = {
  icon: "review",
  label: "内容复盘",
  shortLabel: "复盘",
  grad: "from-[#5EEAD4] via-[#2DD4BF] to-[#14B8A6]",
  ring: "ring-teal-200/80",
};

export const LIBRARY_STAT_METAS: Record<
  Exclude<LibraryFilter, "all">,
  HistoryTypeMeta
> = {
  pack: PACK_HISTORY_META,
  topic: BLINDBOX_HISTORY_META,
  emotion: EMOTION_HISTORY_META,
  treehole: TREEHOLE_HISTORY_META,
  review: REVIEW_HISTORY_META,
};

export function historyFilterForType(type: string): LibraryFilter | null {
  if (type.includes("树洞") || type.includes("expression_emotion")) return "treehole";
  if (type.includes("情绪") || type.includes("助手")) return "emotion";
  if (type.includes("诊断") || type.includes("带货")) return "emotion";
  if (type.includes("发布包") || type.includes("账号") || type.includes("爆品") || type.includes("朋友圈")) return "pack";
  if (type.includes("盲盒") || type.includes("选题")) return "topic";
  if (type.includes("复盘")) return "review";
  return null;
}

export function historyTypeMeta(type: string): HistoryTypeMeta {
  if (type.includes("树洞") || type.includes("expression_emotion")) {
    return { ...TREEHOLE_HISTORY_META, label: type.includes("树洞") ? type : TREEHOLE_HISTORY_META.label };
  }
  if (type.includes("情绪") || type.includes("助手")) {
    return { ...EMOTION_HISTORY_META, label: type };
  }
  if (type.includes("发布包") || type.includes("爆品") || type.includes("朋友圈") || type.includes("图文包")) {
    return {
      ...PACK_HISTORY_META,
      label: type,
      shortLabel: type.includes("朋友圈") ? "朋友圈" : type.includes("图文包") ? "图文包" : PACK_HISTORY_META.shortLabel,
    };
  }
  if (type.includes("配图") || type.includes("图片配文")) {
    return {
      icon: "pack",
      label: type,
      shortLabel: "配图",
      grad: "from-[#FF9A4D] via-[#FF7AAE] to-[#FFC46B]",
      ring: "ring-[#FF9A4D]/25",
    };
  }
  if (type.includes("盲盒") || type.includes("选题")) {
    return { ...BLINDBOX_HISTORY_META, label: type };
  }
  if (type.includes("复盘")) {
    return { ...REVIEW_HISTORY_META, label: type };
  }
  if (type.includes("神回复")) {
    return {
      icon: "emoji",
      emoji: "💬",
      label: type,
      shortLabel: "神回复",
      grad: "from-sky-400 to-blue-400",
      ring: "ring-sky-200/80",
    };
  }
  if (type.includes("打分")) {
    return {
      icon: "emoji",
      emoji: "📈",
      label: type,
      shortLabel: "打分",
      grad: "from-violet-400 to-[#FF7AAE]",
      ring: "ring-violet-200/80",
    };
  }
  if (type.includes("爆款") || type.includes("拆解")) {
    return {
      icon: "emoji",
      emoji: "🔥",
      label: type,
      shortLabel: "爆款",
      grad: "from-orange-400 to-rose-400",
      ring: "ring-orange-200/80",
    };
  }
  return {
    icon: "emoji",
    emoji: "📁",
    label: type,
    shortLabel: "其他",
    grad: "from-slate-400 to-slate-500",
    ring: "ring-slate-200/80",
  };
}

export function formatHistoryWhen(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

export function historyDetailHref(id: string): string {
  return `/history/detail?id=${encodeURIComponent(id)}`;
}
