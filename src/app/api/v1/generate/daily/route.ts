import { NextResponse } from "next/server";
import { generateDailyVideo } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { checkContentRisk, canGenerate } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { deductQuota } from "@/lib/server/db/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "v1-daily",
    ipLimit: 40,
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

  let topic = "";
  try {
    const body = await req.json();
    topic = String(body.topic || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const risk = checkContentRisk(topic);
  if (!canGenerate(risk.level)) {
    return NextResponse.json({ risk, error: "risk_blocked" }, { status: 422 });
  }

  const cost = QUOTA_COST.daily;
  const q = await deductQuota(user.id, cost, "daily-video");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient", risk }, { status: 402 });
  }

  const { result, usedMock } = await generateDailyVideo(topic);

  const db = getSupabaseAdmin();
  if (db) {
    await db.from("generations").insert({
      user_id: user.id,
      type: "daily",
      topic,
      input: { topic },
      output: result,
      cost_quota: cost,
      risk_level: risk.level,
    });
  }

  return NextResponse.json({ result, risk, usedMock, user: q.user });
}
