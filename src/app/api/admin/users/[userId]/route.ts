import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireAdmin } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { adminAdjustUser } from "@/lib/server/db/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const guard = guardApi(req, {
    scope: "admin-adjust-user",
    ipLimit: 20,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "invalid_user" }, { status: 400 });
  }

  let body: {
    dailyQuota?: number;
    bonusQuota?: number;
    videoCoin?: number;
    plan?: string;
    reason?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const plans = ["free", "pro", "premium", "studio"] as const;
  const plan =
    body.plan && plans.includes(body.plan as (typeof plans)[number])
      ? (body.plan as (typeof plans)[number])
      : undefined;

  const updated = await adminAdjustUser(
    admin.id,
    userId,
    {
      dailyQuota:
        body.dailyQuota !== undefined ? Number(body.dailyQuota) : undefined,
      bonusQuota:
        body.bonusQuota !== undefined ? Number(body.bonusQuota) : undefined,
      videoCoin:
        body.videoCoin !== undefined ? Number(body.videoCoin) : undefined,
      plan,
    },
    String(body.reason || "admin_adjust")
  );

  if (!updated) {
    return NextResponse.json({ error: "adjust_failed" }, { status: 400 });
  }

  return NextResponse.json({ user: updated });
}
