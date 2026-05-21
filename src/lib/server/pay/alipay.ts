import type { Order } from "@/lib/types/v1";

/**
 * 支付宝商户支付占位。
 * 开通商户后：用官方 SDK 生成 orderString / 跳转 URL，并在 notify 路由验签。
 * 文档：https://opendocs.alipay.com/
 */
export function isAlipayConfigured(): boolean {
  return Boolean(
    process.env.ALIPAY_APP_ID &&
      process.env.ALIPAY_PRIVATE_KEY &&
      process.env.ALIPAY_PUBLIC_KEY
  );
}

export async function createAlipayPayUrl(order: Order): Promise<string | null> {
  if (!isAlipayConfigured()) return null;

  // TODO: 接入 alipay.trade.wap.pay 或电脑网站支付
  console.warn("[pay] implement createAlipayPayUrl with official SDK", order.orderNo);
  return null;
}

export function verifyAlipayNotify(_body: Record<string, string>): boolean {
  if (!isAlipayConfigured()) return false;
  // TODO: RSA2 验签 + 校验 app_id、out_trade_no、total_amount
  return false;
}
