import { NextResponse } from "next/server";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import type { AdvancedPreferences, ContentGuess } from "@/lib/publish-pack/quick-package-types";
import { checkContentRisk, canGenerate } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { persistGenerationAndDeferGrowth } from "@/lib/server/defer-generation-side-effects";
import {
  calcAdvancedCost,
  checkQuickFreeQuota,
  consumePoints,
  refundPoints,
} from "@/services/quotaService";
import {
  generateAdvancedPackage,
  generateQuickPackage,
} from "@/services/publishPackageService";
import {
  assertAdvancedImageReady,
  getImageProviderStatus,
  ArkImageError,
  XinghuiImageError,
} from "@/services/imageService";

export const maxDuration = 300;

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "publish-package-quick", ipLimit: 30, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  let user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const topic = String(body.topic ?? "").trim();
  if (!topic || topic.length > 180) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const risk = checkContentRisk(topic);
  if (!canGenerate(risk.level)) {
    return NextResponse.json({ risk, error: "risk_blocked" }, { status: 422 });
  }

  const mode = body.mode === "advanced" ? "advanced" : "quick";
  const guess = body.guess as ContentGuess | undefined;
  const preferences = body.preferences as AdvancedPreferences | undefined;
  const imageCount = ([1, 2, 4].includes(Number(body.imageCount))
    ? Number(body.imageCount)
    : 1) as ImageCountOption;
  const scenePreviewZh = String(body.scenePreviewZh ?? "").trim() || undefined;

  let cost = 0;
  let quotaReason: string | undefined;

  if (mode === "quick") {
    const q = await checkQuickFreeQuota(user);
    if (!q.canProceed) {
      return NextResponse.json(
        { error: "quota_insufficient", quotaHint: "quick_free_exhausted", risk },
        { status: 402 }
      );
    }
    cost = q.cost;
    quotaReason = q.reason;
  } else {
    try {
      assertAdvancedImageReady();
    } catch (e) {
      const msg =
        e instanceof ArkImageError || e instanceof XinghuiImageError
          ? e.message
          : "未配置图片 API（火山方舟或星绘）";
      return NextResponse.json({ error: "image_not_configured", message: msg, risk }, { status: 503 });
    }
    cost = calcAdvancedCost(imageCount, user.plan);
    const charged = await consumePoints(user.id, cost, `publish_pack_advanced_${imageCount}`);
    if (!charged.ok) {
      return NextResponse.json({ error: "quota_insufficient", risk }, { status: 402 });
    }
    user = charged.user!;
  }

  if (mode === "quick" && cost > 0) {
    const charged = await consumePoints(user.id, cost, "publish_pack_quick_overage");
    if (!charged.ok) {
      return NextResponse.json({ error: "quota_insufficient", risk }, { status: 402 });
    }
    user = charged.user!;
  }

  try {
    const { package: pkg, usedMock } =
      mode === "advanced"
        ? await generateAdvancedPackage({
            topic,
            guess,
            imageCount,
            extraNote: String(body.extraNote ?? "").trim() || undefined,
            preferences,
            scenePreviewZh,
          })
        : await generateQuickPackage({
            topic,
            guess,
            extraNote: String(body.extraNote ?? "").trim() || undefined,
          });

    const saved = await persistGenerationAndDeferGrowth({
      userId: user.id,
      type: "publish_pack",
      topic,
      input: { ...body, mode },
      output: pkg as unknown as Record<string, unknown>,
      costQuota: cost,
      riskLevel: risk.level,
      growthTaskId: "pack",
    });

    const imageProviders = getImageProviderStatus();

    return NextResponse.json({
      package: pkg,
      risk,
      usedMock,
      user,
      saved: saved.ok,
      generationId: saved.id,
      cost,
      quotaReason,
      imageProviders,
      imageSourceNote:
        getImageProviderStatus().provider === "ark"
          ? "火山方舟 Seedream 真实感配图"
          : "高级真实感配图",
    });
  } catch (e) {
    if (cost > 0) {
      await refundPoints(user.id, cost, "refund · publish-package failed");
    }
    if (e instanceof ArkImageError) {
      return NextResponse.json(
        {
          error: "ark_image_failed",
          message: e.message,
          code: e.code,
          risk,
        },
        { status: 502 }
      );
    }
    if (e instanceof XinghuiImageError) {
      return NextResponse.json(
        {
          error: "xinghui_image_failed",
          message: e.message,
          code: e.code,
          risk,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "generate_failed", risk }, { status: 500 });
  }
}
