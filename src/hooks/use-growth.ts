"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/contexts/app-context";
import { STORAGE_GROWTH, STORAGE_USER } from "@/lib/constants/v1";
import type { User } from "@/lib/types/v1";
import { getLevelByXp } from "@/lib/v1/growth";
import { apiProductState, isClientServerMode } from "@/lib/client/server-api";

export interface GrowthState {
  xp: number;
  streakDays: number;
  tasksDone: string[];
  lastCheckinDate: string | null;
  level: ReturnType<typeof getLevelByXp>;
}

function readCachedUserGrowthXp(): number | null {
  if (typeof window === "undefined" || !isClientServerMode()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    const u = JSON.parse(raw) as Pick<User, "growthXp">;
    return typeof u.growthXp === "number" ? u.growthXp : null;
  } catch {
    return null;
  }
}

function toGrowthState(g: {
  xp: number;
  streakDays?: number;
  tasksDone?: string[];
  lastCheckinDate?: string | null;
}): GrowthState {
  return {
    xp: g.xp,
    streakDays: g.streakDays ?? 0,
    tasksDone: g.tasksDone ?? [],
    lastCheckinDate: g.lastCheckinDate ?? null,
    level: getLevelByXp(g.xp),
  };
}

function loadGrowth(): GrowthState {
  if (typeof window === "undefined") {
    return toGrowthState({ xp: 0 });
  }
  try {
    const raw = localStorage.getItem(STORAGE_GROWTH);
    const g = raw
      ? (JSON.parse(raw) as Omit<GrowthState, "level"> & {
          lastCheckin?: string;
          tasksDate?: string | null;
        })
      : { xp: 0, streakDays: 0, tasksDone: [] as string[], lastCheckinDate: null };
    const today = new Date().toISOString().slice(0, 10);
    const lastCheckin = g.lastCheckinDate ?? g.lastCheckin ?? null;
    const tasksDate = g.tasksDate ?? null;
    const tasksDone = tasksDate === today ? (g.tasksDone ?? []) : [];
    const cachedServerXp = readCachedUserGrowthXp();
    const xp = cachedServerXp ?? g.xp ?? 0;
    return toGrowthState({
      xp,
      streakDays: g.streakDays ?? 0,
      tasksDone,
      lastCheckinDate: lastCheckin,
    });
  } catch {
    return toGrowthState({ xp: readCachedUserGrowthXp() ?? 0 });
  }
}

function saveGrowth(
  g: GrowthState & { lastCheckin?: string; tasksDate?: string | null }
) {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const tasksDate = g.tasksDate ?? (g.tasksDone.length > 0 ? today : null);
  localStorage.setItem(
    STORAGE_GROWTH,
    JSON.stringify({
      xp: g.xp,
      streakDays: g.streakDays,
      tasksDone: g.tasksDone,
      tasksDate,
      lastCheckin: g.lastCheckinDate ?? g.lastCheckin ?? null,
    })
  );
}

function commitGrowth(g: {
  xp: number;
  streakDays?: number;
  tasksDone?: string[];
  lastCheckinDate?: string | null;
}): GrowthState {
  const next = toGrowthState(g);
  saveGrowth(next);
  return next;
}

/** 成长等级（轻量 hook，供「我的」页使用，避免拖入 use-product 全量 mock） */
export function useGrowth() {
  const { user } = useApp();
  const [growth, setGrowth] = useState<GrowthState>(loadGrowth);
  const serverMode = isClientServerMode();

  const refreshProductState = useCallback(async () => {
    if (!serverMode || !user) return;
    const r = await apiProductState();
    if (r.growth) {
      setGrowth(
        commitGrowth({
          xp: r.growth.xp,
          streakDays: r.growth.streakDays,
          tasksDone: r.growth.tasksDone,
          lastCheckinDate: r.growth.lastCheckinDate ?? null,
        })
      );
    }
  }, [serverMode, user]);

  useEffect(() => {
    if (!serverMode || !user) return;
    void refreshProductState();
  }, [serverMode, user?.id, refreshProductState]);

  useEffect(() => {
    if (!serverMode || user?.growthXp == null) return;
    setGrowth((g) => {
      if (g.xp === user.growthXp) return g;
      return commitGrowth({ ...g, xp: user.growthXp! });
    });
  }, [serverMode, user?.growthXp]);

  return { growth, refreshProductState };
}
