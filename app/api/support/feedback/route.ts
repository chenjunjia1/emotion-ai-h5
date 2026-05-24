import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { saveSupportFeedback } from "@/lib/server/db/v1";

export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "support-feedback",
    ipLimit: 10,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();

  let body: {
    type?: string;
    contact?: string;
    description?: string;
    orderNo?: string;
    taskId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const description = String(body.description ?? "").trim();
  if (!description) {
    return NextResponse.json({ error: "description_required" }, { status: 400 });
  }

  const ok = await saveSupportFeedback({
    userId: user?.id,
    type: String(body.type ?? "意见反馈"),
    contact: String(body.contact ?? ""),
    description,
    relatedOrderNo: body.orderNo ? String(body.orderNo) : undefined,
    relatedTaskId: body.taskId ? String(body.taskId) : undefined,
  });

  if (!ok) {
    return NextResponse.json({ error: "save_failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
