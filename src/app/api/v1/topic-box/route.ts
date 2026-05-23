import { NextResponse } from "next/server";
import { generateTopicBox } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota } from "@/lib/server/db/v1";
import { deferGenerationSideEffects } from "@/lib/server/defer-generation-side-effects";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "topic-box", ipLimit: 60, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cost = QUOTA_COST.topic_box ?? 1;
  const q = await deductQuota(user.id, cost, "topic_box");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { result, usedMock, fastPath } = await generateTopicBox({
    platform: String(body.platform || "抖音"),
    track: String(body.track || "职场成长"),
    goal: String(body.goal || "涨粉"),
    style: String(body.style || "温柔"),
  });

  deferGenerationSideEffects({
    userId: user.id,
    type: "topic_box",
    topic: String(result.topic ?? ""),
    input: body,
    output: result as Record<string, unknown>,
    costQuota: cost,
    riskLevel: "低",
    growthTaskId: "topic",
  });

  return NextResponse.json({ result, usedMock, fastPath, saved: true, user: q.user });
}
