import { recordGeneration, type GenerationType } from "@/lib/server/db/generations";
import { markGrowthTaskDone } from "@/lib/server/db/growth";

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
  void (async () => {
    try {
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
        console.error("[deferGeneration]", opts.type, saved.error);
      }
      if (opts.growthTaskId) {
        await markGrowthTaskDone(opts.userId, opts.growthTaskId);
      }
    } catch (e) {
      console.error("[deferGeneration]", opts.type, e);
    }
  })();
}
