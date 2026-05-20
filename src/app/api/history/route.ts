import { NextRequest, NextResponse } from "next/server";
import { fetchHistoryRecords } from "@/lib/supabase/db";
import { MOCK_HISTORY } from "@/lib/mock";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const sessionId =
    request.headers.get("x-session-id") || "anonymous";

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ records: MOCK_HISTORY, source: "mock" });
  }

  const records = await fetchHistoryRecords(sessionId);
  return NextResponse.json({
    records,
    source: records.length > 0 ? "supabase" : "empty",
  });
}
