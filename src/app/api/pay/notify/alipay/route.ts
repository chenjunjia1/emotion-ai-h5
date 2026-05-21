import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { grantOrderBenefit } from "@/lib/server/db/v1";
import { verifyAlipayNotify } from "@/lib/server/pay/alipay";

export async function POST(req: Request) {
  const form = await req.formData();
  const body: Record<string, string> = {};
  form.forEach((v, k) => {
    body[k] = String(v);
  });

  if (!verifyAlipayNotify(body)) {
    return new NextResponse("fail", { status: 400 });
  }

  const orderNo = body.out_trade_no;
  const tradeStatus = body.trade_status;
  if (!orderNo || tradeStatus !== "TRADE_SUCCESS") {
    return new NextResponse("success");
  }

  const db = getSupabaseAdmin();
  if (!db) return new NextResponse("fail", { status: 500 });

  const { data: order } = await db
    .from("orders")
    .select("id, user_id, benefit_granted")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!order || order.benefit_granted) {
    return new NextResponse("success");
  }

  await grantOrderBenefit(String(order.id), String(order.user_id));
  return new NextResponse("success");
}
