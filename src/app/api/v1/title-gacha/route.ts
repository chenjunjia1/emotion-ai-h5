import { NextResponse } from "next/server";
import { generateTitleGacha } from "@/lib/ai/v1-deepseek";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import {
  bumpUserDailyUsage,
  getUserDailyUsageCounts,
} from "@/lib/server/db/product-v1";
import { persistGenerationAndDeferGrowth } from "@/lib/server/defer-generation-side-effects";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "title-gacha", ipLimit: 60, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const usage = await getUserDailyUsageCounts(user.id);
  const limit = FEATURE_LIMITS[user.plan].titleGacha;
  if (usage.titleGacha >= limit) {
    return NextResponse.json({ error: "feature_limit" }, { status: 402 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { result, usedMock, fastPath } = await generateTitleGacha({
    platform: String(body.platform || "抖音"),
    track: String(body.track || "职场成长"),
    theme: String(body.theme || body.track || ""),
    style: String(body.style || "温柔"),
    goal: String(body.goal || "涨粉"),
  });

  await bumpUserDailyUsage(user.id, "title_gacha_count");

  const saved = await persistGenerationAndDeferGrowth({
    userId: user.id,
    type: "title_gacha",
    topic: String(result.recommended ?? ""),
    input: body,
    output: result as Record<string, unknown>,
    costQuota: 0,
    riskLevel: "低",
  });

  return NextResponse.json({
    result,
    usedMock,
    fastPath,
    saved: saved.ok,
    generationId: saved.id,
  });
}
