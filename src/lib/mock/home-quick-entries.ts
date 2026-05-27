import { buildPublishPackAdvancedHref } from "@/lib/publish-pack/publish-pack-links";

const PACK_PLAY_HREF = buildPublishPackAdvancedHref(undefined, 4);

export type HomeQuickEntry = {
  label: string;
  sub: string;
  href: string;
  emoji: string;
  tint: string;
  /** play：顶条渐变 */
  accentBar?: string;
  /** play：图标底 */
  iconShell?: string;
  /** play：图标光晕 */
  iconGlow?: string;
  subClass?: string;
  hot?: boolean;
  /** @deprecated play 变体已改用白底卡片 */
  playBg?: string;
  iconBg?: string;
  ringClass?: string;
};

/** 首页快捷入口（Hero / Bento 共用） */
export const HOME_QUICK_ENTRIES: HomeQuickEntry[] = [
  {
    label: "朋友圈",
    sub: "3 秒出文案",
    href: "/expression/moments",
    emoji: "💬",
    tint: "bg-[#ECFDF5]",
    accentBar: "from-[#34D399] to-[#10B981]",
    iconShell: "bg-gradient-to-br from-[#6EE7B7] to-[#059669]",
    iconGlow: "bg-emerald-400/25",
    subClass: "text-emerald-600/90",
  },
  {
    label: "小红书",
    sub: "爆款结构",
    href: "/expression/xhs-note",
    emoji: "📕",
    tint: "bg-[#FFF0F5]",
    accentBar: "from-[#FF6B6B] to-[#FF2442]",
    iconShell: "bg-gradient-to-br from-[#FF8A8A] to-[#FF2442]",
    iconGlow: "bg-rose-400/25",
    subClass: "text-rose-500/90",
  },
  {
    label: "AI 配图",
    sub: "多图氛围感",
    href: PACK_PLAY_HREF,
    emoji: "🎨",
    tint: "bg-[#FFF8F0]",
    accentBar: "from-[#FF9A4D] to-[#FF4F8B]",
    iconShell: "bg-gradient-to-br from-[#FFB347] to-[#FF4F8B]",
    iconGlow: "bg-orange-400/30",
    subClass: "text-orange-600/90",
    hot: true,
  },
  {
    label: "聊天军师",
    sub: "得体又好接",
    href: "/emotion-chat?mode=strategist",
    emoji: "💡",
    tint: "bg-[#FFFBEB]",
    accentBar: "from-[#F472B6] to-[#A855F7]",
    iconShell: "bg-gradient-to-br from-[#F9A8D4] to-[#A855F7]",
    iconGlow: "bg-fuchsia-400/25",
    subClass: "text-fuchsia-600/90",
  },
];
