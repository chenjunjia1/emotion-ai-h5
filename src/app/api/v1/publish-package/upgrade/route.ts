import { NextResponse } from "next/server";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import type { QuickPublishPackage } from "@/lib/publish-pack/quick-package-types";
import { getUpgradeDiff } from "@/lib/publish-pack/pack-pricing";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { applyProDiscountPrice } from "@/services/pricingService";
import { consumePoints, refundPoints } from "@/services/quotaService";
import { upgradeAdvancedPackage } from "@/services/publishPackageService";
import { ArkImageError, XinghuiImageError } from "@/services/imageService";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "publish-package-upgrade", ipLimit: 20, ipWindowMs: 60_000 });
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

  const pkg = body.package as QuickPublishPackage | undefined;
  const targetCount = ([1, 2, 4].includes(Number(body.targetCount))
    ? Number(body.targetCount)
    : 4) as ImageCountOption;
  const currentCount = (pkg?.imageCount ?? pkg?.images?.length ?? 1) as ImageCountOption;

  if (!pkg || targetCount <= currentCount) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const baseDiff = getUpgradeDiff(currentCount, targetCount);
  const cost = applyProDiscountPrice(baseDiff, user.plan);

  const charged = await consumePoints(user.id, cost, `publish_pack_upgrade_${currentCount}_to_${targetCount}`);
  if (!charged.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  try {
    const upgraded = await upgradeAdvancedPackage({ pkg, targetCount });
    return NextResponse.json({
      package: upgraded,
      user: charged.user,
      cost,
    });
  } catch (e) {
    await refundPoints(user.id, cost, "refund · publish-package upgrade failed");
    if (e instanceof ArkImageError) {
      return NextResponse.json(
        { error: "ark_image_failed", message: e.message, code: e.code },
        { status: 502 }
      );
    }
    if (e instanceof XinghuiImageError) {
      return NextResponse.json(
        { error: "xinghui_image_failed", message: e.message, code: e.code },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "upgrade_failed" }, { status: 500 });
  }
}
