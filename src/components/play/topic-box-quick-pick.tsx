"use client";

import { cn } from "@/lib/utils";

const QUICK_PLATFORMS = ["抖音", "小红书", "视频号", "快手"] as const;

export function TopicBoxQuickPick({
  platform,
  onPlatform,
}: {
  platform: string;
  onPlatform: (v: string) => void;
}) {
  return (
    <div className="mb-4 flex justify-center gap-2">
      {QUICK_PLATFORMS.map((p) => {
        const active = platform === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPlatform(p)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition active:scale-95",
              active
                ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-[0_4px_14px_rgba(255,107,107,0.35)]"
                : "bg-white text-slate-600 ring-1 ring-[#FFE8F0] hover:ring-[#FF7AAE]/40"
            )}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}
