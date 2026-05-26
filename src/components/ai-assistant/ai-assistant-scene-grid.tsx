"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import type { BuddyQuickPrompt } from "@/lib/operation-chat/buddy-prompts";
import { cn } from "@/lib/utils";

export function AiAssistantSceneGrid({
  prompts,
  busy,
  activePromptId,
  hasResult,
  onPick,
}: {
  prompts: BuddyQuickPrompt[];
  busy: boolean;
  activePromptId: string | null;
  hasResult: boolean;
  onPick: (id: string, prompt: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {prompts.map((q) => {
        const loading = activePromptId === q.id && busy;
        const done = activePromptId === q.id && !busy && hasResult;

        return (
          <button
            key={q.id}
            type="button"
            disabled={busy && !loading}
            onClick={() => onPick(q.id, q.prompt)}
            className={cn(
              "relative flex min-h-[108px] flex-col rounded-[18px] bg-gradient-to-br p-3 text-left shadow-sm transition active:scale-[0.97]",
              q.tint,
              done ? "ring-2 ring-[#FF4F8B]" : "ring-1 ring-[#FFE8F0]",
              busy && !loading && "opacity-50"
            )}
          >
            {q.hot ? (
              <span className="absolute right-2 top-2 rounded-md bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-1.5 py-0.5 text-[7px] font-black text-white">
                HOT
              </span>
            ) : null}
            {loading ? (
              <Loader2
                size={14}
                className="absolute right-2 top-2 animate-spin text-[#FF4F8B]"
              />
            ) : null}
            <span className="text-[24px] leading-none">{q.emoji}</span>
            <span className="mt-1.5 text-[12px] font-black leading-tight text-[#1F2937]">
              {q.label}
            </span>
            <span className="mt-0.5 line-clamp-2 flex-1 text-[9px] leading-snug text-[#8A94A6]">
              {q.desc}
            </span>
            <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-black text-[#FF4F8B]">
              点我问
              <ChevronRight size={11} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
