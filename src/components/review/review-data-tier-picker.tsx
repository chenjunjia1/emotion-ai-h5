"use client";

import { cn } from "@/lib/utils";
import { REVIEW_DATA_TIERS } from "@/lib/review/presets";

export function ReviewDataTierPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (tierId: string, metrics: Record<string, string>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {REVIEW_DATA_TIERS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() =>
              onChange(t.id, {
                views: String(t.views),
                likes: String(t.likes),
                comments: String(Math.round(t.likes * 0.28)),
                saves: String(Math.round(t.likes * 0.6)),
                shares: String(Math.round(t.likes * 0.1)),
                completionRate: t.id === "viral" ? "52" : t.id === "great" ? "45" : "38",
              })
            }
            className={cn(
              "rounded-2xl px-2 py-2.5 text-left transition active:scale-[0.98]",
              active
                ? "bg-[#FFF0F5] ring-2 ring-[#FF4F8B]/40"
                : "bg-white ring-1 ring-[#FFE8F0]"
            )}
          >
            <span className="text-lg">{t.emoji}</span>
            <p className="mt-0.5 text-[11px] font-black text-[#1F2937]">{t.label}</p>
            <p className="text-[9px] font-bold text-[#FF9A4D]">{t.views.toLocaleString()}+ 播放</p>
            <p className="mt-0.5 line-clamp-1 text-[8px] text-[#8A94A6]">{t.hint}</p>
          </button>
        );
      })}
    </div>
  );
}
