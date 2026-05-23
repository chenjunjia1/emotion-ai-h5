import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { openInviteBlindBoxForUser } from "@/lib/server/db/invite-blind-box";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "invite-blind-box", ipLimit: 30, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = await openInviteBlindBoxForUser(user.id);
  if (!r.ok) {
    const status = r.error === "no_blind_box" ? 402 : 500;
    return NextResponse.json({ error: r.error }, { status });
  }

  return NextResponse.json({ reward: r.reward, user: r.user });
}
