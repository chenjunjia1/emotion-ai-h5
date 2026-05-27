import { NextResponse } from "next/server";
import { generateAccountDiagnosis } from "@/lib/ai/account-diagnosis";
import { generateCommerceMaterialPack } from "@/lib/ai/commerce-material-pack";
import { generateExpressionContent } from "@/lib/ai/expression-deepseek";
import type { ExpressionGenerateRequest } from "@/lib/api/expression/types";
import { QUOTA_COST } from "@/lib/constants/v1";
import {
  canUseExpressionKind,
  expressionQuotaKey,
  isExpressionVipKind,
} from "@/lib/expression/pricing";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { deductQuota, refundQuota } from "@/lib/server/db/v1";
import { persistGenerationAndDeferGrowth } from "@/lib/server/defer-generation-side-effects";
import { getQuotaCost, getTotalQuota } from "@/lib/v1/quota";

/** POST /api/v2/expression/generate — 文案生成（扣灵感 + DeepSeek） */
export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "expression-generate", ipLimit: 50, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: ExpressionGenerateRequest;
  try {
    body = (await req.json()) as ExpressionGenerateRequest;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const kind = body.kind ?? "quick";
  const prompt = body.prompt?.trim() || "今天想表达点什么";

  if (isExpressionVipKind(kind) && !canUseExpressionKind(user.plan, kind)) {
    return NextResponse.json(
      { error: "feature_vip", message: "开通 Pro 会员后可使用朋友圈 / 小红书等高级创作" },
      { status: 402 }
    );
  }

  const quotaKey = expressionQuotaKey(kind);
  const cost = getQuotaCost(quotaKey in QUOTA_COST ? quotaKey : "expression_quick");

  if (getTotalQuota(user) < cost) {
    return NextResponse.json({ error: "quota_insufficient", quotaCost: cost }, { status: 402 });
  }

  const q = await deductQuota(user.id, cost, `expression · ${kind}`);
  if (!q.ok) {
    return NextResponse.json({ error: "quota_insufficient", quotaCost: cost }, { status: 402 });
  }

  const chargedUser = q.user ?? user;

  try {
    if (kind === "account_diagnosis") {
      const gen = await generateAccountDiagnosis(prompt);
      const payload: Record<string, unknown> = {
        ok: true,
        diagnosis: gen.diagnosis,
        quotaCost: cost,
        usedMock: gen.usedMock,
      };

      await persistGenerationAndDeferGrowth({
        userId: chargedUser.id,
        type: "expression_diagnosis",
        topic: prompt.slice(0, 80),
        input: body as unknown as Record<string, unknown>,
        output: payload,
        costQuota: cost,
        growthTaskId: "reply",
      });

      return NextResponse.json({ ...payload, user: chargedUser });
    }

    if (kind === "commerce_pack") {
      const gen = await generateCommerceMaterialPack(prompt);
      const payload: Record<string, unknown> = {
        ok: true,
        commercePack: gen.commercePack,
        quotaCost: cost,
        usedMock: gen.usedMock,
      };

      await persistGenerationAndDeferGrowth({
        userId: chargedUser.id,
        type: "expression_commerce",
        topic: prompt.slice(0, 80),
        input: body as unknown as Record<string, unknown>,
        output: payload,
        costQuota: cost,
        growthTaskId: "reply",
      });

      return NextResponse.json({ ...payload, user: chargedUser });
    }

    const gen = await generateExpressionContent({
      kind,
      prompt,
      replyTone: body.replyTone,
    });

    let payload: Record<string, unknown> = { ok: true, quotaCost: cost, usedMock: gen.usedMock };

    if (gen.chat) {
      payload = {
        ...payload,
        replies: gen.chat.replies,
        analysis: gen.chat.analysis,
      };
    } else if (gen.emotion) {
      payload = {
        ...payload,
        text: gen.emotion.text,
        tags: gen.emotion.tags ?? [],
      };
    } else if (gen.quick) {
      payload = {
        ...payload,
        text: gen.quick.text,
        titles: gen.quick.titles,
        tags: gen.quick.tags,
      };
    }

    const genType =
      kind === "chat_reply"
        ? "expression_chat"
        : kind === "emotion_sign"
          ? "expression_emotion"
          : isExpressionVipKind(kind)
            ? "expression_vip"
            : "expression_quick";

    await persistGenerationAndDeferGrowth({
      userId: chargedUser.id,
      type: genType,
      topic: prompt.slice(0, 80),
      input: body as unknown as Record<string, unknown>,
      output: payload,
      costQuota: cost,
      growthTaskId: "reply",
    });

    return NextResponse.json({ ...payload, user: chargedUser });
  } catch {
    await refundQuota(chargedUser.id, cost, `refund · expression ${kind} failed`);
    return NextResponse.json({ error: "generate_failed" }, { status: 500 });
  }
}
