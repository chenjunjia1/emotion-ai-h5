import { NextResponse } from "next/server";
import { generateImageCaptions } from "@/lib/ai/expression-image-caption";
import type { ImageCaptionRequest } from "@/lib/api/expression/types";
import { QUOTA_COST } from "@/lib/constants/v1";
import { canUseExpressionKind } from "@/lib/expression/pricing";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { getQuotaCost, getTotalQuota } from "@/lib/v1/quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/v2/expression/image-caption — 识图配文（会员 + 扣灵感） */
export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "expression-image-caption", ipLimit: 30, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!canUseExpressionKind(user.plan, "image_caption")) {
    return NextResponse.json(
      { error: "feature_vip", message: "识图配文为 Pro 会员专享" },
      { status: 402 }
    );
  }

  let body: ImageCaptionRequest = {};
  try {
    body = (await req.json()) as ImageCaptionRequest;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.imageBase64?.trim()) {
    return NextResponse.json({ error: "image_required" }, { status: 400 });
  }

  const cost = getQuotaCost("expression_image");
  if (getTotalQuota(user) < cost) {
    return NextResponse.json({ error: "quota_insufficient", quotaCost: cost }, { status: 402 });
  }

  const q = await deductQuota(user.id, cost, "expression · image_caption");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient", quotaCost: cost }, { status: 402 });
  }

  const chargedUser = q.user ?? user;
  const hint = String((body as { hint?: string }).hint ?? "").trim();

  try {
    const { result, usedMock } = await generateImageCaptions({
      imageBase64: body.imageBase64,
      hint,
    });

    return NextResponse.json({
      ok: true,
      ...result,
      quotaCost: cost,
      usedMock,
      user: chargedUser,
    });
  } catch {
    await refundQuota(chargedUser.id, cost, "refund · image_caption failed");
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }
}
