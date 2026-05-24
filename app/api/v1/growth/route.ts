import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { applyGrowthAction } from "@/lib/server/db/growth";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "growth", ipLimit: 80, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const action = String(body.action || "");
  if (!["checkin", "task", "xp"].includes(action)) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const { profile, user: refreshed } = await applyGrowthAction(
    user.id,
    action as "checkin" | "task" | "xp",
    {
      taskId: body.taskId ? String(body.taskId) : undefined,
      xpAmount: body.xpAmount != null ? Number(body.xpAmount) : undefined,
    }
  );

  return NextResponse.json({ growth: profile, user: refreshed ?? user });
}
