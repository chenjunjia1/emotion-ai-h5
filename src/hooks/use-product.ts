"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/app-context";
import {
  STORAGE_GROWTH,
  STORAGE_HOT_TOPICS,
  STORAGE_INVITE_PENDING,
  STORAGE_USER,
} from "@/lib/constants/v1";
import type { User } from "@/lib/types/v1";
import {
  mockAccountPersonalityTest,
  mockEmotionChat,
  mockGodReplies,
  mockHotTopics,
  mockPostReview,
  mockTopicBlindBox,
  mockViralScore,
} from "@/lib/mock/content-v1";
import { playTaskDone } from "@/lib/play-feedback";
import { getLevelByXp, XP_REWARDS } from "@/lib/v1/growth";
import {
  bumpFeature,
  canUseFeature,
  loadDailyUsage,
  type DailyUsage,
} from "@/lib/v1/usage-storage";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { makeInviteCode } from "@/lib/invite-code";
import { normalizeTopicBoxResult } from "@/lib/ai/normalize-ai-result";
import { QUOTA_COST } from "@/lib/constants/v1";
import { applyQuotaDeduct, canAffordQuota, getTotalQuota } from "@/lib/v1/quota";
import {
  apiAccountTest,
  apiDrawTopicBox,
  apiEmotionChat,
  apiGetHotTopics,
  apiGrowthAction,
  apiInviteBlindBox,
  apiInviteRecords,
  apiProductState,
  apiReply,
  apiReview,
  apiScore,
  type InviteRecordDto,
  isClientServerMode,
} from "@/lib/client/server-api";
import {
  loadInviteRecordsFor,
  openLocalInviteBlindBox,
} from "@/lib/v1/invite-local";

export interface GrowthState {
  xp: number;
  streakDays: number;
  tasksDone: string[];
  lastCheckinDate: string | null;
  level: ReturnType<typeof getLevelByXp>;
}

