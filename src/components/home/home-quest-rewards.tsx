"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock, Sparkles, Zap } from "lucide-react";
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
import { CHEST_SKINS, getChestSkin } from "@/lib/play-rarity";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { isClientServerMode } from "@/lib/client/server-api";
import { XP_REWARDS } from "@/lib/v1/growth";
import { cn } from "@/lib/utils";

const QUESTS = [
  {
    id: "topic" as const,
    emoji: "🎲",
    labelKey: "taskTopic" as const,
    funKey: "taskFunTopic" as const,
    rewardKey: "taskRewardTopic" as const,
    href: "/topic-box",
  },
  {
    id: "pack" as const,
    emoji: "⚡",
    labelKey: "taskPack" as const,
    funKey: "taskFunPack" as const,
    rewardKey: "taskRewardPack" as const,
    href: "/publish-pack",
  },
  {
    id: "review" as const,
    emoji: "📊",
    labelKey: "taskReview" as const,
    funKey: "taskFunReview" as const,
    rewardKey: "taskRewardReview" as const,
    href: "/review",
  },
];

const MYSTERY_LOOT = ["👑 SSR符", "+3 灵感", "🎰 扭蛋运", "🧋 彩蛋"];

type ChestPhase = "locked" | "ready" | "opening" | "claimed";

