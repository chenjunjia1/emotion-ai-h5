"use client";

import { useCallback, useEffect, useState } from "react";
import { Dices, Sparkles } from "lucide-react";
import { ConfettiBurst } from "@/components/play/confetti-burst";
import { hapticLight, hapticSuccess, playGachaStop, playOpenBox } from "@/lib/play-feedback";
import { minDelay, withMinDuration } from "@/lib/play-timing";
import { cn } from "@/lib/utils";

export type GachaPhase = "idle" | "spinning" | "stopping" | "revealed";

const SLOT_EMOJIS = ["✨", "🎯", "🔥", "💡", "🧋", "💗", "⚡", "🌟", "🎰", "📈"];

function randomEmoji() {
  return SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)];
}

function SlotReel({
  phase,
  finalText,
  stopDelayMs,
}: {
  phase: GachaPhase;
  finalText?: string;
  stopDelayMs: number;
}) {
  const [display, setDisplay] = useState("?");
  const [reelSpin, setReelSpin] = useState(false);

  useEffect(() => {
    if (phase === "idle") {
      setDisplay("?");
      setReelSpin(false);
      return;
    }
    if (phase === "spinning") {
      setReelSpin(true);
      const id = window.setInterval(() => setDisplay(randomEmoji()), 80);
      return () => window.clearInterval(id);
    }
    if (phase === "stopping") {
      setReelSpin(true);
      const id = window.setInterval(() => setDisplay(randomEmoji()), 80);
      const stop = window.setTimeout(() => {
        setReelSpin(false);
        if (finalText) {
          setDisplay(finalText.slice(0, 2));
          playGachaStop();
        }
      }, stopDelayMs);
      return () => {
        window.clearInterval(id);
        window.clearTimeout(stop);
      };
    }
    if (phase === "revealed" && finalText) {
      setReelSpin(false);
      setDisplay(finalText.slice(0, 2));
    }
  }, [phase, finalText, stopDelayMs]);

  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white shadow-inner ring-2 ring-[#FFE8DC]">
      <span
        className={cn(
          "text-xl font-black",
          reelSpin ? "play-slot-blur" : "play-slot-land text-[#FF7AAE]"
        )}
      >
        {display}
      </span>
    </div>
  );
}

export function GachaStage({
  phase,
  onSpin,
  busy,
  spinLabel,
  spinningLabel,
  stoppingLabel,
  surpriseLabel,
  slotLabels,
  recommendedTitle,
}: {
  phase: GachaPhase;
  onSpin: () => void;
  busy: boolean;
  spinLabel: string;
  spinningLabel: string;
  stoppingLabel: string;
  surpriseLabel: string;
  slotLabels?: [string, string, string];
  recommendedTitle?: string;
}) {
  const spinning = phase === "spinning";
  const stopping = phase === "stopping";
  const revealed = phase === "revealed";

  const handleSpin = useCallback(() => {
    if (phase !== "idle" || busy) return;
    playOpenBox();
    hapticLight();
    onSpin();
  }, [phase, busy, onSpin]);

  const labels = slotLabels ?? ["?", "?", "?"];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-orange-100/80 p-5",
        "bg-gradient-to-br from-[#FFF8F3] via-white to-[#FFF0F8]",
        "shadow-[0_10px_32px_rgba(255,154,107,0.12)]"
      )}
    >
      <ConfettiBurst active={revealed} />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={cn(
            "mb-3 flex items-center gap-2",
            (spinning || stopping) && "play-gacha-machine-shake"
          )}
        >
          <div className="rounded-2xl bg-gradient-to-br from-[#FF9A6B] to-[#FF7AAE] p-3 shadow-md">
            <Dices size={22} className="text-white" />
          </div>
          <Sparkles size={16} className="text-[#FFC46B]" />
        </div>

        <div className="flex gap-2 rounded-2xl bg-[#FFF0E8]/80 p-3 ring-1 ring-orange-100/60">
          <SlotReel phase={phase} finalText={labels[0]} stopDelayMs={0} />
          <SlotReel phase={phase} finalText={labels[1]} stopDelayMs={400} />
          <SlotReel phase={phase} finalText={labels[2]} stopDelayMs={800} />
        </div>

        {phase === "idle" && (
          <>
            <p className="mt-4 text-center text-sm font-black text-slate-800">{spinLabel}</p>
            <button
              type="button"
              disabled={busy}
              onClick={handleSpin}
              className={cn(
                "mt-3 w-full max-w-[240px] rounded-full py-3 text-sm font-black text-white shadow-lg",
                "bg-gradient-to-r from-[#FF9A6B] via-[#FF7AAE] to-[#FFC46B] active:scale-[0.98] disabled:opacity-60"
              )}
            >
              🎰 {spinLabel}
            </button>
          </>
        )}

        {spinning && (
          <p className="mt-4 animate-pulse text-sm font-bold text-[#FF7AAE]">{spinningLabel}</p>
        )}

        {stopping && (
          <p className="mt-4 text-sm font-bold text-[#FF7AAE]">{stoppingLabel}</p>
        )}

        {revealed && recommendedTitle && (
          <div className="play-reveal-pop mt-4 w-full text-center">
            <p className="text-xs font-bold text-[#FF7AAE]">{surpriseLabel}</p>
            <div className="mt-2 rounded-2xl border-2 border-[#FF7AAE]/40 bg-white px-4 py-3 shadow-sm">
              <span className="text-[10px] font-bold text-[#FF7AAE]">✨ 今日最吸睛</span>
              <p className="mt-1 text-base font-black leading-snug text-slate-800">
                {recommendedTitle}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export async function runGachaReveal<T extends { titles?: { text: string }[]; recommended?: string }>(
  draw: () => Promise<T>,
  setPhase: (p: GachaPhase) => void
): Promise<T> {
  setPhase("spinning");
  const result = await withMinDuration(draw, 700);
  setPhase("stopping");
  await minDelay(320);
  setPhase("revealed");
  hapticSuccess();
  return result;
}
