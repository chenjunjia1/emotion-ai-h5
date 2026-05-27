"use client";

import { cn } from "@/lib/utils";

type Props = {
  night: boolean;
  onToggle: () => void;
};

/** 情绪树洞 · 日间 / 深夜模式趣味开关 */
export function TreeholeNightToggle({ night, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={night}
      aria-label={night ? "切换为日间奶油模式" : "切换为深夜陪伴模式"}
      className={cn(
        "treehole-theme-toggle group relative flex h-9 items-center gap-1 overflow-hidden rounded-full pl-1 pr-2.5 shadow-md transition active:scale-95",
        night
          ? "bg-gradient-to-r from-[#312e81] to-[#4c1d95] ring-1 ring-violet-400/40"
          : "bg-gradient-to-r from-[#FFF0F5] to-[#FFE8D6] ring-1 ring-[#FFE8F0]"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-base transition-transform duration-500",
          night ? "translate-x-0 bg-violet-500/30" : "translate-x-0 bg-white shadow-sm"
        )}
      >
        <span
          className={cn(
            "absolute transition-all duration-500",
            night ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"
          )}
        >
          🌙
        </span>
        <span
          className={cn(
            "absolute transition-all duration-500",
            !night ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0"
          )}
        >
          ✨
        </span>
      </span>
      <span
        className={cn(
          "text-[9px] font-black leading-none",
          night ? "text-violet-100" : "text-[#FF4F8B]"
        )}
      >
        {night ? "深夜中" : "变深夜"}
      </span>
      {night ? (
        <span className="treehole-toggle-sparkle pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
    </button>
  );
}
