"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ConfettiBurst } from "@/components/play/confetti-burst";
import { hapticSsr, hapticSuccess, playSsrReveal } from "@/lib/play-feedback";
import { minDelay } from "@/lib/play-timing";
import type { QuestLootItem } from "@/lib/quest-loot";
import { LOOT_TIER_STYLE } from "@/lib/quest-loot";
import { cn } from "@/lib/utils";

const ROLL_EMOJIS = ["🎁", "✨", "🎰", "👑", "🧋", "💎", "🔥"];

export function QuestLootModal({
  open,
  loot,
  onClose,
}: {
  open: boolean;
  loot: QuestLootItem | null;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"roll" | "reveal">("roll");
  const [spinEmoji, setSpinEmoji] = useState("🎁");

  useEffect(() => {
    if (!open || !loot) return;
    setPhase("roll");
    let i = 0;
    const id = window.setInterval(() => {
      setSpinEmoji(ROLL_EMOJIS[i % ROLL_EMOJIS.length]);
      i += 1;
    }, 90);
    void minDelay(1400).then(() => {
      window.clearInterval(id);
      setPhase("reveal");
      if (loot.tier === "legend") {
        playSsrReveal();
        hapticSsr();
      } else if (loot.tier === "rare") {
        hapticSuccess();
      }
    });
    return () => window.clearInterval(id);
  }, [open, loot]);

  if (!open || !loot) return null;

  const style = LOOT_TIER_STYLE[loot.tier];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <ConfettiBurst active={phase === "reveal"} />
      <div
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-[28px] border bg-gradient-to-br p-6 shadow-2xl",
          style.bg,
          style.ring,
          "ring-2"
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-slate-500"
          aria-label="关闭"
        >
          <X size={16} />
        </button>

        {phase === "roll" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="play-box-shake mb-4 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#FF6B6B] to-[#FF7AAE] text-5xl shadow-lg">
              {spinEmoji}
            </div>
            <p className="animate-pulse text-sm font-black text-[#FF7AAE]">宝箱开启中…</p>
            <p className="mt-1 text-xs text-slate-500">猜猜今天掉什么？</p>
          </div>
        ) : (
          <div className="play-reveal-pop flex flex-col items-center py-4 text-center">
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-black text-[#FF7AAE]">
              {style.label}
            </span>
            <div
              className={cn(
                "mt-3 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-lg",
                loot.tier === "legend" && "play-ssr-shine bg-gradient-to-br from-amber-200 to-[#FF7AAE]",
                loot.tier === "rare" && "bg-gradient-to-br from-violet-100 to-pink-100",
                loot.tier === "normal" && "bg-gradient-to-br from-orange-50 to-pink-50"
              )}
            >
              {loot.emoji}
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-800">{loot.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{loot.desc}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] py-3 text-sm font-black text-white shadow-md active:scale-[0.98]"
            >
              收下啦 ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
