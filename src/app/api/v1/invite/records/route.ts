import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { listInviteRecordsForUser } from "@/lib/server/db/product-v1";

export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "invite-records", ipLimit: 60, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const records = await listInviteRecordsForUser(user.id);
  return NextResponse.json({ records });
}
