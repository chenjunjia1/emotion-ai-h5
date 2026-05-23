import { NextResponse } from "next/server";
import { generateViralCopy } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { checkContentRisk, canGenerate } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { deductQuota } from "@/lib/server/db/v1";
import { deferGenerationSideEffects } from "@/lib/server/defer-generation-side-effects";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "v1-viral",
    ipLimit: 40,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let title = "";
  let copy = "";
  try {
    const body = await req.json();
    title = String(body.title || "").trim();
    copy = String(body.copy || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const text = title + copy;
  const risk = checkContentRisk(text);
  if (!canGenerate(risk.level)) {
    return NextResponse.json({ risk, error: "risk_blocked" }, { status: 422 });
  }

  const cost = QUOTA_COST.viral;
  const q = await deductQuota(user.id, cost, "viral-copy");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient", risk }, { status: 402 });
  }

  const { result, usedMock, fastPath } = await generateViralCopy(title, copy);

  deferGenerationSideEffects({
    userId: user.id,
    type: "viral",
    topic: title,
    input: { title, copy },
    output: result as Record<string, unknown>,
    costQuota: cost,
    riskLevel: risk.level,
  });

  return NextResponse.json({ result, risk, usedMock, fastPath, user: q.user, saved: true });
}
