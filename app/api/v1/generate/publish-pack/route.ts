import { NextResponse } from "next/server";
import { generatePublishPack } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { checkContentRisk, canGenerate } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { deferGenerationSideEffects } from "@/lib/server/defer-generation-side-effects";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "publish-pack", ipLimit: 40, ipWindowMs: 60_000 });
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

  const topic = String(body.topic || "").trim();
  if (!topic) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const risk = checkContentRisk(topic);
  if (!canGenerate(risk.level)) {
    return NextResponse.json({ risk, error: "risk_blocked" }, { status: 422 });
  }

  const quotaAction =
    body.quotaAction === "hot_topic_pack" ? "hot_topic_pack" : "publish_pack";
  const cost = QUOTA_COST[quotaAction] ?? QUOTA_COST.publish_pack ?? 5;
  const q = await deductQuota(user.id, cost, quotaAction);
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient", risk }, { status: 402 });
  }

  let result: Record<string, unknown>;
  let usedMock = true;
  let fastPath: boolean | undefined;
  try {
    const gen = await generatePublishPack({
      topic,
      platform: String(body.platform || "抖音"),
      track: String(body.track || "职场成长"),
      goal: String(body.goal || "涨粉"),
      style: String(body.style || "温柔"),
      withXhs: Boolean(body.withXhs),
    });
    result = gen.result;
    usedMock = gen.usedMock;
    fastPath = gen.fastPath;
  } catch {
    await refundQuota(user.id, cost, `refund · ${quotaAction} failed`);
    return NextResponse.json({ error: "generate_failed", risk }, { status: 500 });
  }

  deferGenerationSideEffects({
    userId: user.id,
    type: "publish_pack",
    topic,
    input: body,
    output: result as Record<string, unknown>,
    costQuota: cost,
    riskLevel: risk.level,
    growthTaskId: "pack",
  });

  return NextResponse.json({
    result,
    risk,
    usedMock,
    fastPath,
    user: q.user,
    saved: true,
  });
}
