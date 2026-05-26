"use client";

import { useState } from "react";
import { ChevronDown, Gift } from "lucide-react";
import {
  HomeQuestRewards,
  useQuestProgressSummary,
} from "@/components/home/home-quest-rewards";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

/** 任务奖励默认收起；标题栏展示进度吸引展开 */
export function HomeDailyTasksCollapsible() {
  const { tr } = useApp();
  const [open, setOpen] = useState(false);
  const { done, total, chestClaimed, allDone } = useQuestProgressSummary();

  return (
    <section className="cream-card overflow-hidden rounded-[22px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-orange-50/50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm">
          <Gift size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-800">{tr("bonusMissionTitle")}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {chestClaimed
              ? "今日宝箱已领 · 明天再来"
              : allDone
                ? "3 步已完成 · 点开领宝箱"
                : tr("bonusMissionSub")}
          </p>
          {!open && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-0.5">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full",
                      i < done ? "bg-[#FF7AAE]" : "bg-orange-100"
                    )}
                  />
                ))}
              </div>
              <span className="shrink-0 text-[10px] font-black text-[#FF4F8B]">
                {done}/{total}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-slate-400 transition", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-orange-100/60">
          <HomeQuestRewards embedded />
        </div>
      )}
    </section>
  );
}
