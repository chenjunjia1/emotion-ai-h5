"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Gift, X } from "lucide-react";
import {
  HomeQuestRewards,
  useQuestProgressSummary,
} from "@/components/home/home-quest-rewards";
import { useAppUi } from "@/contexts/app-ui-context";
import { useGrowth } from "@/hooks/use-growth";
import { cn } from "@/lib/utils";

/** 我的页 · 会员中心下方横向任务条 */
export function ProfileDailyQuestStrip() {
  const { tr } = useAppUi();
  const { refreshProductState } = useGrowth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { done, total, chestClaimed, allDone } = useQuestProgressSummary();

  const canClaim = allDone && !chestClaimed;
  const statusText = chestClaimed
    ? "今日宝箱已领 · 明天再来"
    : canClaim
      ? "3 步已完成 · 点开领宝箱"
      : tr("bonusMissionSub");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    void refreshProductState();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, refreshProductState]);

  const sheet =
    open && mounted ? (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
        style={{
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingBottom: "max(5.75rem, calc(env(safe-area-inset-bottom) + 4.5rem))",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={tr("dailyTasksTitle")}
        onClick={() => setOpen(false)}
      >
        <div
          className="flex max-h-full w-full max-w-md min-h-0 flex-col overflow-hidden rounded-[24px] bg-[#FFF8FB] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[#FFE8F0] px-4 py-3">
            <div className="min-w-0 pr-2">
              <p className="text-[15px] font-black text-slate-800">{tr("dailyTasksTitle")}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                {tr("dailyTasksHint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-[#FFE8F0] active:scale-95"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <HomeQuestRewards embedded />
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 rounded-[20px] px-3.5 py-3 text-left shadow-sm transition active:scale-[0.99]",
          canClaim
            ? "bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE] ring-2 ring-[#FF7AAE]/35"
            : "bg-white ring-1 ring-[#FFE8F0]"
        )}
      >
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm",
            canClaim
              ? "bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D]"
              : "bg-gradient-to-br from-[#FF8FAB] to-[#FFC46B]"
          )}
        >
          <Gift size={20} strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-black text-slate-800">{tr("bonusMissionTitle")}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black",
                canClaim
                  ? "bg-[#FF4F8B] text-white"
                  : chestClaimed
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-[#FFF0F5] text-[#FF4F8B]"
              )}
            >
              {chestClaimed ? "已领" : `${done}/${total}`}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-slate-500">
            {statusText}
          </p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < done ? "bg-[#FF7AAE]" : "bg-orange-100"
                )}
              />
            ))}
          </div>
        </div>

        <ChevronRight
          size={18}
          className={cn("shrink-0", canClaim ? "text-[#FF4F8B]" : "text-slate-300")}
        />
      </button>

      {sheet && createPortal(sheet, document.body)}
    </>
  );
}
