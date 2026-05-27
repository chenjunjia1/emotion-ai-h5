"use client";

import { HOME_QUICK_PROMPTS } from "@/lib/mock/expression-assistant";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (text: string) => void;
  className?: string;
  /** 叠在渐变 Hero 上时用透明边渐变 */
  variant?: "default" | "on-gradient";
};

export function HomePromptMarquee({ onSelect, className, variant = "default" }: Props) {
  const loop = [...HOME_QUICK_PROMPTS, ...HOME_QUICK_PROMPTS];
  const fadeFrom =
    variant === "on-gradient"
      ? "from-[#FF6B8A]/95"
      : "from-[#FFF8FC]";

  return (
    <div className={cn("home-prompt-marquee relative", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r to-transparent",
          fadeFrom
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l to-transparent",
          variant === "on-gradient" ? "from-[#FF6B8A]/95" : "from-[#FFF8FC]"
        )}
        aria-hidden
      />

      <div className="overflow-hidden">
        <div className="home-prompt-marquee-track flex w-max gap-2 py-0.5">
          {loop.map((p, i) => (
            <button
              key={`${p.label}-${i}`}
              type="button"
              onClick={() => onSelect(p.prompt)}
              className={cn(
                "home-prompt-chip shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm active:scale-95",
                variant === "on-gradient"
                  ? "bg-white/25 font-bold text-white ring-1 ring-white/35 backdrop-blur-sm"
                  : cn("bg-gradient-to-r ring-1 ring-white/80", p.color)
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
