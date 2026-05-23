import { NextResponse } from "next/server";
import { generateAccountPersonalityTest } from "@/lib/ai/v1-deepseek";
import { QUOTA_COST } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { deferGenerationSideEffects } from "@/lib/server/defer-generation-side-effects";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "account-test", ipLimit: 40, ipWindowMs: 60_000 });
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

  const answers = (body.answers as Record<string, string>) ?? {};
  const cost = QUOTA_COST.account_test ?? 3;
  const q = await deductQuota(user.id, cost, "account_test");
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient" }, { status: 402 });
  }

  let result: Record<string, unknown>;
  let usedMock = true;
  try {
    const gen = await generateAccountPersonalityTest(answers);
    result = gen.result;
    usedMock = gen.usedMock;
  } catch {
    await refundQuota(user.id, cost, "refund · account_test failed");
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }

  deferGenerationSideEffects({
    userId: user.id,
    type: "account_test",
    topic: "账号方向测试",
    input: { answers },
    output: result as Record<string, unknown>,
    costQuota: cost,
    growthTaskId: "account_test",
  });

  return NextResponse.json({
    result,
    usedMock,
    user: q.user,
    saved: true,
  });
}
