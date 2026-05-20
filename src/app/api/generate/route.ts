import { NextRequest, NextResponse } from "next/server";
import { generateWithDeepSeek, hasDeepSeekKey } from "@/lib/ai/deepseek";
import {
  insertHistoryRecord,
  insertUserEvent,
} from "@/lib/supabase/db";
import type { GenerateFormData } from "@/lib/types";

function getSessionId(request: NextRequest): string {
  return (
    request.headers.get("x-session-id") ||
    request.cookies.get("emotion_session")?.value ||
    "anonymous"
  );
}

function validateForm(body: unknown): GenerateFormData | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const features = ["video", "comment", "private"];
  if (!features.includes(b.feature as string)) return null;
  return {
    feature: b.feature as GenerateFormData["feature"],
    input: String(b.input ?? "").slice(0, 2000),
    style: (b.style as GenerateFormData["style"]) || "高情商",
    audience: (b.audience as GenerateFormData["audience"]) || "25-35女生",
  };
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    const body = await request.json();
    const form = validateForm(body);

    if (!form) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    if (!form.input.trim()) {
      return NextResponse.json(
        { error: "请输入客户消息、评论内容或文案主题" },
        { status: 400 }
      );
    }

    await insertUserEvent(sessionId, "submit_generate", {
      feature: form.feature,
      style: form.style,
    });

    const { result, usedMock, warning } = await generateWithDeepSeek(form);

    await insertHistoryRecord(sessionId, form, result);
    await insertUserEvent(sessionId, "generate_success", {
      feature: form.feature,
      used_mock: usedMock,
    });

    return NextResponse.json({
      result,
      usedMock: usedMock || !hasDeepSeekKey(),
      warning,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "生成失败，请稍后重试";
    console.error("[api/generate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
