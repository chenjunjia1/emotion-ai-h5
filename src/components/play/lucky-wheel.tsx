"use client";

import { useCallback, useEffect, useState } from "react";
import { hapticSuccess, playSsrReveal, hapticSsr } from "@/lib/play-feedback";
import { markPlayUsedToday, wasPlayUsedToday } from "@/lib/play-daily";
import { applyQuestLootEffect } from "@/lib/quest-loot";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { id: "ssr", label: "SSR符", emoji: "👑", color: "#FFD700" },
  { id: "quota", label: "+2灵感", emoji: "🎫", color: "#FF7AAE" },
  { id: "hot", label: "爆款运", emoji: "🔥", color: "#FF6B6B" },
  { id: "meme", label: "彩蛋", emoji: "😎", color: "#C4B5FD" },
  { id: "inspire", label: "+8灵感", emoji: "✨", color: "#67E8F9" },
  { id: "gacha", label: "扭蛋运", emoji: "🎰", color: "#FF9A6B" },
  { id: "luck", label: "欧气+1", emoji: "🧋", color: "#FFB8D9" },
  { id: "again", label: "谢谢参与", emoji: "🌸", color: "#FFE8DC" },
];

const CONIC = SEGMENTS.map((s, i) => {
  const step = 360 / SEGMENTS.length;
  const start = i * step;
  const end = start + step;
  return `${s.color} ${start}deg ${end}deg`;
}).join(", ");

function pickSegment() {
  const weights = [1, 2, 2, 2, 2, 2, 2, 4];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SEGMENTS.length; i++) {
    r -= weights[i];
    if (r <= 0) return { seg: SEGMENTS[i], index: i };
  }
  return { seg: SEGMENTS[7], index: 7 };
}

export function LuckyWheel({ onPrize }: { onPrize?: (label: string) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [used, setUsed] = useState(false);

  useEffect(() => {
    setUsed(wasPlayUsedToday("wheel"));
  }, []);

  const spin = useCallback(() => {
    if (spinning || used) return;
    const { seg, index } = pickSegment();
    const slice = 360 / SEGMENTS.length;
    const target = 360 * 6 + (SEGMENTS.length - index) * slice + slice / 2;
    setSpinning(true);
    setRotation((r) => r + target);
    window.setTimeout(() => {
      setSpinning(false);
      setResult(`${seg.emoji} ${seg.label}`);
      markPlayUsedToday("wheel");
      setUsed(true);
      if (seg.id === "ssr") {
        applyQuestLootEffect({
          id: "ssr_buff",
          tier: "rare",
          emoji: "👑",
          title: "SSR 欧气符",
          desc: "",
          effect: "ssr_buff",
        });
        playSsrReveal();
        hapticSsr();
      } else {
        hapticSuccess();
      }
      onPrize?.(`${seg.emoji} ${seg.label}`);
    }, 4200);
  }, [onPrize, spinning, used]);

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative">
        <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 text-base text-[#FF6B6B]">
          ▼
        </div>
        <div
          className="relative h-40 w-40 rounded-full border-4 border-white shadow-xl transition-transform duration-[4s] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${CONIC})`,
          }}
        >
          <div className="absolute left-1/2 top-1/2 z-[1] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl shadow-inner ring-2 ring-[#FFE8DC]">
            🎡
          </div>
        </div>
      </div>

      {result && (
        <p className="play-reveal-pop mt-4 text-sm font-black text-[#FF7AAE]">获得 {result}</p>
      )}

      <button
        type="button"
        disabled={spinning || used}
        onClick={spin}
        className={cn(
          "mt-3 w-full rounded-full py-2.5 text-xs font-black text-white shadow-md active:scale-95 disabled:opacity-50",
          "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE]"
        )}
      >
        {used ? "明日再来转" : spinning ? "欧气加载中…" : "👉 转一下"}
      </button>
    </div>
  );
}
