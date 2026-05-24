"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HotTopicCover } from "@/components/hot-topics/hot-topic-cover";
import type { HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { cn } from "@/lib/utils";

export function SelectedHotTopicCard({
  topic,
  className,
}: {
  topic: HotTopicDisplay;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[20px] bg-white p-3 ring-1 ring-[#FFE8F0] shadow-sm",
        className
      )}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#FFE0EC]">
        <HotTopicCover item={topic} className="rounded-xl" iconSize={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="line-clamp-1 text-[13px] font-black text-[#1F2937]">{topic.title}</p>
          {topic.isNew ? (
            <span className="shrink-0 rounded bg-[#FF4F8B] px-1 py-0.5 text-[8px] font-black text-white">
              新
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[10px] font-bold text-[#FF4F8B]">
          热度 {topic.heatValue} · 爆款概率 {topic.viralScore}%
        </p>
      </div>
      <Link
        href="/hot-topics"
        className="flex shrink-0 items-center gap-0.5 text-[10px] font-black text-[#FF4F8B]"
      >
        更换热点
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}
