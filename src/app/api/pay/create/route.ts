import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/constants/v1";
import { getPayProvider, isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { createOrder } from "@/lib/server/db/v1";
import { createAlipayPayUrl } from "@/lib/server/pay/alipay";
import { createWechatJsapiPayParams } from "@/lib/server/pay/wechat";
import { getUserMiniOpenid } from "@/lib/server/db/wechat-users";
import { isWechatPayConfigured } from "@/lib/server/wechat/config";

export async function POST(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let productName = "";
  let clientChannel = "";
  try {
    const body = await req.json();
    productName = String(body.productName || "").trim();
    clientChannel = String(body.client || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const headerClient = req.headers.get("x-client-channel")?.trim();
  const isMiniClient = clientChannel === "mini" || headerClient === "mini";

  const product = PRODUCTS.find((p) => p.productName === productName);
  if (!product) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  let channel = getPayProvider();
  if (isMiniClient && isWechatPayConfigured()) {
    channel = "wechat";
  }

  const order = await createOrder(user.id, product, channel);

  if (channel === "wechat") {
    const openid = await getUserMiniOpenid(user.id);
    if (!openid) {
      return NextResponse.json(
        { error: "wechat_openid_required", order },
        { status: 400 }
      );
    }
    const wechatPayParams = await createWechatJsapiPayParams(order, openid);
    if (!wechatPayParams) {
      return NextResponse.json(
        { error: "wechat_pay_not_configured", order },
        { status: 503 }
      );
    }
    return NextResponse.json({
      order,
      channel: "wechat",
      wechatPayParams,
    });
  }

  if (channel === "alipay") {
    const payUrl = await createAlipayPayUrl(order);
    if (!payUrl) {
      return NextResponse.json(
        { error: "alipay_not_configured", order },
        { status: 503 }
      );
    }
    return NextResponse.json({ order, payUrl, channel: "alipay" });
  }

  return NextResponse.json({ order, channel: "mock", mock: true });
}
