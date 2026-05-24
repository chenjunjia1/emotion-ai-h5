import { NextResponse } from "next/server";
import { generatePostReview } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { persistGenerationAndDeferGrowth } from "@/lib/server/defer-generation-side-effects";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "review", ipLimit: 40, ipWindowMs: 60_000 });
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

  const title = String(body.title ?? "").trim() || "未命名内容";
  const cost = QUOTA_COST.review ?? 2;
  const q = await deductQuota(user.id, cost, "review");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  const reviewInput = {
    title,
    views: Number(body.views ?? 0),
    likes: Number(body.likes ?? 0),
    platform: String(body.platform ?? "抖音"),
    track: String(body.track ?? "职场成长"),
  };

  let result: Record<string, unknown>;
  let usedMock = true;
  try {
    const gen = await generatePostReview(reviewInput);
    result = gen.result;
    usedMock = gen.usedMock;
  } catch {
    await refundQuota(user.id, cost, "refund · review failed");
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }

  const saved = await persistGenerationAndDeferGrowth({
    userId: user.id,
    type: "review",
    topic: title,
    input: body,
    output: result as Record<string, unknown>,
    costQuota: cost,
    growthTaskId: "review",
  });

  return NextResponse.json({
    result,
    usedMock,
    user: q.user,
    saved: saved.ok,
    generationId: saved.id,
  });
}
