import { NextResponse } from "next/server";
import { STUDIO_QUOTA } from "@/lib/publish-pack/studio-config";
import type { ContentGuess, PackageBody, RestyleOption } from "@/lib/publish-pack/quick-package-types";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { restylePackageCopy } from "@/services/publishPackageService";

export const maxDuration = 20;

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "publish-package-restyle", ipLimit: 40, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const topic = String(body.topic ?? "").trim();
  const guess = body.guess as ContentGuess | undefined;
  const style = String(body.style ?? "") as RestyleOption;
  const bodies = (body.bodies as PackageBody[]) ?? [];
  if (!topic || !guess || !style) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const cost = STUDIO_QUOTA.regenCopy;
  const q = await deductQuota(user.id, cost, "publish_restyle");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  try {
    const nextBodies = await restylePackageCopy({ topic, guess, style, bodies });
    return NextResponse.json({ bodies: nextBodies, user: q.user });
  } catch {
    await refundQuota(user.id, cost, "refund · publish-package restyle failed");
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }
}
