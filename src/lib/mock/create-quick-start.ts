/** 创作中心 — 一键开写（直达工具，避免与底部「灵感」Tab 重复） */

export type CreateQuickStart = {
  id: string;
  label: string;
  emoji: string;
  href: string;
  tint: string;
};

function qs(params: Record<string, string>): string {
  const q = new URLSearchParams(params);
  return `?${q.toString()}`;
}

export const CREATE_QUICK_STARTS: CreateQuickStart[] = [
  {
    id: "moments-after-work",
    label: "下班发圈",
    emoji: "🌆",
    href: `/expression/moments${qs({
      topic: "下班累了，想发条轻松治愈的朋友圈",
      returnTo: "/create",
    })}`,
    tint: "bg-[#ECFDF5]",
  },
  {
    id: "xhs-grass",
    label: "小红书种草",
    emoji: "📕",
    href: `/expression/xhs-note${qs({
      topic: "平价好物分享，真实种草不硬广",
      returnTo: "/create",
    })}`,
    tint: "bg-[#FFF0F5]",
  },
  {
    id: "image-caption",
    label: "自拍配文",
    emoji: "📷",
    href: "/expression/image-caption",
    tint: "bg-[#FFF8F0]",
  },
  {
    id: "chat-reply",
    label: "高情商回复",
    emoji: "💬",
    href: "/emotion-chat?mode=strategist",
    tint: "bg-[#F0F9FF]",
  },
];
