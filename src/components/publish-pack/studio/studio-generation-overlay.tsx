"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { GENERATION_STEP_LABELS } from "@/lib/publish-pack/studio-config";
import { cn } from "@/lib/utils";

export function StudioGenerationOverlay({
  active,
  onDone,
}: {
  active: boolean;
  onDone?: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    setStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    GENERATION_STEP_LABELS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setStep(i);
          if (i === GENERATION_STEP_LABELS.length - 1) {
            onDone?.();
          }
        }, i * 700)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF7F0]/90 px-6 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-[#FFE8F0]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white">
            <Sparkles size={20} className="animate-pulse" />
          </span>
          <div>
            <p className="text-[14px] font-black text-[#1F2937]">AI 正在陪你做内容</p>
            <p className="text-[10px] text-[#8A94A6]">稍等，马上就好 ✨</p>
          </div>
        </div>
        <ul className="space-y-2">
          {GENERATION_STEP_LABELS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold transition-all duration-300",
                i <= step
                  ? "bg-[#FFF0F5] text-[#FF4F8B]"
                  : "text-[#B0B8C4]"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[9px]",
                  i < step
                    ? "bg-[#FF4F8B] text-white"
                    : i === step
                      ? "bg-[#FF4F8B]/20 text-[#FF4F8B] animate-pulse"
                      : "bg-[#F3F4F6] text-[#9CA3AF]"
                )}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
