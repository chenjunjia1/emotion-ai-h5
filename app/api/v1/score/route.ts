import { NextResponse } from "next/server";
import { generateViralScore } from "@/lib/ai/v1-deepseek";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { QUOTA_COST } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { deferGenerationSideEffects } from "@/lib/server/defer-generation-side-effects";
import {
  bumpUserDailyUsage,
  getUserDailyUsageCounts,
} from "@/lib/server/db/product-v1";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "score", ipLimit: 40, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const usage = await getUserDailyUsageCounts(user.id);
  const limit = FEATURE_LIMITS[user.plan].viralScore;
  if (usage.viralScore >= limit) {
    return NextResponse.json({ error: "feature_limit" }, { status: 402 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const script = String(body.script ?? "").trim();
  if (!title && !script) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const cost = QUOTA_COST.score ?? 1;
  const q = await deductQuota(user.id, cost, "score");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  let result: Record<string, unknown>;
  let usedMock = true;
  try {
    const gen = await generateViralScore({
      title,
      script,
      xhs: body.xhs ? String(body.xhs) : undefined,
    });
    result = gen.result;
    usedMock = gen.usedMock;
  } catch {
    await refundQuota(user.id, cost, "refund · score failed");
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }

  await bumpUserDailyUsage(user.id, "viral_score_count");

  deferGenerationSideEffects({
    userId: user.id,
    type: "score",
    topic: title || script.slice(0, 40),
    input: body,
    output: result as Record<string, unknown>,
    costQuota: cost,
  });

  return NextResponse.json({
    result,
    usedMock,
    user: q.user,
    saved: true,
  });
}