export function HomeQuestRewards({ embedded }: { embedded?: boolean } = {}) {
  const { tr, showToast, user, setUser } = useApp();
  const { growth, completeTask } = useProduct();
  const [chestPhase, setChestPhase] = useState<ChestPhase>("locked");
  const [claiming, setClaiming] = useState(false);
  const [lootOpen, setLootOpen] = useState(false);
  const [todayLoot, setTodayLoot] = useState<QuestLootItem | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const skin = getChestSkin(Math.max(1, growth.streakDays));
  const streakDisplay = Math.min(7, Math.max(1, growth.streakDays || 1));

  useEffect(() => {
    const saved = getSavedDailyLoot();
    if (saved) setTodayLoot(saved);
    if (growth.lastCheckinDate === today) setChestPhase("claimed");
  }, [growth.lastCheckinDate, today]);

  const done = QUESTS.filter((q) => growth.tasksDone.includes(q.id)).length;
  const allDone = done >= 3;
  const chestClaimed = growth.lastCheckinDate === today;
  const luckPct = Math.round((done / 3) * 100);

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

  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden p-4",
          embedded ? "" : "cream-card rounded-[28px]"
        )}
      >
        <ConfettiBurst active={effectiveChest === "opening"} />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-1.5 text-base font-black text-slate-800">
                <Sparkles size={16} className="text-[#FF7AAE]" />
                {tr("dailyTasksTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{tr("questSubFun")}</p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              {done}/3
            </span>
          </div>

          {/* 今日欧气值 */}
          <div className="mt-3 rounded-[18px] bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE] px-3 py-2.5 ring-1 ring-[#FF7AAE]/20">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 font-black text-[#FF7AAE]">
                <Zap size={12} /> {tr("luckMeterTitle")}
              </span>
              <span className="font-black text-slate-700">{luckPct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/80">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B] transition-all duration-700",
                  luckPct >= 100 && "play-box-glow"
                )}
                style={{ width: `${luckPct}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-slate-500">
              {luckPct < 100 ? tr("luckMeterHint") : tr("luckMeterFull")}
            </p>
          </div>

          {/* 7 天宝箱进化 */}
          <div className="mt-2 rounded-[18px] bg-[#FFF8F3] px-3 py-2 ring-1 ring-orange-100/60">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-600">{tr("chestSkinTitle")}</span>
              <span className="font-black text-[#FF7AAE]">
                {tr("streakDays")} {growth.streakDays} · {skin.label}
              </span>
            </div>
            <div className="mt-2 flex justify-between gap-0.5">
              {CHEST_SKINS.map((s) => {
                const active = s.day <= streakDisplay;
                const current = s.day === streakDisplay;
                return (
                  <div
                    key={s.day}
                    className={cn(
                      "flex flex-1 flex-col items-center rounded-lg py-1 transition",
                      active ? "bg-white shadow-sm" : "opacity-35",
                      current && "ring-1 ring-[#FF7AAE]/50 scale-105"
                    )}
                  >
                    <span className="text-sm">{s.emoji}</span>
                    <span className="text-[8px] font-bold text-slate-500">{s.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {QUESTS.map((q, idx) => {
              const finished = growth.tasksDone.includes(q.id);
              return (
                <div
                  key={q.id}
                  className={cn(
                    "flex items-center gap-3 rounded-[18px] px-3 py-2.5 transition",
                    finished
                      ? "bg-[#F0FDF4] ring-1 ring-emerald-100"
                      : "bg-[#FFF8F3] ring-1 ring-orange-100/60",
                    !finished && done === idx && "ring-2 ring-[#FF7AAE]/30"
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    {q.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-800">{tr(q.labelKey)}</div>
                    <p className="text-[9px] text-slate-400">{tr(q.funKey)}</p>
                    <span
                      className={cn(
                        "mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        finished ? "bg-emerald-100 text-emerald-700" : "bg-[#FFF0F3] text-[#FF7AAE]"
                      )}
                    >
                      {finished ? "✓ 已领取" : tr(q.rewardKey)}
                    </span>
                  </div>
                  {finished ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <Link
                      href={q.href}
                      className="shrink-0 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-3 py-2 text-[10px] font-black text-white shadow-sm active:scale-95"
                    >
                      GO
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* 宝箱 */}
          <div
            className={cn(
              "mt-4 rounded-[22px] border p-3.5 transition",
              effectiveChest === "ready" || effectiveChest === "opening"
                ? "border-[#FF7AAE]/50 bg-gradient-to-br from-[#FFF0F5] to-[#FFF8EE] shadow-[0_8px_24px_rgba(255,122,174,0.2)]"
                : effectiveChest === "claimed"
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-orange-100/50 bg-[#FFFBF8]",
              done >= 2 && !chestClaimed && "play-box-shake"
            )}
          >
            {effectiveChest === "locked" && (
              <div className="mb-2 flex flex-wrap gap-1">
                {MYSTERY_LOOT.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold text-slate-400 ring-1 ring-orange-100/60"
                  >
                    ? {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl",
                  effectiveChest === "locked"
                    ? "bg-slate-200"
                    : effectiveChest === "claimed"
                      ? "bg-emerald-400 text-white"
                      : cn(skin.boxClass, skin.glowClass, "play-box-glow")
                )}
              >
                {effectiveChest === "locked" ? (
                  <Lock size={22} className="text-white/90" />
                ) : effectiveChest === "claimed" ? (
                  <span>✓</span>
                ) : (
                  <span className={cn(skin.day >= 7 && "play-chest-legend")}>{skin.emoji}</span>
                )}
                {effectiveChest === "ready" && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-[#FFC46B] text-[8px] font-black text-white">
                    !
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-slate-800">{tr("questChestTitle")}</div>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                  {effectiveChest === "locked" && tr("questChestLockedFun")}
                  {effectiveChest === "ready" && tr("questChestReadyFun")}
                  {effectiveChest === "opening" && tr("questChestOpening")}
                  {effectiveChest === "claimed" && tr("questChestClaimed")}
                </p>
                {effectiveChest === "claimed" && todayLoot && (
                  <button
                    type="button"
                    onClick={() => setLootOpen(true)}
                    className="mt-1 text-[10px] font-bold text-[#FF7AAE] underline"
                  >
                    {todayLoot.emoji} {todayLoot.title} · 再看一眼
                  </button>
                )}
                {effectiveChest === "claimed" && !todayLoot && (
                  <p className="mt-1 text-[10px] font-bold text-emerald-600">
                    +{XP_REWARDS.daily_tasks} {tr("questChestXp")}
                  </p>
                )}
              </div>
            </div>

            {effectiveChest === "ready" && (
              <button
                type="button"
                disabled={claiming}
                onClick={() => void onClaimChest()}
                className={cn(
                  "play-reveal-pop mt-3 w-full rounded-full py-3 text-xs font-black text-white shadow-lg active:scale-[0.98] disabled:opacity-70",
                  "bg-gradient-to-r",
                  skin.boxClass
                )}
              >
                {skin.emoji} {tr("questChestOpenFun")}
              </button>
            )}

            {effectiveChest === "opening" && (
              <p className="mt-3 animate-pulse text-center text-xs font-black text-[#FF7AAE]">
                {tr("questChestRolling")}
              </p>
            )}
          </div>
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
