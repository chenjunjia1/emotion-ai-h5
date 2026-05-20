import { NextRequest, NextResponse } from "next/server";
import { insertUserEvent } from "@/lib/supabase/db";
import type { UserEventType } from "@/lib/types";

const ALLOWED_EVENTS: UserEventType[] = [
  "view_home",
  "click_feature",
  "submit_generate",
  "generate_success",
  "copy_content",
  "regenerate",
];

export async function POST(request: NextRequest) {
  try {
    const sessionId =
      request.headers.get("x-session-id") || "anonymous";
    const body = await request.json();
    const event = body?.event as string;

    if (!ALLOWED_EVENTS.includes(event as UserEventType)) {
      return NextResponse.json({ error: "无效事件" }, { status: 400 });
    }

    await insertUserEvent(sessionId, event, body?.payload ?? {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/events]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
