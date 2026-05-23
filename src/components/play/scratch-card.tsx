"use client";

import { useCallback, useEffect, useState } from "react";
import { hapticLight, hapticSuccess } from "@/lib/play-feedback";
import { markPlayUsedToday, wasPlayUsedToday } from "@/lib/play-daily";
import { cn } from "@/lib/utils";

const PRIZES = [
  { emoji: "🔥", text: "今日爆款运 +15%" },
  { emoji: "🎯", text: "下条标题更吸睛" },
  { emoji: "🧋", text: "摸鱼许可卡 ×1" },
  { emoji: "✨", text: "灵感闪送 +10" },
  { emoji: "👑", text: "隐藏款：你很会运营" },
];

function pickPrize() {
  return PRIZES[Math.floor(Math.random() * PRIZES.length)];
}

export function ScratchCard({ onReveal }: { onReveal?: (text: string) => void }) {
  const [progress, setProgress] = useState(0);
  const [prize, setPrize] = useState<(typeof PRIZES)[0] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [used, setUsed] = useState(false);

  useEffect(() => {
    setUsed(wasPlayUsedToday("scratch"));
    if (wasPlayUsedToday("scratch")) setRevealed(true);
  }, []);

  const scratch = useCallback(() => {
    if (used || revealed) return;
    if (!prize) setPrize(pickPrize());
    hapticLight();
    setProgress((p) => {
      const next = Math.min(100, p + 18 + Math.floor(Math.random() * 12));
      if (next >= 100) {
        const pz = prize ?? pickPrize();
        if (!prize) setPrize(pz);
        setRevealed(true);
        markPlayUsedToday("scratch");
        setUsed(true);
        hapticSuccess();
        onReveal?.(`${pz.emoji} ${pz.text}`);
      }
      return next;
    });
  }, [onReveal, prize, revealed, used]);

  const display = prize ?? PRIZES[0];

  return (
    <div className="flex flex-col items-center py-2">
      <button
        type="button"
        disabled={used || revealed}
        onClick={scratch}
        className={cn(
          "relative h-32 w-full max-w-[260px] overflow-hidden rounded-[20px] border-2 border-dashed border-[#FF7AAE]/40 active:scale-[0.98]",
          revealed ? "border-emerald-200 bg-emerald-50" : "bg-gradient-to-br from-slate-300 to-slate-400"
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF0F5] to-[#FFE8DC] p-4">
          <span className="text-3xl">{display.emoji}</span>
          <p className="mt-2 text-center text-sm font-black text-slate-800">{display.text}</p>
        </div>
        {!revealed && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-400/90 transition-opacity"
            style={{ opacity: 1 - progress / 100 }}
          >
            <span className="text-2xl">🪙</span>
            <p className="mt-1 text-xs font-bold text-white">点我刮开 ({progress}%)</p>
          </div>
        )}
      </button>
      <p className="mt-2 text-[10px] text-slate-500">
        {used || revealed ? "今日刮刮卡已用完" : "连点刮开，看今日隐藏 buff"}
      </p>
    </div>
  );
}
