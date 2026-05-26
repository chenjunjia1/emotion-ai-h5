import {
  BarChart3,
  ClipboardList,
  Flame,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  ShoppingCart,
  Users,
} from "lucide-react";

/** 管理后台顶栏 Tab（顺序即运营常用流程） */
export const ADMIN_NAV = [
  { href: "/admin", label: "数据概览", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "订单列表", icon: ShoppingCart },
  { href: "/admin/feedback", label: "用户反馈", icon: MessageSquare },
  { href: "/admin/content", label: "内容统计", icon: BarChart3 },
  { href: "/admin/today-hot-topics", label: "今日热点", icon: NotebookPen },
  { href: "/admin/hot-topics", label: "Cron热点库", icon: Flame },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/audit", label: "审计日志", icon: ClipboardList },
] as const;

export const GENERATION_TYPE_LABELS: Record<string, string> = {
  account: "账号生成",
  daily: "每日爆品",
  viral: "爆款拆解",
  publish_pack: "发布包",
  topic_box: "选题盲盒",
  title_gacha: "标题扭蛋",
  account_test: "测号",
  review: "复盘",
  reply: "神回复",
  score: "爆款打分",
  emotion_chat: "AI情绪",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "待支付",
  paid: "已付款",
  failed: "失败",
  closed: "已关闭",
};

export const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  pending: "待处理",
  processed: "已处理",
};
