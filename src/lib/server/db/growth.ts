import { getSupabaseAdmin } from "@/lib/supabase/server";
import { XP_REWARDS } from "@/lib/v1/growth";
import {
  parseGrowthTasksDone,
  serializeGrowthTasksDone,
  todayDateKey,
} from "@/lib/v1/growth-tasks";
import { findUserById } from "@/lib/server/db/v1";
import type { User } from "@/lib/types/v1";

export interface GrowthProfile {
  xp: number;
  streakDays: number;
  tasksDone: string[];
  lastCheckinDate: string | null;
}

export async function getGrowthProfile(userId: string): Promise<GrowthProfile | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .select("growth_xp, streak_days, last_checkin_date, growth_tasks_done")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  const lastCheckin = row.last_checkin_date
    ? String(row.last_checkin_date).slice(0, 10)
    : null;
  const today = todayDateKey();
  const tasksDone = parseGrowthTasksDone(row.growth_tasks_done, today);

  return {
    xp: Number(row.growth_xp ?? 0),
    streakDays: Number(row.streak_days ?? 0),
    tasksDone,
    lastCheckinDate: lastCheckin,
  };
}

export async function applyGrowthAction(
  userId: string,
  action: "checkin" | "task" | "xp",
  opts?: { taskId?: string; xpAmount?: number }
): Promise<{ profile: GrowthProfile; user: User | null }> {
  const db = getSupabaseAdmin();
  const current = (await getGrowthProfile(userId)) ?? {
    xp: 0,
    streakDays: 0,
    tasksDone: [],
    lastCheckinDate: null,
  };

  if (!db) {
    return { profile: current, user: await findUserById(userId) };
  }

  const today = todayDateKey();
  let xp = current.xp;
  let streak = current.streakDays;
  let tasksDone = [...current.tasksDone];
  let lastCheckin = current.lastCheckinDate;

  if (action === "checkin") {
    if (lastCheckin !== today) {
      streak += 1;
      lastCheckin = today;
      xp += XP_REWARDS.daily_tasks;
      tasksDone = [];
    }
  } else if (action === "task" && opts?.taskId) {
    if (!tasksDone.includes(opts.taskId)) {
      tasksDone.push(opts.taskId);
      const bonus =
        opts.taskId === "topic"
          ? XP_REWARDS.topic_box
          : opts.taskId === "pack"
            ? XP_REWARDS.publish_pack
            : opts.taskId === "review"
              ? XP_REWARDS.review
              : 5;
      xp += bonus;
    }
  } else if (action === "xp") {
    xp += opts?.xpAmount ?? 0;
  }

  const { error } = await db
    .from("users")
    .update({
      growth_xp: xp,
      streak_days: streak,
      last_checkin_date: lastCheckin,
      growth_tasks_done: serializeGrowthTasksDone(tasksDone, today),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[applyGrowthAction]", error.message);
    return { profile: current, user: await findUserById(userId) };
  }

  const profile: GrowthProfile = {
    xp,
    streakDays: streak,
    tasksDone,
    lastCheckinDate: lastCheckin,
  };

  const user = await findUserById(userId);
  return { profile, user };
}

export async function markGrowthTaskDone(
  userId: string,
  taskId: string
): Promise<GrowthProfile | null> {
  const r = await applyGrowthAction(userId, "task", { taskId });
  return r.profile;
}
