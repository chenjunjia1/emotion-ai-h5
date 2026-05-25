export type LibraryFilter = "all" | "pack" | "topic" | "review" | "emotion";

export function historyFilterForType(type: string): LibraryFilter | null {
  if (type.includes("情绪")) return "emotion";
  if (type.includes("发布包") || type.includes("账号") || type.includes("爆品") || type.includes("朋友圈")) return "pack";
  if (type.includes("盲盒") || type.includes("选题")) return "topic";
  if (type.includes("复盘")) return "review";
  return null;
}

export function historyTypeMeta(type: string): {
  emoji: string;
  label: string;
  grad: string;
  ring: string;
} {
  if (type.includes("情绪")) {
    return {
      emoji: "💗",
      label: type,
      grad: "from-[#FF8EC4] via-[#FF5C8A] to-[#FF7AAE]",
      ring: "ring-[#FF7AAE]/30",
    };
  }
  if (type.includes("发布包") || type.includes("爆品")) {
    return {
      emoji: "⚡",
      label: type,
      grad: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
      ring: "ring-[#FF7AAE]/25",
    };
  }
  if (type.includes("盲盒") || type.includes("选题")) {
    return {
      emoji: "🎲",
      label: type,
      grad: "from-violet-400 to-[#FF7AAE]",
      ring: "ring-violet-200/80",
    };
  }
  if (type.includes("复盘")) {
    return {
      emoji: "📊",
      label: type,
      grad: "from-emerald-400 to-teal-400",
      ring: "ring-emerald-200/80",
    };
  }
  if (type.includes("神回复")) {
    return {
      emoji: "💬",
      label: type,
      grad: "from-sky-400 to-blue-400",
      ring: "ring-sky-200/80",
    };
  }
  if (type.includes("打分")) {
    return {
      emoji: "📈",
      label: type,
      grad: "from-violet-400 to-[#FF7AAE]",
      ring: "ring-violet-200/80",
    };
  }
  if (type.includes("爆款") || type.includes("拆解")) {
    return {
      emoji: "🔥",
      label: type,
      grad: "from-orange-400 to-rose-400",
      ring: "ring-orange-200/80",
    };
  }
  return {
    emoji: "📁",
    label: type,
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
