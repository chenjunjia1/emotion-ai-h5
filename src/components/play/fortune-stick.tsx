"use client";

import { useCallback, useEffect, useState } from "react";
import { hapticLight, hapticSuccess } from "@/lib/play-feedback";
import { markPlayUsedToday, wasPlayUsedToday } from "@/lib/play-daily";
import { cn } from "@/lib/utils";

const STICKS = [
  { level: "大吉", emoji: "🌟", text: "今天发啥都像开了挂，先发一条试试水" },
  { level: "中吉", emoji: "✨", text: "稳扎稳打，发「情绪共鸣」最容易有互动" },
  { level: "小吉", emoji: "🌸", text: "适合发短平快清单，别拖太长" },
  { level: "吉", emoji: "🧋", text: "摸鱼也行，但记得晚上复盘一下数据" },
  { level: "上上签", emoji: "👑", text: "爆款预定！建议立刻开盲盒选题" },
];

export function FortuneStick({ onDraw }: { onDraw?: (text: string) => void }) {
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState<(typeof STICKS)[0] | null>(null);
  const [used, setUsed] = useState(false);

  useEffect(() => {
    setUsed(wasPlayUsedToday("stick"));
  }, []);

  const draw = useCallback(() => {
    if (used || shaking) return;
    setShaking(true);
    hapticLight();
    const picked = STICKS[Math.floor(Math.random() * STICKS.length)];
    window.setTimeout(() => {
      setShaking(false);
      setResult(picked);
      markPlayUsedToday("stick");
      setUsed(true);
      hapticSuccess();
      onDraw?.(picked.text);
    }, 1600);
  }, [onDraw, shaking, used]);

  return (
    <div className="flex flex-col items-center py-2 text-center">
      <div
        className={cn(
          "flex h-28 w-16 flex-col items-center justify-end rounded-b-full rounded-t-lg bg-gradient-to-b from-amber-700 to-amber-900 shadow-lg",
          shaking && "play-box-shake"
        )}
      >
        <span className="mb-2 text-[10px] font-black text-amber-100 [writing-mode:vertical-rl]">
          今日运势签
        </span>
      </div>

      {result ? (
        <div className="play-reveal-pop mt-4 w-full rounded-2xl bg-white/90 p-3 ring-1 ring-amber-200">
          <span className="text-lg font-black text-amber-700">
            {result.emoji} {result.level}
          </span>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.text}</p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">摇一支签，看今天怎么发</p>
      )}

      <button
        type="button"
        disabled={used || shaking}
        onClick={draw}
        className={cn(
          "mt-3 w-full rounded-full py-2.5 text-xs font-black text-white shadow-md active:scale-95 disabled:opacity-50",
          "bg-gradient-to-r from-amber-500 to-orange-400"
        )}
      >
        {used ? "明日再求签" : shaking ? "摇签中…" : "🎋 摇一支签"}
      </button>
    </div>
  );
}
