import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { grantOrderBenefit } from "@/lib/server/db/v1";

/**
 * 微信支付 API v3 回调（需配置 WECHAT_PAY_NOTIFY_URL）
 * 生产环境请接入平台证书验签，见 docs/H5_AND_MINIPROGRAM.md
 */
export async function POST(req: Request) {
  const apiKey = process.env.WECHAT_API_V3_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { code: "FAIL", message: "not configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "FAIL", message: "invalid body" }, { status: 400 });
  }

  const resource = body.resource as Record<string, unknown> | undefined;
  if (!resource?.ciphertext) {
    return NextResponse.json({ code: "FAIL", message: "no resource" }, { status: 400 });
  }

  // TODO: AES-256-GCM 解密 resource（需 API v3 密钥）
  // 解密后 out_trade_no / trade_state === SUCCESS → grantOrderBenefit
  console.warn(
    "[wechat-pay] notify received — implement decrypt + verify before production",
    String(body.id ?? "")
  );

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ code: "FAIL", message: "db" }, { status: 500 });
  }

  // 开发占位：若明文传 orderNo（仅本地调试，勿用于生产）
  const debugOrderNo = req.headers.get("x-debug-order-no");
  if (
    process.env.NODE_ENV !== "production" &&
    debugOrderNo
  ) {
    const { data: order } = await db
      .from("orders")
      .select("id, user_id")
      .eq("order_no", debugOrderNo)
      .maybeSingle();
    if (order) {
      await grantOrderBenefit(String(order.id), String(order.user_id));
    }
  }

  return NextResponse.json({ code: "SUCCESS", message: "成功" });
}
