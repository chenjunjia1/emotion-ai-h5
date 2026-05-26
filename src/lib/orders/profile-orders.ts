import type { Order } from "@/lib/types/v1";

const PENDING_FIRST: Record<string, number> = {
  pending: 0,
  paid: 1,
  failed: 2,
  closed: 3,
};

/** 个人中心展示：待支付置顶，其余按时间倒序 */
export function sortOrdersForProfile(list: Order[]): Order[] {
  return [...list].sort((a, b) => {
    const pa = PENDING_FIRST[a.status] ?? 9;
    const pb = PENDING_FIRST[b.status] ?? 9;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getRecentOrders(list: Order[], limit = 3): Order[] {
  return sortOrdersForProfile(list).slice(0, limit);
}

export function countPendingOrders(list: Order[]): number {
  return list.filter((o) => o.status === "pending").length;
}

export function formatOrderWhen(createdAt: string): string {
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
  return d.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type OrderRowAction =
  | { kind: "pay" }
  | { kind: "result" }
  | { kind: "pricing" }
  | { kind: "support" }
  | { kind: "none" };

export function getOrderRowAction(order: Order): OrderRowAction {
  if (order.status === "pending") return { kind: "pay" };
  if (order.status === "paid") return { kind: "result" };
  if (order.status === "failed" || order.status === "closed") {
    return { kind: "pricing" };
  }
  return { kind: "none" };
}

export function orderStatusTone(
  status: string
): "pending" | "paid" | "muted" | "danger" {
  if (status === "pending") return "pending";
  if (status === "paid") return "paid";
  if (status === "failed") return "danger";
  return "muted";
}
