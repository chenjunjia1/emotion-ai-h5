"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Gift } from "lucide-react";
import { QuestLootModal } from "@/components/play/quest-loot-modal";
import { ConfettiBurst } from "@/components/play/confetti-burst";
import { hapticSuccess, playChestClaim } from "@/lib/play-feedback";
import { minDelay } from "@/lib/play-timing";
import {
  applyQuestLootEffect,
  getSavedDailyLoot,
  rollQuestLoot,
  type QuestLootItem,
} from "@/lib/quest-loot";
import { getChestSkin } from "@/lib/play-rarity";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { isClientServerMode } from "@/lib/client/server-api";
import { cn } from "@/lib/utils";

const QUESTS = [
  {
    id: "topic" as const,
    emoji: "🎲",
    labelKey: "taskTopic" as const,
    rewardKey: "taskRewardTopic" as const,
    href: "/topic-box",
  },
  {
    id: "pack" as const,
    emoji: "⚡",
    labelKey: "taskPack" as const,
    rewardKey: "taskRewardPack" as const,
    href: "/publish-pack?mode=quick",
  },
  {
    id: "review" as const,
    emoji: "📊",
    labelKey: "taskReview" as const,
    rewardKey: "taskRewardReview" as const,
    href: "/review",
  },
] as const;

type ChestPhase = "locked" | "ready" | "opening" | "claimed";

