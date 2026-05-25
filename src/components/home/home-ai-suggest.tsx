"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  HOME_AI_SUGGEST_TAGS,
  buildPublishPackHref,
  pickRandomSuggestTags,
  type AiSuggestTag,
} from "@/lib/content/home-feed-mock";
import { cn } from "@/lib/utils";

export function HomeAiSuggest() {
  const { tr } = useApp();
  const [tags, setTags] = useState<AiSuggestTag[]>(() => [...HOME_AI_SUGGEST_TAGS.slice(0, 6)]);
  const [spinning, setSpinning] = useState(false);

  const shuffle = useCallback(() => {
    setSpinning(true);
    setTags(pickRandomSuggestTags(6));
    window.setTimeout(() => setSpinning(false), 400);
  }, []);

  return (
    <section className="home-section-enter overflow-hidden rounded-[22px] border border-[#FFD0E8]/70 bg-white p-3 shadow-[0_6px_24px_rgba(255,79,139,0.07)]">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#FF9A4D]" />
            <h2 className="text-[14px] font-black text-[#1F2937]">{tr("homeAiSuggestTitle")}</h2>
          </p>
          <p className="mt-0.5 pl-5 text-[10px] text-[#9CA3AF]">{tr("homeAiSuggestSub")}</p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="flex shrink-0 items-center gap-1 rounded-full bg-[#FFF0F5] px-2 py-1 text-[10px] font-bold text-[#FF4F8B] active:scale-95"
        >
          <RefreshCw size={11} className={spinning ? "animate-spin" : ""} />
          {tr("homeAiSuggestShuffle")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
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
              "group flex items-center gap-2 rounded-[14px] bg-gradient-to-br px-2.5 py-2.5 ring-1 active:scale-[0.98]",
              tag.chipClass || "from-[#FFF8FB] to-[#FFF0F5] text-[#FF4F8B] ring-[#FFE8F0]"
            )}
          >
            <span className="text-[20px] leading-none">{tag.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-black">{tag.label}</span>
              <span className="mt-0.5 flex items-center gap-0.5 text-[9px] font-bold opacity-70">
                一键开写
                <ChevronRight size={10} />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
