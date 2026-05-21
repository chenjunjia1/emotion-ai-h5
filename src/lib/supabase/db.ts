import type { GenerateFormData, GenerateResult, HistoryRecord } from "@/lib/types";
import { FEATURE_LABELS } from "@/lib/constants";
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

export async function insertHistoryRecord(
  sessionId: string,
  form: GenerateFormData,
  result: GenerateResult
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const aiResult = [
    result.mainContent,
    ...result.variants.map((v) => `【${v.title}】\n${v.content}`),
  ].join("\n\n");

  await supabase.from("history_records").insert({
    session_id: sessionId,
    feature_type: form.feature,
    user_input: form.input,
    ai_result: aiResult,
    style: form.style,
    audience: form.audience,
  });
}

function formatDisplayTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) return `今天 ${time}`;
  if (isYesterday) return `昨天 ${time}`;
  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function fetchHistoryRecords(
  sessionId: string,
  limit = 50
): Promise<HistoryRecord[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("history_records")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    featureType: row.feature_type as HistoryRecord["featureType"],
    featureLabel:
      FEATURE_LABELS[row.feature_type as string] ?? String(row.feature_type),
    userInput: row.user_input as string,
    aiResult: row.ai_result as string,
    style: row.style as HistoryRecord["style"],
    createdAt: row.created_at as string,
    displayTime: formatDisplayTime(row.created_at as string),
  }));
}
