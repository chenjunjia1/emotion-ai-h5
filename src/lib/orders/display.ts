/** 订单状态展示文案 */
export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "待支付",
    paid: "已支付",
    cancelled: "已取消",
    closed: "已关闭",
    failed: "支付失败",
    refunded: "已退款",
  };
  return map[status] ?? status;
}

export function formatOrderAmount(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function orderBenefitLabel(granted: boolean | undefined): string {
  if (granted === true) return "权益已发放";
  if (granted === false) return "待发放权益";
  return "—";
}
