"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDailyReviewTitleItems } from "@/lib/review/presets";
import { normalizeHeat } from "@/lib/content/heat-level";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const HEAT_STYLE: Record<string, string> = {
  爆: "bg-rose-500 text-white",
  高: "bg-orange-400 text-white",
  中: "bg-slate-300 text-slate-600",
};

export function ReviewTitleIdeas({ onPick }: { onPick: (title: string, track?: string) => void }) {
  const [batch, setBatch] = useState(0);
  const items = useMemo(
    () => getDailyReviewTitleItems(todayKey(), batch, 6),
    [batch]
  );

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[12px] font-black text-[#1F2937]">不知道填什么标题？</p>
          <p className="text-[10px] text-[#8A94A6]">点选示例，自动填入下方</p>
        </div>
        <button
          type="button"
          onClick={() => setBatch((b) => b + 1)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-black text-[#FF9A4D] ring-1 ring-[#FFE0C8]"
        >
          <RefreshCw size={10} />
          换一批
        </button>
      </div>

      <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-0.5 pl-0.5 scrollbar-none">
        {items.map((item) => {
          const heat = normalizeHeat(item.heat);
          return (
            <button
              key={`${batch}-${item.title}`}
              type="button"
              onClick={() => onPick(item.title, item.suggestTrack)}
              className="shrink-0 max-w-[160px] rounded-xl bg-white px-2.5 py-2 text-left ring-1 ring-[#FFE8F0] active:scale-[0.98]"
            >
              <span
                className={cn(
                  "inline-block rounded px-1 py-0.5 text-[8px] font-black",
                  HEAT_STYLE[heat] ?? HEAT_STYLE["中"]
                )}
              >
                {heat}
              </span>
              <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-snug text-[#1F2937]">
                {item.title}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
