"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ReviewScoreMeter({
  score,
  label,
  title,
}: {
  score: number;
  label: string;
  title: string;
}) {
  const v = Math.max(0, Math.min(100, score));
  const [pulse, setPulse] = useState(false);
  const tier =
    v >= 80
      ? "from-emerald-400 via-teal-400 to-cyan-400"
      : v >= 60
        ? "from-[#FF9A6B] via-[#FF7AAE] to-[#FFC46B]"
        : "from-slate-400 to-slate-500";

  useEffect(() => {
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(t);
  }, [v]);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-white/85">本条表现评分</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white/95">{title}</p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-4xl font-black leading-none transition-transform duration-500",
              pulse && "scale-110"
            )}
          >
            {v}
          </p>
          <p className="text-[10px] font-black text-white/90">{label}</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
            tier,
            pulse && "shadow-[0_0_12px_rgba(255,255,255,0.45)]"
          )}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
