import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { grantOrderBenefit } from "@/lib/server/db/v1";
import {
  isAlipayPaidStatus,
  verifyAlipayNotify,
  verifyNotifyOrderAmount,
} from "@/lib/server/pay/alipay";

export async function POST(req: Request) {
  const form = await req.formData();
  const body: Record<string, string> = {};
  form.forEach((v, k) => {
    body[k] = String(v);
  });

  if (!verifyAlipayNotify(body)) {
    console.error("[pay] alipay notify sign verify failed", body.out_trade_no);
    return new NextResponse("fail", { status: 400 });
  }

  const orderNo = body.out_trade_no;
  const tradeStatus = body.trade_status;
  if (!orderNo || !isAlipayPaidStatus(tradeStatus)) {
    return new NextResponse("success");
  }

  const totalAmount = body.total_amount;
  if (!totalAmount || !(await verifyNotifyOrderAmount(orderNo, totalAmount))) {
    console.error("[pay] alipay notify amount mismatch", orderNo, totalAmount);
    return new NextResponse("fail", { status: 400 });
  }

  const db = getSupabaseAdmin();
  if (!db) return new NextResponse("fail", { status: 500 });

  const { data: order } = await db
    .from("orders")
    .select("id, user_id, benefit_granted, status")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!order || order.benefit_granted) {
    return new NextResponse("success");
  }

  await grantOrderBenefit(String(order.id), String(order.user_id));

  await db.from("order_logs").insert({
    order_id: order.id,
    old_status: order.status ?? "pending",
    new_status: "paid",
    reason: `alipay_notify:${tradeStatus}`,
  });

  return new NextResponse("success");
}
