import type { Order } from "@/lib/types/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  alipayTimestamp,
  buildSignContent,
  signRSA2,
  verifyRSA2,
} from "@/lib/server/pay/alipay-crypto";

/**
 * 支付宝手机网站支付（alipay.trade.wap.pay）
 * 文档：https://opendocs.alipay.com/open/02ivbs
 */
export function isAlipayConfigured(): boolean {
  return Boolean(
    process.env.ALIPAY_APP_ID?.trim() &&
      process.env.ALIPAY_PRIVATE_KEY?.trim() &&
      process.env.ALIPAY_PUBLIC_KEY?.trim() &&
      process.env.ALIPAY_NOTIFY_URL?.trim()
  );
}

export function getAlipayGateway(): string {
  const custom = process.env.ALIPAY_GATEWAY?.trim();
  if (custom) return custom;
  if (process.env.ALIPAY_SANDBOX === "true") {
    return "https://openapi-sandbox.dl.alipaydev.com/gateway.do";
  }
  return "https://openapi.alipay.com/gateway.do";
}

/** 支付完成同步跳转地址 */
export function getAlipayReturnUrl(orderNo: string): string {
  const explicit = process.env.ALIPAY_RETURN_URL?.trim();
  if (explicit) {
    const sep = explicit.includes("?") ? "&" : "?";
    return `${explicit}${sep}orderNo=${encodeURIComponent(orderNo)}`;
  }
  const base = getAppBaseUrl();
  return `${base}/pay/result?orderNo=${encodeURIComponent(orderNo)}`;
}

function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

function buildSignedGatewayUrl(
  method: string,
  bizContent: Record<string, unknown>,
  extra: Record<string, string>
): string {
  const appId = process.env.ALIPAY_APP_ID!.trim();
  const privateKey = process.env.ALIPAY_PRIVATE_KEY!.trim();

  const params: Record<string, string> = {
    app_id: appId,
    method,
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: alipayTimestamp(),
    version: "1.0",
    biz_content: JSON.stringify(bizContent),
    ...extra,
  };

  const sign = signRSA2(buildSignContent(params), privateKey);
  const query = new URLSearchParams({ ...params, sign });
  return `${getAlipayGateway()}?${query.toString()}`;
}

/** 生成 H5 跳转支付宝收银台的 URL */
export async function createAlipayPayUrl(order: Order): Promise<string | null> {
  if (!isAlipayConfigured()) return null;

  const notifyUrl = process.env.ALIPAY_NOTIFY_URL!.trim();
  const returnUrl = getAlipayReturnUrl(order.orderNo);
  const quitUrl = process.env.ALIPAY_QUIT_URL?.trim() || `${getAppBaseUrl()}/account-package`;

  try {
    return buildSignedGatewayUrl(
      "alipay.trade.wap.pay",
      {
        out_trade_no: order.orderNo,
        total_amount: order.amount.toFixed(2),
        subject: order.productName.slice(0, 256),
        product_code: "QUICK_WAP_WAY",
        quit_url: quitUrl,
      },
      {
        notify_url: notifyUrl,
        return_url: returnUrl,
      }
    );
  } catch (err) {
    console.error("[pay] createAlipayPayUrl failed", err);
    return null;
  }
}

export function verifyAlipayNotify(body: Record<string, string>): boolean {
  if (!isAlipayConfigured()) return false;

  const sign = body.sign;
  if (!sign) return false;

  const appId = process.env.ALIPAY_APP_ID!.trim();
  if (body.app_id && body.app_id !== appId) return false;

  const content = buildSignContent(body);
  return verifyRSA2(content, sign, process.env.ALIPAY_PUBLIC_KEY!.trim());
}

/** 校验回调金额与订单一致 */
export async function verifyNotifyOrderAmount(
  orderNo: string,
  totalAmount: string
): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return false;

  const { data } = await db
    .from("orders")
    .select("amount")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!data) return false;
  return Number(data.amount).toFixed(2) === Number(totalAmount).toFixed(2);
}

export function isAlipayPaidStatus(status: string | undefined): boolean {
  return status === "TRADE_SUCCESS" || status === "TRADE_FINISHED";
}
