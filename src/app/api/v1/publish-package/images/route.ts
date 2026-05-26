import { NextResponse } from "next/server";
import { STUDIO_QUOTA } from "@/lib/publish-pack/studio-config";
import type { ContentGuess } from "@/lib/publish-pack/quick-package-types";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import {
  generatePackageImages,
  OpenAIImageError,
  regenerateImage,
} from "@/services/imageService";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "publish-package-images", ipLimit: 40, ipWindowMs: 60_000 });
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

  const action = String(body.action ?? "regenerate_set");
  const topic = String(body.topic ?? "").trim();
  const guess = body.guess as ContentGuess | undefined;
  if (!topic || !guess) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const cost =
    action === "premium_cover"
      ? STUDIO_QUOTA.premiumCover
      : action === "openai_premium"
        ? STUDIO_QUOTA.openaiPremiumImage
        : STUDIO_QUOTA.regenImages;

  const q = await deductQuota(user.id, cost, "publish_pack");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  try {
    if (action === "regenerate_one" && body.imageId) {
      const usePremium = Boolean(body.premium);
      const image = await regenerateImage({
        topic,
        guess,
        imageId: String(body.imageId),
        asCover: Boolean(body.asCover),
        tier: usePremium ? "premium" : "regular",
      });
      return NextResponse.json({ images: [image], user: q.user });
    }

    const tier =
      action === "premium_cover" || action === "openai_premium" ? "premium" : "regular";
    const images = await generatePackageImages({ topic, guess, count: 4, tier });
    return NextResponse.json({ images, user: q.user });
  } catch (e) {
    await refundQuota(user.id, cost, "refund · publish-package images failed");
    if (e instanceof OpenAIImageError) {
      return NextResponse.json(
        { error: "openai_image_failed", message: e.message, code: e.code },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }
}
