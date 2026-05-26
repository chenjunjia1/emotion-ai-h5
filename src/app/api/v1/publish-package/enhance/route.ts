import { NextResponse } from "next/server";
import type { AdvancedPreferences, ContentGuess } from "@/lib/publish-pack/quick-package-types";
import { checkContentRisk, canGenerate } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { enhanceUserInput } from "@/services/publishPackageService";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "publish-package-enhance", ipLimit: 60, ipWindowMs: 60_000 });
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

  try {
    const enhanced = await enhanceUserInput({ topic, mode, guess, preferences });
    return NextResponse.json({ enhanced, risk });
  } catch {
    return NextResponse.json({ error: "enhance_failed", risk }, { status: 500 });
  }
}
