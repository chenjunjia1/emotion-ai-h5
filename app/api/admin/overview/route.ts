import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireAdmin } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { getAdminOverview } from "@/lib/server/db/admin";

export async function GET(req: Request) {
  const guard = guardApi(req, {
    scope: "admin-overview",
    ipLimit: 30,
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

  const overview = await getAdminOverview();
  if (!overview) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ overview, adminMobile: admin.mobile });
}
