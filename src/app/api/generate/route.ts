import { NextRequest, NextResponse } from "next/server";
import { generateWithDeepSeek, hasDeepSeekKey } from "@/lib/ai/deepseek";
import { guardApi } from "@/lib/security/api-guard";
import {
  acquireAiSlot,
  releaseAiSlot,
} from "@/lib/security/rate-limit";
import {
  readJsonBody,
  safeErrorMessage,
} from "@/lib/security/validate";
import {
  insertHistoryRecord,
  insertUserEvent,
} from "@/lib/supabase/db";
import type { GenerateFormData } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function validateForm(body: unknown): GenerateFormData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const features = ["video", "comment", "private"];
  if (!features.includes(b.feature as string)) return null;
  const input = String(b.input ?? "").slice(0, 2000);
  if (!input.trim()) return null;
  return {
    feature: b.feature as GenerateFormData["feature"],
    input,
    style: (b.style as GenerateFormData["style"]) || "高情商",
    audience: (b.audience as GenerateFormData["audience"]) || "25-35女生",
  };
}

export async function POST(request: NextRequest) {
  const guarded = guardApi(request, {
    scope: "generate",
    ipLimit: Number(process.env.GENERATE_RATE_LIMIT_PER_IP || "15"),
    ipWindowMs: 60_000,
    sessionLimit: Number(process.env.GENERATE_RATE_LIMIT_PER_SESSION || "10"),
    sessionWindowMs: 60_000,
  });
  if (guarded instanceof NextResponse) return guarded;

  const { sessionId } = guarded;
  const effectiveSession = sessionId ?? "anonymous";

  if (!acquireAiSlot()) {
    return NextResponse.json(
      { error: "当前生成人数较多，请稍后再试" },
      { status: 503, headers: { "Retry-After": "5" } }
    );
  }

  try {
    const parsed = await readJsonBody(request, 32_768);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const form = validateForm(parsed.data);
    if (!form) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    await insertUserEvent(effectiveSession, "submit_generate", {
      feature: form.feature,
      style: form.style,
    });

    const { result, usedMock, warning } = await generateWithDeepSeek(form);

    await insertHistoryRecord(effectiveSession, form, result);
    await insertUserEvent(effectiveSession, "generate_success", {
      feature: form.feature,
      used_mock: usedMock,
    });

    return NextResponse.json({
      result,
      usedMock: usedMock || !hasDeepSeekKey(),
      warning,
    });
  } catch (err) {
    console.error("[api/generate]", err);
    return NextResponse.json(
      {
        error: safeErrorMessage(err, "生成失败，请稍后重试"),
      },
      { status: 500 }
    );
  } finally {
    releaseAiSlot();
  }
}