export function HomeQuestRewards({ embedded }: { embedded?: boolean } = {}) {
  const { tr, showToast, user, setUser } = useApp();
  const { growth, completeTask } = useProduct();
  const [chestPhase, setChestPhase] = useState<ChestPhase>("locked");
  const [claiming, setClaiming] = useState(false);
  const [lootOpen, setLootOpen] = useState(false);
  const [todayLoot, setTodayLoot] = useState<QuestLootItem | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const skin = getChestSkin(Math.max(1, growth.streakDays || 1));

  useEffect(() => {
    const saved = getSavedDailyLoot();
    if (saved) {
      setTodayLoot(saved);
      setChestPhase("claimed");
    }
  }, [today]);

  const done = QUESTS.filter((q) => growth.tasksDone.includes(q.id)).length;
  const allDone = done >= 3;
  /** 仅在实际开箱并写入 loot 后算已领（不用 lastCheckinDate，避免 saveGrowth 误写日期） */
  const chestClaimed = Boolean(getSavedDailyLoot());

  const effectiveChest: ChestPhase = chestClaimed
    ? "claimed"
    : chestPhase === "opening"
      ? "opening"
      : allDone
        ? chestPhase === "locked"
          ? "ready"
          : chestPhase
        : "locked";

  const applyLootToUser = useCallback(
    (loot: QuestLootItem) => {
      applyQuestLootEffect(loot);
      if (
        !isClientServerMode() &&
        user &&
        (loot.effect === "quota_3" || loot.id === "legend")
      ) {
        setUser({ ...user, bonusQuota: user.bonusQuota + 3 });
      }
    },
    [setUser, user]
  );

  const onClaimChest = useCallback(async () => {
    if (!allDone || chestClaimed || claiming) return;
    setClaiming(true);
    setChestPhase("opening");
    playChestClaim();
    hapticSuccess();

    const loot = rollQuestLoot(growth.streakDays);
    setTodayLoot(loot);
    applyLootToUser(loot);

    await minDelay(800);
    await completeTask("checkin");
    setChestPhase("claimed");
    setClaiming(false);
    setLootOpen(true);
  }, [
    allDone,
    applyLootToUser,
    chestClaimed,
    claiming,
    completeTask,
    growth.streakDays,
  ]);

  const nextQuest = QUESTS.find((q) => !growth.tasksDone.includes(q.id));

  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden",
          embedded ? "px-3 pb-3 pt-1" : "cream-card rounded-[28px] p-4"
        )}
      >
        <ConfettiBurst active={effectiveChest === "opening"} />

        <div className="relative z-10 space-y-3">
          {/* 宝箱主卡 */}
          <div
            className={cn(
              "relative overflow-hidden rounded-[22px] px-4 py-3.5",
              effectiveChest === "ready" || effectiveChest === "opening"
                ? "bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] text-white shadow-[0_10px_28px_rgba(255,79,139,0.28)]"
                : effectiveChest === "claimed"
                  ? "bg-emerald-50 ring-1 ring-emerald-100"
                  : "bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE] ring-1 ring-[#FFD0E8]/80"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl",
                  effectiveChest === "ready" || effectiveChest === "opening"
                    ? "bg-white/20"
                    : effectiveChest === "claimed"
                      ? "bg-emerald-500 text-white"
                      : "bg-white shadow-sm"
                )}
              >
                {effectiveChest === "claimed" ? (
                  <Check size={22} strokeWidth={3} />
                ) : (
                  <span>{effectiveChest === "locked" ? "🎁" : skin.emoji}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm font-black",
                      effectiveChest === "ready" || effectiveChest === "opening"
                        ? "text-white"
                        : "text-slate-800"
                    )}
                  >
                    {effectiveChest === "claimed"
                      ? "今日宝箱已领"
                      : effectiveChest === "ready"
                        ? "可以开箱啦"
                        : "完成 3 步开宝箱"}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black",
                      effectiveChest === "ready" || effectiveChest === "opening"
                        ? "bg-white/25 text-white"
                        : "bg-white text-[#FF4F8B] shadow-sm"
                    )}
                  >
                    {done}/3
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] leading-snug",
                    effectiveChest === "ready" || effectiveChest === "opening"
                      ? "text-white/90"
                      : "text-slate-500"
                  )}
                >
                  {effectiveChest === "claimed" && todayLoot
                    ? `${todayLoot.emoji} ${todayLoot.title}`
                    : effectiveChest === "ready"
                      ? "随机灵感 · SSR符 · 彩蛋"
                      : nextQuest
                        ? `下一步：${tr(nextQuest.labelKey)}`
                        : "盲盒 → 发布包 → 复盘"}
                </p>
                {/* 三步进度点 */}
                <div className="mt-2 flex gap-1">
                  {QUESTS.map((q) => {
                    const finished = growth.tasksDone.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-500",
                          finished
                            ? effectiveChest === "ready" ||
                              effectiveChest === "opening"
                              ? "bg-white"
                              : "bg-emerald-400"
                            : effectiveChest === "ready" ||
                                effectiveChest === "opening"
                              ? "bg-white/35"
                              : "bg-pink-200/60"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {effectiveChest === "ready" && (
              <button
                type="button"
                disabled={claiming}
                onClick={() => void onClaimChest()}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-2.5 text-xs font-black text-[#FF4F8B] shadow-md active:scale-[0.98] disabled:opacity-70"
              >
                <Gift size={14} />
                {tr("questChestOpenFun")}
              </button>
            )}

            {effectiveChest === "opening" && (
              <p className="mt-3 text-center text-xs font-black text-white/95 animate-pulse">
                {tr("questChestRolling")}
              </p>
            )}

            {effectiveChest === "claimed" && todayLoot && (
              <button
                type="button"
                onClick={() => setLootOpen(true)}
                className="mt-2 w-full text-center text-[11px] font-bold text-emerald-600"
              >
                再看一眼奖励 →
              </button>
            )}
          </div>

          {/* 三步任务 */}
          <ul className="space-y-2">
            {QUESTS.map((q, idx) => {
              const finished = growth.tasksDone.includes(q.id);
              const isNext = !finished && nextQuest?.id === q.id;
              return (
                <li key={q.id}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-[18px] px-3 py-2.5 transition",
                      finished
                        ? "bg-emerald-50/80"
                        : isNext
                          ? "bg-white ring-2 ring-[#FF7AAE]/25 shadow-sm"
                          : "bg-white/90 ring-1 ring-orange-100/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg",
                        finished ? "bg-emerald-100" : "bg-[#FFF8F3]"
                      )}
                    >
                      {finished ? (
                        <Check size={18} className="text-emerald-600" strokeWidth={3} />
                      ) : (
                        q.emoji
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black text-slate-800">
                        <span className="mr-1 text-[10px] text-slate-400">{idx + 1}</span>
                        {tr(q.labelKey)}
                      </p>
                      <p className="text-[10px] font-bold text-[#FF7AAE]">{tr(q.rewardKey)}</p>
                    </div>
                    {finished ? (
                      <span className="text-[10px] font-black text-emerald-600">完成</span>
                    ) : (
                      <Link
                        href={q.href}
                        className={cn(
                          "shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black text-white shadow-sm active:scale-95",
                          isNext
                            ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D]"
                            : "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE]"
                        )}
                      >
                        {isNext ? "去做" : "GO"}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {growth.streakDays > 0 ? (
            <p className="text-center text-[10px] text-slate-400">
              连续打卡 {growth.streakDays} 天 · 宝箱越开越靓 {skin.emoji}
            </p>
          ) : null}
        </div>
      </section>

      <QuestLootModal
        open={lootOpen}
        loot={todayLoot}
        onClose={() => {
          setLootOpen(false);
          if (todayLoot) showToast(`${todayLoot.emoji} ${todayLoot.title}`);
        }}
      />
    </>
  );
}

/** 折叠条用的进度摘要 */
export function useQuestProgressSummary() {
  const { growth } = useProduct();
  const done = QUESTS.filter((q) => growth.tasksDone.includes(q.id)).length;
  const chestClaimed = Boolean(getSavedDailyLoot());
  return { done, total: 3, chestClaimed, allDone: done >= 3 };
}
