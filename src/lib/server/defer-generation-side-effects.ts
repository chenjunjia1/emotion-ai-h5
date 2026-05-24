import { recordGeneration, type GenerationType } from "@/lib/server/db/generations";
import { markGrowthTaskDone } from "@/lib/server/db/growth";

export async function persistGenerationAndDeferGrowth(opts: {
  userId: string;
  type: GenerationType;
  topic?: string;
  input?: Record<string, unknown>;
  output: Record<string, unknown>;
  costQuota?: number;
  riskLevel?: string;
  growthTaskId?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const saved = await recordGeneration({
    userId: opts.userId,
    type: opts.type,
    topic: opts.topic,
    input: opts.input,
    output: opts.output,
    costQuota: opts.costQuota,
    riskLevel: opts.riskLevel,
  });
  if (!saved.ok) {
    console.error("[persistGeneration]", opts.type, saved.error);
  }
  if (opts.growthTaskId) {
    void markGrowthTaskDone(opts.userId, opts.growthTaskId).catch((e) => {
      console.error("[deferGrowth]", opts.growthTaskId, e);
    });
  }
  return saved;
}

/** @deprecated 请改用 persistGenerationAndDeferGrowth 并 await */
export function deferGenerationSideEffects(opts: {
  userId: string;
  type: GenerationType;
  topic?: string;
  input?: Record<string, unknown>;
  output: Record<string, unknown>;
  costQuota?: number;
  riskLevel?: string;
  growthTaskId?: string;
}) {
  void persistGenerationAndDeferGrowth(opts);
}
