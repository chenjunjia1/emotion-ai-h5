import { NextResponse } from "next/server";
import { checkContentRisk, canCreateVideo } from "@/lib/risk";
import { guardApi } from "@/lib/security/api-guard";
import { getVideoProvider, isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { createVideoTaskRecord } from "@/lib/server/db/v1";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "v1-video-create",
    ipLimit: 20,
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

  let body: { taskType?: string; script?: string; duration?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const taskType = body.taskType === "auto" ? "auto" : "avatar";
  const script = String(body.script ?? "").trim();
  const duration = body.duration === 60 ? 60 : 30;

  if (!script) {
    return NextResponse.json({ error: "script_required" }, { status: 400 });
  }

  const risk = checkContentRisk(script);
  if (!canCreateVideo(risk.level)) {
    return NextResponse.json({ risk, error: "risk_blocked" }, { status: 422 });
  }

  const provider = getVideoProvider();
  const created = await createVideoTaskRecord({
    userId: user.id,
    taskType,
    script,
    duration,
    riskLevel: risk.level,
    provider,
  });

  if (!created.ok) {
    const status =
      created.error === "coin_insufficient"
        ? 402
        : created.error === "task_max_concurrent"
          ? 429
          : 400;
    return NextResponse.json(
      { error: created.error, user: created.user, risk },
      { status }
    );
  }

  const db = getSupabaseAdmin();
  if (db) {
    await db.from("risk_records").insert({
      user_id: user.id,
      content_type: "成片任务",
      content: script.slice(0, 500),
      risk_level: risk.level,
      risk_types: risk.types,
      risk_words: risk.words,
      suggestion: risk.suggestion,
      safe_version: risk.safeVersion,
    });
  }

  return NextResponse.json({
    task: created.task,
    user: created.user,
    risk,
  });
}
