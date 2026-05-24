"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
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
  const [tags, setTags] = useState<AiSuggestTag[]>(() => pickRandomSuggestTags(6));
  const [spinning, setSpinning] = useState(false);

  const shuffle = useCallback(() => {
    setSpinning(true);
    setTags(pickRandomSuggestTags(6));
    window.setTimeout(() => setSpinning(false), 400);
  }, []);

  const hint = useMemo(
    () => ["今天适合发轻松向", "今天适合发共鸣向", "今天适合发种草向"][Math.floor(Math.random() * 3)],
    [tags]
  );

  return (
    <section className="home-section-enter overflow-hidden rounded-[26px] border border-[#FFE0C8]/80 bg-gradient-to-br from-[#FFFBF7] via-white to-[#FFF4F7] p-3.5 shadow-[0_8px_28px_rgba(255,154,77,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#FF9A4D]" />
            <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeAiSuggestTitle")}</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-[#8A94A6]">{tr("homeAiSuggestSub")}</p>
          <p className="mt-1 text-[10px] font-bold text-[#FF9A4D]">✦ {hint}</p>
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black text-[#FF9A4D] shadow-sm ring-1 ring-[#FFE0C8] active:scale-95"
        >
          <RefreshCw size={11} className={spinning ? "animate-spin" : ""} />
          {tr("homeAiSuggestShuffle")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
              "flex items-center gap-2 rounded-[16px] bg-gradient-to-br px-3 py-2.5 ring-1 active:scale-[0.98]",
              tag.chipClass
            )}
          >
            <span className="text-base">{tag.emoji}</span>
            <span className="text-[11px] font-black leading-tight">{tag.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
