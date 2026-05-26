import { NextResponse } from "next/server";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import {
  calcAdvancedCost,
  checkQuickFreeQuota,
  isProUser,
} from "@/services/quotaService";

export async function GET(req: Request) {
  const guard = guardApi(req, {
    scope: "publish-package-quota-preview",
    ipLimit: 120,
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

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") === "advanced" ? "advanced" : "quick";
  const imageCount = ([1, 2, 4].includes(Number(url.searchParams.get("imageCount")))
    ? Number(url.searchParams.get("imageCount"))
    : 1) as ImageCountOption;

  if (mode === "quick") {
    const q = await checkQuickFreeQuota(user);
    return NextResponse.json({
      mode: "quick",
      cost: q.cost,
      canProceed: q.canProceed,
      freeRemaining: q.freeRemaining,
      isPro: q.isPro,
      reason: q.reason,
    });
  }

  const cost = calcAdvancedCost(imageCount, user.plan);
  const total = Math.max(0, user.dailyQuota - user.usedCount) + user.bonusQuota;
  return NextResponse.json({
    mode: "advanced",
    imageCount,
    cost,
    canProceed: total >= cost,
    isPro: isProUser(user.plan),
    totalQuota: total,
  });
}
