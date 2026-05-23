"use client";

import { Crown, Gem, Sparkles } from "lucide-react";
import type { PlanType } from "@/lib/types/v1";
import { cn } from "@/lib/utils";

/** 三档会员差异化皇冠视觉 */
export function PlanTierIcon({
  plan,
  className,
}: {
  plan: Exclude<PlanType, "free">;
  className?: string;
}) {
  if (plan === "pro") {
    return (
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE8A8] via-[#FFC46B] to-[#FF9A5C] shadow-[0_6px_18px_rgba(255,196,107,0.45)] ring-2 ring-white/70",
          className
        )}
      >
        <Crown size={28} className="text-[#FF5C2A]" strokeWidth={2} fill="#FFF5E0" />
      </div>
    );
  }

  if (plan === "premium") {
    return (
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8D4FF] via-[#FF9EC8] to-[#FFC46B] shadow-[0_6px_18px_rgba(255,122,174,0.35)] ring-2 ring-white/70",
          className
        )}
      >
        <Crown
          size={26}
          className="relative z-10 text-[#9B4DFF]"
          strokeWidth={2}
          fill="#F3E8FF"
        />
        <Gem
          size={14}
          className="absolute -right-0.5 -top-0.5 z-20 text-[#FF6B8A] drop-shadow"
          strokeWidth={2.5}
          fill="#FFE8F0"
        />
        <span className="absolute -bottom-0.5 -left-0.5 text-[10px]">✨</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5B4FCF] via-[#9B4DFF] to-[#FFC46B] shadow-[0_8px_22px_rgba(91,79,207,0.4)] ring-2 ring-[#FFE8A8]/60",
        className
      )}
    >
      <Crown
        size={30}
        className="relative z-10 text-white"
        strokeWidth={2}
        fill="#FFEDD5"
      />
      <Sparkles
        size={12}
        className="banner-twinkle absolute -right-0.5 top-1 text-[#FFE8A8]"
      />
      <Sparkles
        size={10}
        className="banner-twinkle absolute bottom-1 left-0 text-white/90"
        style={{ animationDelay: "0.6s" }}
      />
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-1 text-[7px] font-black text-[#5B4FCF]">
        MAX
      </span>
    </div>
  );
}
