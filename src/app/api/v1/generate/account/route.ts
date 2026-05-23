import { NextResponse } from "next/server";
import { generateAccountPackage } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { checkContentRisk } from "@/lib/risk";
import { canGenerate } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { deductQuota } from "@/lib/server/db/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { deferGenerationSideEffects } from "@/lib/server/defer-generation-side-effects";

export const maxDuration = 35;

export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "v1-account",
    ipLimit: 30,
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

  let input: Record<string, string>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const text = Object.values(input).join("");
  const risk = checkContentRisk(text);
  if (!canGenerate(risk.level)) {
    return NextResponse.json({ risk, error: "risk_blocked" }, { status: 422 });
  }

  const cost = QUOTA_COST.account;
  const q = await deductQuota(user.id, cost, "account-package");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient", risk }, { status: 402 });
  }

  const { result, usedMock, fastPath } = await generateAccountPackage({
    platform: String(input.platform || "抖音"),
    track: String(input.track || ""),
    goal: String(input.goal || ""),
    style: String(input.style || ""),
  });

  deferGenerationSideEffects({
    userId: user.id,
    type: "account",
    topic: String(input.track ?? ""),
    input,
    output: result as Record<string, unknown>,
    costQuota: cost,
    riskLevel: risk.level,
  });

  const db = getSupabaseAdmin();
  if (db) {
    void db.from("risk_records").insert({
      user_id: user.id,
      content_type: "起号方案",
      content: text.slice(0, 500),
      risk_level: risk.level,
      risk_types: risk.types,
      risk_words: risk.words,
      suggestion: risk.suggestion,
      safe_version: risk.safeVersion,
    });
  }

  return NextResponse.json({ result, risk, usedMock, fastPath, user: q.user, saved: true });
}
