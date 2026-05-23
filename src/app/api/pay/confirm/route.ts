import { NextResponse } from "next/server";
import { getPayProvider, isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { grantOrderBenefit } from "@/lib/server/db/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/** Mock 支付成功（仅 PAY_PROVIDER=mock 时用于内测） */
export async function POST(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }
  if (getPayProvider() !== "mock") {
    return NextResponse.json({ error: "mock_pay_disabled" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let orderId = "";
  try {
    const body = await req.json();
    orderId = String(body.orderId || "");
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const updated = await grantOrderBenefit(orderId, user.id);
  if (!updated) {
    return NextResponse.json({ error: "grant_failed" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  if (db) {
    await db.from("order_logs").insert({
      order_id: orderId,
      old_status: "pending",
      new_status: "paid",
      reason: "mock_confirm",
    });
  }

  return NextResponse.json({ ok: true, user: updated });
}
