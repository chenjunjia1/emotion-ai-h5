import {
  Flame,
  History,
  Home,
  MessageCircle,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";

/** 管理后台 → 用户端 H5 快捷入口 */
export const ADMIN_APP_LINKS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/hot-topics", label: "今日热点", icon: Flame },
  { href: "/publish-pack", label: "发布包", icon: Wand2 },
  { href: "/emotion-chat", label: "AI 情绪", icon: MessageCircle },
  { href: "/history", label: "内容库", icon: History },
  { href: "/review", label: "复盘", icon: Sparkles },
  { href: "/profile", label: "我的", icon: UserRound },
] as const;
