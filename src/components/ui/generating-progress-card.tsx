"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useStagedProgress } from "@/hooks/use-staged-progress";
import { cn } from "@/lib/utils";

const DEFAULT_STAGES = [
  "正在理解你的选题…",
  "匹配平台语气与结构…",
  "撰写标题与正文…",
  "快好了，马上出稿 ✨",
] as const;

export function GeneratingProgressCard({
  title = "AI 正在生成",
  subtitle,
  stages = DEFAULT_STAGES,
  className,
}: {
  title?: string;
  subtitle?: string;
  stages?: readonly string[];
  className?: string;
}) {
  const stage = useStagedProgress(true, stages);

  return (
    <div
      className={cn(
        "rounded-[20px] bg-white p-4 ring-1 ring-[#FFE8F0] shadow-[0_6px_20px_rgba(255,120,150,0.1)]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0F5]">
          <Loader2 size={24} className="animate-spin text-[#FF4F8B]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[14px] font-black text-[#1F2937]">
            <Sparkles size={14} className="text-[#FF4F8B]" />
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-[#8A94A6]">{subtitle}</p>
          ) : null}
          <p className="mt-1.5 text-[11px] font-bold text-[#FF4F8B]">{stage}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {[0.92, 0.78, 0.55].map((w, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-gradient-to-r from-[#FFE8F0] to-[#FFF0F5]"
            style={{ width: `${w * 100}%`, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
