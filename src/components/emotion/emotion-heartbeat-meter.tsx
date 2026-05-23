"use client";

import { cn } from "@/lib/utils";

export function EmotionHeartbeatMeter({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const tier =
    v >= 80 ? "from-rose-500 via-pink-500 to-orange-400" : v >= 60 ? "from-pink-400 to-rose-400" : v >= 40 ? "from-amber-300 to-orange-300" : "from-slate-300 to-slate-400";

  return (
    <div className="w-full">
      <div className="mb-1 flex items-end justify-between">
        <span className="text-[10px] font-bold text-white/85">心动指数</span>
        <span className="text-2xl font-black leading-none text-white">{v}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/25">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", tier)}
          style={{ width: `${v}%` }}
        />
      </div>
      {label ? (
        <p className="mt-1 text-right text-[10px] font-black text-white/90">{label}</p>
      ) : null}
    </div>
  );
}
