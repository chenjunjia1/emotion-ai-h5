import { NextRequest, NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import {
  clampJsonPayload,
  readJsonBody,
  safeErrorMessage,
} from "@/lib/security/validate";
import { insertUserEvent } from "@/lib/supabase/db";
import type { UserEventType } from "@/lib/types";

export const runtime = "nodejs";

const ALLOWED_EVENTS: UserEventType[] = [
  "view_home",
  "click_feature",
  "submit_generate",
  "generate_success",
  "copy_content",
  "regenerate",
  "view_pricing",
  "click_pay",
  "login_success",
  "invite_share",
];

export async function POST(request: NextRequest) {
  const guarded = guardApi(request, {
    scope: "events",
    ipLimit: Number(process.env.EVENTS_RATE_LIMIT_PER_IP || "60"),
    ipWindowMs: 60_000,
  });
  if (guarded instanceof NextResponse) return guarded;

  try {
    const parsed = await readJsonBody<{ event?: string; payload?: unknown }>(
      request,
      16_384
    );
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const event = parsed.data?.event;
    if (!event || !ALLOWED_EVENTS.includes(event as UserEventType)) {
      return NextResponse.json({ error: "无效事件" }, { status: 400 });
    }

    const sessionId = guarded.sessionId ?? "anonymous";
    const payload = clampJsonPayload(parsed.data?.payload, 8192);

    await insertUserEvent(sessionId, event, payload);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/events]", err);
    return NextResponse.json(
      { error: safeErrorMessage(err, "服务异常") },
      { status: 500 }
    );
  }
}
