import { NextRequest, NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { fetchHistoryRecords } from "@/lib/supabase/db";
import { MOCK_HISTORY } from "@/lib/mock";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guarded = guardApi(request, {
    scope: "history",
    ipLimit: Number(process.env.HISTORY_RATE_LIMIT_PER_IP || "30"),
    ipWindowMs: 60_000,
  });
  if (guarded instanceof NextResponse) return guarded;

  const sessionId = guarded.sessionId;
  if (!sessionId) {
    return NextResponse.json(
      { error: "无效的 session-id" },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ records: MOCK_HISTORY, source: "mock" });
  }

  const records = await fetchHistoryRecords(sessionId);
  return NextResponse.json({
    records,
    source: records.length > 0 ? "supabase" : "empty",
  });
}
