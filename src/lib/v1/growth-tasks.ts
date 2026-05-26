/** Daily quest task ids stored in growth state (client + server). */
export type GrowthQuestTaskId = "topic" | "pack" | "review";

export interface GrowthTasksDonePayload {
  date: string;
  tasks: string[];
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Read today's completed task ids from DB jsonb or legacy array. */
export function parseGrowthTasksDone(raw: unknown, today = todayDateKey()): string[] {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Partial<GrowthTasksDonePayload>;
    if (o.date === today && Array.isArray(o.tasks)) {
      return o.tasks.map((x) => String(x));
    }
    return [];
  }
  return [];
}

export function serializeGrowthTasksDone(
  tasks: string[],
  today = todayDateKey()
): GrowthTasksDonePayload {
  return { date: today, tasks };
}