export interface HotTopicItem {
  id: string;
  title: string;
  desc: string;
  heat: string;
  track: string;
  format: string;
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
      ? (JSON.parse(raw) as Omit<GrowthState, "level"> & { lastCheckin?: string })
      : { xp: 0, streakDays: 0, tasksDone: [] as string[], lastCheckinDate: null };
    const today = new Date().toISOString().slice(0, 10);
    const lastCheckin = g.lastCheckinDate ?? g.lastCheckin ?? null;
    const tasksDone = lastCheckin === today ? (g.tasksDone ?? []) : [];
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

function saveGrowth(g: GrowthState & { lastCheckin?: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_GROWTH,
    JSON.stringify({
      xp: g.xp,
      streakDays: g.streakDays,
      tasksDone: g.tasksDone,
      lastCheckin: g.lastCheckin ?? g.lastCheckinDate ?? new Date().toISOString().slice(0, 10),
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

export function useProduct() {
  const {
    user,
    showToast,
    tr,
    addHistory,
    generatePublishPack: ctxGeneratePublishPack,
    refreshUser,
    setLoginOpen,
    setUser,
    openQuotaModal,
  } = useApp();
  const [growth, setGrowth] = useState<GrowthState>(loadGrowth);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(loadDailyUsage);
  const [hotTopics, setHotTopics] = useState<HotTopicItem[]>([]);
  const [lastTopicBox, setLastTopicBox] = useState<Record<string, unknown> | null>(
    null
  );
  const [inviteRecords, setInviteRecords] = useState<InviteRecordDto[]>([]);

  const plan = user?.plan ?? "free";
  const serverMode = isClientServerMode();

  const syncHistories = useCallback(() => {
    if (serverMode) void refreshUser();
  }, [refreshUser, serverMode]);

  const refreshProductState = useCallback(async () => {
    if (!serverMode || !user) return;
    const r = await apiProductState();
    if (r.dailyUsage) {
      setDailyUsage({
        date: new Date().toISOString().slice(0, 10),
        topicBox: r.dailyUsage.topicBox,
        titleGacha: r.dailyUsage.titleGacha,
        viralScore: r.dailyUsage.viralScore,
        hotTopicGen: r.dailyUsage.hotTopicGen,
      });
    }
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
    if (serverMode && user) {
      void refreshProductState();
    }
  }, [serverMode, user?.id, refreshProductState]);

  useEffect(() => {
    if (!serverMode || user?.growthXp == null) return;
    setGrowth((g) => {
      if (g.xp === user.growthXp) return g;
      return commitGrowth({ ...g, xp: user.growthXp! });
    });
  }, [serverMode, user?.growthXp]);

  useEffect(() => {
    let cancelled = false;
    const key = new Date().toISOString().slice(0, 10);
    const loadLocal = () => {
      const cached = localStorage.getItem(STORAGE_HOT_TOPICS);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { date: string; items: HotTopicItem[] };
          if (
            parsed.date === key &&
            Array.isArray(parsed.items) &&
            parsed.items.length >= 30
          ) {
            setHotTopics(parsed.items);
            return;
          }
          if (parsed.date === key && (!parsed.items?.length || parsed.items.length < 30)) {
            localStorage.removeItem(STORAGE_HOT_TOPICS);
          }
        } catch {
          localStorage.removeItem(STORAGE_HOT_TOPICS);
        }
      }
      const items = mockHotTopics(key);
      setHotTopics(items);
      localStorage.setItem(STORAGE_HOT_TOPICS, JSON.stringify({ date: key, items }));
    };

    const loadRemote = () => {
      void apiGetHotTopics()
        .then((r) => {
          if (cancelled) return;
          if (r.items?.length) {
            setHotTopics(r.items);
            localStorage.setItem(
              STORAGE_HOT_TOPICS,
              JSON.stringify({ date: key, items: r.items })
            );
          } else {
            loadLocal();
          }
        })
        .catch(() => {
          if (!cancelled) loadLocal();
        });
    };

    if (serverMode) {
      const timeoutId = window.setTimeout(loadRemote, 0) as unknown as number;
      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }
    loadLocal();
    return () => {
      cancelled = true;
    };
  }, [serverMode]);

  useEffect(() => {
    if (!user) {
      setInviteRecords([]);
      return;
    }
    let cancelled = false;
    const load = () => {
      if (serverMode) {
        void apiInviteRecords().then((r) => {
          if (!cancelled && r.records) setInviteRecords(r.records);
        });
        return;
      }
      if (!cancelled) {
        setInviteRecords(
          loadInviteRecordsFor(user.id).map((r) => ({
            ...r,
            inviteeRewardQuota: 0,
            memberRewardQuota: r.memberRewardQuota ?? 0,
            isMember: r.rewardStatus === "member_rewarded",
          }))
        );
      }
    };
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(load, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(load, 120) as unknown as number;
    }
    return () => {
      cancelled = true;
      if (idleId != null && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [user, serverMode]);

  const addXp = useCallback(
    async (amount: number) => {
      if (serverMode && user) {
        const r = await apiGrowthAction({ action: "xp", xpAmount: amount });
        if (r.user) setUser(r.user);
        if (r.growth) {
          setGrowth(
            commitGrowth({
              xp: r.growth.xp,
              streakDays: r.growth.streakDays,
              tasksDone: r.growth.tasksDone,
              lastCheckinDate: r.growth.lastCheckinDate ?? null,
            })
          );
          return;
        }
      }
      setGrowth((g) => commitGrowth({ ...g, xp: g.xp + amount }));
    },
    [serverMode, setUser, user]
  );

  const markTask = useCallback(
    (id: string) => {
      setGrowth((g) => {
        if (g.tasksDone.includes(id)) return g;
        const next = { ...g, tasksDone: [...g.tasksDone, id] };
        saveGrowth(next);
        return next;
      });
    },
    []
  );

  const completeTask = useCallback(
    async (id: string) => {
      if (id === "checkin") {
        if (serverMode && user) {
          const r = await apiGrowthAction({ action: "checkin" });
          if (r.user) setUser(r.user);
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
        } else {
          const today = new Date().toISOString().slice(0, 10);
          setGrowth((g) => {
            const next = {
              ...g,
              streakDays: g.streakDays + 1,
              xp: g.xp + XP_REWARDS.daily_tasks,
              tasksDone: g.tasksDone,
              lastCheckinDate: today,
              level: getLevelByXp(g.xp + XP_REWARDS.daily_tasks),
            };
            saveGrowth({ ...next, lastCheckin: today });
            return next;
          });
        }
        showToast(tr("checkinDone"));
        return;
      }
      if (serverMode && user) {
        const r = await apiGrowthAction({ action: "task", taskId: id });
        if (r.user) setUser(r.user);
        if (r.growth) {
          setGrowth(
            commitGrowth({
              xp: r.growth.xp,
              streakDays: r.growth.streakDays,
              tasksDone: r.growth.tasksDone,
              lastCheckinDate: r.growth.lastCheckinDate ?? null,
            })
          );
          playTaskDone();
          showToast(tr("questTaskDone"));
          return;
        }
      }
      markTask(id);
      const xp =
        id === "topic"
          ? XP_REWARDS.topic_box
          : id === "pack"
            ? XP_REWARDS.publish_pack
            : id === "review"
              ? XP_REWARDS.review
              : 5;
      void addXp(xp);
      playTaskDone();
      showToast(tr("questTaskDone"));
    },
    [addXp, markTask, serverMode, setUser, showToast, tr, user]
  );

  const ensureLogin = useCallback(() => {
    if (!user) {
      setLoginOpen(true);
      return false;
    }
    return true;
  }, [user, setLoginOpen]);

  const drawTopicBox = useCallback(
    async (input: Record<string, string>) => {
      if (!ensureLogin()) return null;
      if (!serverMode) {
        if (!user || !canAffordQuota(user, "topic_box")) {
          openQuotaModal();
          return null;
        }
      }
      if (serverMode) {
        const res = await apiDrawTopicBox(input);
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return null;
        }
        if (res.user) setUser(res.user);
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return null;
        }
        if (!res.result) return null;
        const normalized = normalizeTopicBoxResult(
          res.result as Record<string, unknown>,
          {
            platform: input.platform ?? "抖音",
            track: input.track ?? "职场成长",
            goal: input.goal ?? "涨粉",
            style: input.style ?? "温柔",
          }
        );
        setLastTopicBox(normalized);
        addHistory("今日选题盲盒", String(normalized.topic ?? ""), normalized, {
          id: res.generationId,
        });
        syncHistories();
        return normalized;
      }
      const result = mockTopicBlindBox({
        platform: input.platform ?? "抖音",
        track: input.track ?? "职场成长",
        goal: input.goal ?? "涨粉",
        style: input.style ?? "温柔",
      });
      setUser((u) => (u ? applyQuotaDeduct(u, QUOTA_COST.topic_box ?? 1) : u));
      setLastTopicBox(result as Record<string, unknown>);
      addHistory(
        "今日选题盲盒",
        String((result as Record<string, unknown>).topic ?? ""),
        result as Record<string, unknown>
      );
      markTask("topic");
      addXp(XP_REWARDS.topic_box);
      showToast(tr("questTaskDone"));
      return result;
    },
    [
      addHistory,
      addXp,
      ensureLogin,
      markTask,
      openQuotaModal,
      serverMode,
      setLoginOpen,
      setUser,
      showToast,
      syncHistories,
      tr,
      user,
    ]
  );

  const generatePublishPack = useCallback(
    async (input: Record<string, string | boolean>) => {
      if (!ensureLogin()) return null;
      const topic = String(input.topic ?? "").trim();
      if (!topic) return null;
      const quotaAction =
        input.quotaAction === "hot_topic_pack" ? "hot_topic_pack" : "publish_pack";
      const { result } = await ctxGeneratePublishPack({
        topic,
        platform: String(input.platform ?? "抖音"),
        track: String(input.track ?? "职场成长"),
        goal: String(input.goal ?? "涨粉"),
        style: String(input.style ?? "温柔"),
        withXhs: Boolean(input.withXhs),
        quotaAction,
      });
      if (!result) return null;
      if (serverMode) {
        syncHistories();
      } else {
        markTask("pack");
        void addXp(XP_REWARDS.publish_pack);
      }
      return result;
    },
    [
      addXp,
      ctxGeneratePublishPack,
      ensureLogin,
      markTask,
      serverMode,
      syncHistories,
    ]
  );

  const runAccountTest = useCallback(
    async (answers: Record<string, string>) => {
      if (!ensureLogin()) return null;
      if (serverMode) {
        const res = await apiAccountTest(answers);
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return null;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return null;
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          syncHistories();
          return res.result;
        }
        return null;
      }
      const result = mockAccountPersonalityTest(answers);
      void addXp(XP_REWARDS.account);
      return result;
    },
    [
      addXp,
      ensureLogin,
      openQuotaModal,
      serverMode,
      setLoginOpen,
      setUser,
      syncHistories,
    ]
  );

  const analyzeEmotionChat = useCallback(
    async (input: {
      chat: string;
      relationship: string;
      goal: string;
      style: string;
    }) => {
      if (!ensureLogin()) return null;
      const emotionCost = QUOTA_COST.emotion_chat ?? 2;
      if (!serverMode) {
        if (!user || !canAffordQuota(user, "emotion_chat")) {
          openQuotaModal({
            need: emotionCost,
            have: user ? getTotalQuota(user) : 0,
          });
          return null;
        }
      }
      if (serverMode) {
        const res = await apiEmotionChat(input);
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return null;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return null;
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          syncHistories();
          return { ...res.result, usedMock: res.usedMock };
        }
        return null;
      }
      const result = mockEmotionChat(input);
      setUser((u) => (u ? applyQuotaDeduct(u, emotionCost) : u));
      addHistory("AI情绪聊天", input.chat.slice(0, 80), result as Record<string, unknown>);
      markTask("reply");
      void addXp(XP_REWARDS.reply);
      return result;
    },
    [
      addHistory,
      addXp,
      ensureLogin,
      markTask,
      openQuotaModal,
      serverMode,
      setLoginOpen,
      setUser,
      syncHistories,
      user,
    ]
  );

  const generateReplies = useCallback(
    async (comment: string) => {
      if (!ensureLogin()) return null;
      if (serverMode) {
        const res = await apiReply(comment);
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return null;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return null;
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          syncHistories();
          return res.result;
        }
        return null;
      }
      const result = mockGodReplies(comment);
      addHistory("神回复", comment.slice(0, 80), result as Record<string, unknown>);
      markTask("reply");
      void addXp(XP_REWARDS.reply);
      return result;
    },
    [
      addHistory,
      addXp,
      ensureLogin,
      markTask,
      openQuotaModal,
      serverMode,
      setLoginOpen,
      setUser,
      syncHistories,
    ]
  );

  const scoreContent = useCallback(
    async (input: { title: string; script: string; xhs?: string }) => {
      if (!ensureLogin()) return null;
      if (!serverMode && !canUseFeature(plan, "viralScore", dailyUsage)) {
        showToast(tr("scoreLimit"));
        return null;
      }
      if (serverMode) {
        const res = await apiScore({
          title: input.title,
          script: input.script,
          xhs: input.xhs ?? "",
        });
        if (res.error === "feature_limit") {
          showToast(tr("scoreLimit"));
          return null;
        }
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return null;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return null;
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          syncHistories();
          return res.result;
        }
        return null;
      }
      const result = mockViralScore(input);
      addHistory(
        "爆款潜力打分",
        input.title.trim() || input.script.slice(0, 40) || "未命名",
        result as Record<string, unknown>
      );
      setDailyUsage(bumpFeature(dailyUsage, "viralScore"));
      return result;
    },
    [
      addHistory,
      dailyUsage,
      ensureLogin,
      openQuotaModal,
      plan,
      serverMode,
      setLoginOpen,
      setUser,
      showToast,
      syncHistories,
      tr,
    ]
  );

