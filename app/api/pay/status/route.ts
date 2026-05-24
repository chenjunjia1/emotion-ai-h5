import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { findUserById } from "@/lib/server/db/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/** 查询订单支付状态（支付完成页轮询） */
export async function GET(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orderNo = new URL(req.url).searchParams.get("orderNo")?.trim();
  if (!orderNo) {
    return NextResponse.json({ error: "order_no_required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const { data: order } = await db
    .from("orders")
    .select(
      "id, order_no, product_name, amount, status, benefit_granted, benefit_granted_at, created_at"
    )
    .eq("order_no", orderNo)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  let freshUser = user;
  if (order.benefit_granted) {
    const u = await findUserById(user.id);
    if (u) freshUser = u;
  }

  return NextResponse.json({
    order: {
      id: String(order.id),
      orderNo: String(order.order_no),
      productName: String(order.product_name),
      amount: Number(order.amount),
      status: order.status,
      benefitGranted: Boolean(order.benefit_granted),
      benefitGrantedAt: order.benefit_granted_at
        ? String(order.benefit_granted_at)
        : undefined,
      createdAt: String(order.created_at),
    },
    user: freshUser,
  });
}
