import { getSupabaseAdmin } from "@/lib/supabase/server";

export type GenerationType =
  | "account"
  | "daily"
  | "viral"
  | "publish_pack"
  | "topic_box"
  | "title_gacha"
  | "account_test"
  | "review"
  | "reply"
  | "emotion_chat"
  | "score"
  | "hot_topic";

export async function recordGeneration(input: {
  userId: string;
  type: GenerationType;
  topic?: string;
  input?: Record<string, unknown>;
  output: Record<string, unknown>;
  costQuota?: number;
  riskLevel?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: "database_unavailable" };

  const { data, error } = await db
    .from("generations")
    .insert({
      user_id: input.userId,
      type: input.type,
      topic: input.topic ?? "",
      input: input.input ?? {},
      output: input.output,
      cost_quota: input.costQuota ?? 0,
      risk_level: input.riskLevel ?? "低",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[recordGeneration]", input.type, error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id ? String(data.id) : undefined };
}