  const saveReview = useCallback(
    async (input: Record<string, string | number>) => {
      if (!ensureLogin()) return null;
      const reviewCost = QUOTA_COST.review ?? 2;
      if (!serverMode) {
        if (!user || !canAffordQuota(user, "review")) {
          openQuotaModal({
            need: reviewCost,
            have: user ? getTotalQuota(user) : 0,
          });
          return null;
        }
      }
      if (serverMode) {
        const res = await apiReview(input);
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return null;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return null;
        }
        if (res.user) setUser(res.user);
        if (res.result) {
          syncHistories();
          return { ...res.result, usedMock: res.usedMock };
        }
        return null;
      }
      const result = mockPostReview(input);
      setUser((u) => (u ? applyQuotaDeduct(u, reviewCost) : u));
      addHistory("发完复盘", String(input.title ?? ""), result as Record<string, unknown>);
      markTask("review");
      void addXp(XP_REWARDS.review);
      return result;
    },
    [
      addHistory,
      addXp,
      ensureLogin,
      markTask,
      openQuotaModal,
      serverMode,
      setLoginOpen,
      setUser,
      syncHistories,
      user,
    ]
  );

  const openInviteBlindBox = useCallback(() => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (serverMode) {
      void apiInviteBlindBox().then((r) => {
        if (r.error === "no_blind_box") {
          showToast("暂无灵感盲盒次数");
          return;
        }
        if (r.error === "unauthorized") {
          setLoginOpen(true);
          return;
        }
        if (r.user) setUser(r.user);
        if (r.reward) showToast(`开盲盒获得：${r.reward.label}`);
      });
      return;
    }
    const r = openLocalInviteBlindBox(user);
    if (!r) {
      showToast("暂无灵感盲盒次数");
      return;
    }
    setUser(r.user);
    showToast(`开盲盒获得：${r.reward.label}`);
  }, [serverMode, setUser, showToast, user, setLoginOpen]);

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    const code =
      user?.inviteCode ?? (user ? makeInviteCode(user.mobile, user.id) : "SV0000");
    return `${window.location.origin}/?invite_code=${code}`;
  }, [user]);

  const featureLimits = FEATURE_LIMITS[plan];

  return {
    growth,
    hotTopics,
    lastTopicBox,
    dailyUsage,
    featureLimits,

    completeTask,
    drawTopicBox,
    generatePublishPack,
    runAccountTest,
    generateReplies,
    analyzeEmotionChat,
    scoreContent,
    saveReview,
    inviteLink,
    inviteRecords,
    openInviteBlindBox,
  };
}
