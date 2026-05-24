import { NextResponse } from "next/server";
import { generateEmotionChat } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { persistGenerationAndDeferGrowth } from "@/lib/server/defer-generation-side-effects";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "emotion-chat", ipLimit: 60, ipWindowMs: 60_000 });
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

  const chat = String(body.chat ?? "").trim();
  if (!chat) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const cost = QUOTA_COST.emotion_chat ?? 2;
  const q = await deductQuota(user.id, cost, "emotion_chat");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  let result: Record<string, unknown>;
  let usedMock = true;
  try {
    const gen = await generateEmotionChat({
      chat,
      relationship: String(body.relationship ?? "暧昧中"),
      goal: String(body.goal ?? "增进好感"),
      style: String(body.style ?? "甜宠体贴"),
    });
    result = gen.result;
    usedMock = gen.usedMock;
  } catch {
    await refundQuota(user.id, cost, "refund · emotion_chat failed");
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }

  const saved = await persistGenerationAndDeferGrowth({
    userId: user.id,
    type: "emotion_chat",
    topic: chat.slice(0, 80),
    input: body,
    output: result as Record<string, unknown>,
    costQuota: cost,
    growthTaskId: "reply",
  });

  return NextResponse.json({
    result,
    usedMock,
    user: q.user,
    saved: saved.ok,
    generationId: saved.id,
  });
}
