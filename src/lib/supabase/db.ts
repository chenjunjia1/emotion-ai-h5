import { getSupabaseAdmin } from "./server";

export async function insertUserEvent(
  sessionId: string,
  event: string,
  payload?: Record<string, unknown>
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase.from("user_events").insert({
    session_id: sessionId,
    event,
    payload: payload ?? {},
  });
}
