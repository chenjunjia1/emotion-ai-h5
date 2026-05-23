"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HomeQuestRewards } from "@/components/home/home-quest-rewards";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

/** 任务奖励默认收起，游乐场优先 */
export function HomeDailyTasksCollapsible() {
  const { tr } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <section className="cream-card rounded-[28px] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left active:bg-orange-50/50"
      >
        <div>
          <p className="text-sm font-black text-slate-800">{tr("bonusMissionTitle")}</p>
          <p className="text-[10px] text-slate-500">{tr("bonusMissionSub")}</p>
        </div>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-slate-400 transition", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-orange-100/60 px-1 pb-1 pt-0">
          <HomeQuestRewards embedded />
        </div>
      )}
    </section>
  );
}
