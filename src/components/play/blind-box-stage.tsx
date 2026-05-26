"use client";

import { useCallback, useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { ConfettiBurst } from "@/components/play/confetti-burst";
import {
  hapticLight,
  hapticSuccess,
  hapticSsr,
  playBlindBoxPop,
  playOpenBox,
  playSsrReveal,
} from "@/lib/play-feedback";
import {
  BLIND_BOX_OPENING_MS,
  BLIND_BOX_SHAKE_MAX_MS,
  BLIND_BOX_SHAKE_MIN_MS,
  minDelay,
} from "@/lib/play-timing";
import type { DropRarity } from "@/lib/play-rarity";
import { RARITY_META } from "@/lib/play-rarity";
import { cn } from "@/lib/utils";

export type BlindBoxPhase = "idle" | "shaking" | "opening" | "revealed";

export function BlindBoxStage({
  phase,
  onOpen,
  busy,
  openLabel,
  shakingLabel,
  openingLabel,
  surpriseLabel,
  revealedTopic,
  rarity = "N",
  idleHint,
  embedded = false,
}: {
  phase: BlindBoxPhase;
  onOpen: () => void;
  busy: boolean;
  openLabel: string;
  shakingLabel: string;
  openingLabel: string;
  surpriseLabel: string;
  revealedTopic?: string;
  rarity?: DropRarity;
  idleHint?: string;
  /** 嵌入统一卡片时去掉双层边框 */
  embedded?: boolean;
}) {
  const meta = RARITY_META[rarity];
  const isSsr = rarity === "SSR";
  const [pulse, setPulse] = useState(false);

  const handleOpen = useCallback(() => {
    if (phase !== "idle" || busy) return;
    setPulse(true);
    playOpenBox();
    hapticLight();
    window.setTimeout(() => setPulse(false), 300);
    onOpen();
  }, [phase, busy, onOpen]);

  const isAnimating = phase === "shaking" || phase === "opening";
  const showReveal = phase === "revealed" && revealedTopic;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] p-5",
        embedded
          ? "border-0 bg-transparent p-2 pt-3 shadow-none"
          : cn(
              "border border-orange-100/80",
              "bg-gradient-to-br from-[#FFF7F0] via-white to-[#FFF0F5]",
              "shadow-[0_10px_32px_rgba(255,122,174,0.12)]"
            )
      )}
    >
      <ConfettiBurst active={phase === "revealed"} />
      {isSsr && phase === "revealed" && (
        <div className="play-ssr-flash pointer-events-none absolute inset-0 rounded-[28px]" aria-hidden />
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 盲盒本体 */}
        <div
          className={cn(
            "relative mb-4",
            phase === "shaking" && "play-box-shake",
            pulse && "scale-95"
          )}
        >
          <div
            className={cn(
              "relative flex h-28 w-28 flex-col items-center justify-end rounded-[28px]",
              "bg-gradient-to-br shadow-[0_12px_28px_rgba(255,107,107,0.35)] ring-4 ring-white/80",
              meta.gradient,
              meta.extra,
              phase === "opening" && "play-box-glow",
              showReveal && "scale-105 transition-transform duration-500"
            )}
          >
            {/* 盒盖 */}
            <div
              className={cn(
                "absolute -top-3 left-1/2 flex h-8 w-[88%] -translate-x-1/2 items-center justify-center rounded-t-2xl",
                "bg-gradient-to-r from-[#FF8A8A] to-[#FF9EC4] shadow-md origin-bottom",
                phase === "opening" || showReveal ? "play-lid-open" : ""
              )}
            >
              <Sparkles size={14} className="text-white/90" />
            </div>
            <Gift
              size={40}
              className={cn(
                "mb-4 text-white drop-shadow",
                phase === "idle" && "play-gift-bounce"
              )}
            />
            {phase === "opening" && (
              <div className="play-light-burst absolute inset-0 rounded-[28px]" />
            )}
          </div>
          {phase === "idle" && (
            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC46B] text-xs font-black text-white shadow">
              ?
            </span>
          )}
        </div>

        {/* 状态文案 */}
        {phase === "idle" && (
          <>
            <p className="text-sm font-black text-slate-800">{openLabel}</p>
            {idleHint ? (
              <p className="mt-1 text-xs text-slate-500">{idleHint}</p>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={handleOpen}
              className={cn(
                "mt-4 w-full max-w-[240px] rounded-full py-3 text-sm font-black text-white shadow-lg",
                "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] active:scale-[0.98] disabled:opacity-60"
              )}
            >
              {openLabel}
            </button>
          </>
        )}

        {phase === "shaking" && (
          <p className="animate-pulse text-sm font-bold text-[#FF7AAE]">{shakingLabel}</p>
        )}

        {phase === "opening" && (
          <p className="text-sm font-bold text-[#FF7AAE]">{openingLabel}</p>
        )}

        {showReveal && (
          <div className="play-reveal-pop w-full">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black",
                meta.badgeClass
              )}
            >
              {meta.emoji} {meta.label}
            </span>
            <p className="mt-1.5 text-xs font-bold text-[#FF7AAE]">{surpriseLabel}</p>
            <div
              className={cn(
                "mt-2 rounded-2xl bg-gradient-to-r px-4 py-3 text-white shadow-md",
                meta.gradient,
                meta.extra
              )}
            >
              <div className="text-[10px] font-semibold text-white/80">今日盲盒选题</div>
              <div className="mt-1 text-lg font-black leading-snug">{revealedTopic}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 执行盲盒开箱动效 + 异步抽奖（摇动最多 2s，随后揭晓选题） */
export async function runBlindBoxReveal<T>(
  draw: () => Promise<T>,
  setPhase: (p: BlindBoxPhase) => void
): Promise<T> {
  setPhase("shaking");
  const drawPromise = draw();

  const raced = await Promise.race([
    drawPromise.then(async (value) => {
      await minDelay(BLIND_BOX_SHAKE_MIN_MS);
      return { kind: "done" as const, value };
    }),
    minDelay(BLIND_BOX_SHAKE_MAX_MS).then(() => ({ kind: "timeout" as const })),
  ]);

  let value: T;
  if (raced.kind === "done") {
    value = raced.value;
    setPhase("opening");
    playBlindBoxPop();
    await minDelay(BLIND_BOX_OPENING_MS);
  } else {
    // 已到 2s 上限：立刻揭晓，下方卡片可先出加载态
    setPhase("revealed");
    value = await drawPromise;
    return value;
  }

  setPhase("revealed");
  return value;
}

/** 揭晓后播放稀有度反馈 */
export function feedbackForRarity(rarity: DropRarity) {
  if (rarity === "SSR") {
    playSsrReveal();
    hapticSsr();
  } else if (rarity === "SR") {
    hapticSuccess();
  }
}
