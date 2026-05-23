import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/constants/v1";
import { getPayProvider, isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { createOrder } from "@/lib/server/db/v1";
import { createAlipayPayUrl } from "@/lib/server/pay/alipay";

export async function POST(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let productName = "";
  try {
    const body = await req.json();
    productName = String(body.productName || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const product = PRODUCTS.find((p) => p.productName === productName);
  if (!product) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  const channel = getPayProvider();
  const order = await createOrder(user.id, product, channel);

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
