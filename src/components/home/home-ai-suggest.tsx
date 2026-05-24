"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { AI_SUGGEST_ALT, AI_SUGGEST_TAGS } from "@/lib/content/home-feed-mock";
import { cn } from "@/lib/utils";

export function HomeAiSuggest() {
  const { tr } = useApp();
  const [alt, setAlt] = useState(false);
  const tags = alt ? AI_SUGGEST_ALT : AI_SUGGEST_TAGS;

  const shuffle = useCallback(() => setAlt((v) => !v), []);

  return (
    <section className="home-section-enter">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-[#FF9A4D]" />
            <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeAiSuggestTitle")}</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-[#8A94A6]">{tr("homeAiSuggestSub")}</p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF3E8] px-2.5 py-1 text-[10px] font-bold text-[#FF9A4D] active:scale-95"
        >
          <RefreshCw size={11} />
          {tr("homeAiSuggestShuffle")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/publish-pack?topic=${encodeURIComponent(tag.topic)}&track=${encodeURIComponent(tag.label)}`}
            className={cn(
              "rounded-full border border-[#FFE0EC] bg-white px-3.5 py-2 text-[11px] font-bold text-[#1F2937]",
              "shadow-sm transition active:scale-95 hover:border-[#FF4F8B]/40 hover:text-[#FF4F8B]"
            )}
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
