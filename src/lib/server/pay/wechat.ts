import { randomBytes } from "crypto";
import type { Order } from "@/lib/types/v1";
import {
  getWechatMiniCredentials,
  isWechatPayConfigured,
} from "@/lib/server/wechat/config";

export type WechatJsapiPayParams = {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: "RSA" | "MD5";
  paySign: string;
};

function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** 微信支付 API v3 JSAPI 预下单（需商户证书，未配置时返回 null） */
export async function createWechatJsapiPayParams(
  order: Order,
  openid: string
): Promise<WechatJsapiPayParams | null> {
  if (!isWechatPayConfigured()) return null;

  const mchId = process.env.WECHAT_MCH_ID!.trim();
  const notifyUrl = process.env.WECHAT_PAY_NOTIFY_URL!.trim();
  const { appId } = getWechatMiniCredentials();
  const privateKeyPem = process.env.WECHAT_MCH_PRIVATE_KEY?.trim();
  const serialNo = process.env.WECHAT_MCH_SERIAL_NO?.trim();

  if (!privateKeyPem || !serialNo) {
    console.warn("[wechat-pay] missing WECHAT_MCH_PRIVATE_KEY or WECHAT_MCH_SERIAL_NO");
    return null;
  }

  const amountFen = Math.round(order.amount * 100);
  const body = {
    appid: appId,
    mchid: mchId,
    description: order.productName.slice(0, 127),
    out_trade_no: order.orderNo,
    notify_url: notifyUrl,
    amount: { total: amountFen, currency: "CNY" },
    payer: { openid },
  };

  const path = "/v3/pay/transactions/jsapi";
  const payload = JSON.stringify(body);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonceStr = randomBytes(16).toString("hex");
  const signMessage = `POST\n${path}\n${timestamp}\n${nonceStr}\n${payload}\n`;

  let paySign: string;
  try {
    const crypto = await import("crypto");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signMessage);
    paySign = sign.sign(privateKeyPem, "base64");
  } catch (e) {
    console.error("[wechat-pay] sign failed", e);
    return null;
  }

  const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${paySign}",timestamp="${timestamp}",serial_no="${serialNo}"`;

  const res = await fetch(`https://api.mch.weixin.qq.com${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authorization,
    },
    body: payload,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const prepayId = String(data.prepay_id ?? "");
  if (!prepayId) {
    console.error("[wechat-pay] prepay failed", data);
    return null;
  }

  const pkg = `prepay_id=${prepayId}`;
  const timeStamp = String(Math.floor(Date.now() / 1000));
  const clientNonce = randomBytes(16).toString("hex");
  const sign2 = (await import("crypto")).createSign("RSA-SHA256");
  sign2.update(`${appId}\n${timeStamp}\n${clientNonce}\n${pkg}\n`);
  const paySignClient = sign2.sign(privateKeyPem, "base64");

  return {
    timeStamp,
    nonceStr: clientNonce,
    package: pkg,
    signType: "RSA",
    paySign: paySignClient,
  };
}

export function getWechatPayAppBaseUrl(): string {
  return getAppBaseUrl();
}
