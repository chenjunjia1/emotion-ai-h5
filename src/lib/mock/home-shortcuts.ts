import { buildPublishPackAdvancedHref } from "@/lib/publish-pack/publish-pack-links";

/** 首页横向快捷入口（Hero 下方） */
export const HOME_SHORTCUTS = [
  {
    id: "moments",
    label: "发朋友圈",
    sub: "正能量文案",
    href: "/expression/moments",
    emoji: "💬",
    tint: "from-[#ECFDF5] to-[#D1FAE5]",
  },
  {
    id: "xhs",
    label: "小红书",
    sub: "爆款笔记",
    href: "/expression/xhs-note",
    emoji: "📕",
    tint: "from-[#FFF0F5] to-[#FFE8F0]",
  },
  {
    id: "image",
    label: "识图配文",
    sub: "上传即写",
    href: "/expression/image-caption",
    emoji: "📷",
    tint: "from-[#FFF8F0] to-[#FFEDD5]",
  },
  {
    id: "chat",
    label: "聊天军师",
    sub: "高情商",
    href: "/emotion-chat?mode=strategist",
    emoji: "🤝",
    tint: "from-[#EFF6FF] to-[#DBEAFE]",
  },
  {
    id: "hot",
    label: "今日热点",
    sub: "追爆款",
    href: "/inspiration?tab=hot",
    emoji: "🔥",
    tint: "from-[#FFF0F5] to-[#FFE8F0]",
  },
  {
    id: "pack",
    label: "高级图文",
    sub: "多图氛围",
    href: buildPublishPackAdvancedHref(undefined, 4),
    emoji: "🎨",
    tint: "from-[#F5F3FF] to-[#EDE9FE]",
    hot: true,
  },
] as const;

/** 首页能力数据条 */
export const HOME_VALUE_STATS = [
  { value: "30W+", label: "爆款选题库", icon: "🔥", chip: "实时追热" },
  { value: "12W+", label: "高情商回复", icon: "💬", chip: "聊天军师" },
  { value: "AI", label: "配图+文案", icon: "✨", chip: "一键出稿" },
  { value: "8:00", label: "每日更新", icon: "⏰", chip: "早8点刷新" },
] as const;
