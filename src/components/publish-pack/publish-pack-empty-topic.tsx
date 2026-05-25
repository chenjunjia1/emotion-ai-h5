"use client";

import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import type { HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";

export function PublishPackEmptyTopic() {
  return (
    <div className="rounded-[20px] border border-dashed border-[#FFD0E8] bg-white/90 p-4 text-center">
      <p className="text-[13px] font-black text-[#1F2937]">还没选选题？</p>
      <p className="mt-1 text-[10px] text-[#8A94A6]">从今日热点挑一条，AI 帮你写得更准</p>
      <Link
        href="/hot-topics"
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-2 text-[11px] font-black text-white"
      >
        <Flame size={12} />
        去选今日热点
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

export function PublishPackTopicFallback({ topic }: { topic: HotTopicDisplay }) {
  return (
    <div className="rounded-[18px] bg-[#FFF0F5] px-3 py-2 ring-1 ring-[#FFD0E8]">
      <p className="text-[10px] font-bold text-[#FF4F8B]">当前选题</p>
      <p className="text-[12px] font-black text-[#1F2937]">{topic.title}</p>
    </div>
  );
}
