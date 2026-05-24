"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  buildPublishPackHref,
  pickRandomSuggestTags,
  type AiSuggestTag,
} from "@/lib/content/home-feed-mock";
import { cn } from "@/lib/utils";

export function HomeAiSuggest() {
  const { tr } = useApp();
  const [tags, setTags] = useState<AiSuggestTag[]>(() => pickRandomSuggestTags(4));
  const [spinning, setSpinning] = useState(false);

  const shuffle = useCallback(() => {
    setSpinning(true);
    setTags(pickRandomSuggestTags(4));
    window.setTimeout(() => setSpinning(false), 400);
  }, []);

  return (
    <section className="home-section-enter overflow-hidden rounded-[22px] border border-[#FFE0C8]/80 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={15} className="text-[#FF9A4D]" />
          <h2 className="text-[14px] font-black text-[#1F2937]">{tr("homeAiSuggestTitle")}</h2>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF8F0] px-2 py-1 text-[10px] font-black text-[#FF9A4D] ring-1 ring-[#FFE0C8] active:scale-95"
        >
          <RefreshCw size={11} className={spinning ? "animate-spin" : ""} />
          {tr("homeAiSuggestShuffle")}
        </button>
      </div>

      <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-0.5 pl-0.5 scrollbar-none">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={buildPublishPackHref({
              topic: tag.topic,
              accountType: tag.accountType,
              style: tag.style,
              from: "home_ai_suggest",
            })}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br px-3 py-2 ring-1 active:scale-[0.98]",
              tag.chipClass
            )}
          >
            <span className="text-sm">{tag.emoji}</span>
            <span className="whitespace-nowrap text-[11px] font-black">{tag.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
