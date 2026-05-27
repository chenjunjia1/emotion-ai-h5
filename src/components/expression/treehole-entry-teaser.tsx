"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CreateHubEntry } from "@/lib/mock/expression-assistant";
import {
  TREEHOLE_ENTRY_LIVE_SNIPPETS,
  TREEHOLE_HOME_COPY,
} from "@/lib/mock/emotion-treehole";
import { useTreeholeOnlineLabel } from "@/lib/hooks/use-treehole-online-count";
import { cn } from "@/lib/utils";

/** 底部 · 单行实时动态 */
function TreeholeLiveStrip() {
  const [index, setIndex] = useState(0);
  const items = TREEHOLE_ENTRY_LIVE_SNIPPETS;
  const current = items[index % items.length]!;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <div
      key={current.id}
      className="home-treehole-whisper home-treehole-whisper--primary flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 ring-1 ring-white/12"
    >
      <span className="shrink-0 text-[14px] leading-none">{current.avatar}</span>
      <p className="min-w-0 flex-1 text-[11px] leading-snug text-white/90">
        <span className="text-white/45">刚刚 · </span>
        {current.text}
      </p>
      <span className="shrink-0 text-[10px] text-white/40">{current.time}</span>
    </div>
  );
}

/** 创作 / 首页 · 树洞入口 */
export function TreeholeEntryTeaser({
  entry,
  highlighted,
  compact = true,
}: {
  entry: CreateHubEntry;
  highlighted?: boolean;
  compact?: boolean;
}) {
  const onlineLabel = useTreeholeOnlineLabel();

  return (
    <Link
      href={entry.href}
      className={cn(
        "home-treehole-teaser group relative block overflow-hidden ring-1 active:scale-[0.99]",
        compact
          ? "home-treehole-teaser--compact rounded-2xl"
          : "home-treehole-teaser--hero rounded-[28px]",
        highlighted ? "ring-2 ring-violet-400/55" : "ring-violet-950/40"
      )}
    >
      <div className="home-treehole-teaser-bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="home-treehole-teaser-stars pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      />

      <div className={cn("relative z-10", compact ? "p-3" : "p-4")}>
        <div className="flex items-start gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[22px] ring-1 ring-white/15">
            {entry.emoji || "🌙"}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-violet-400/25 px-2 py-0.5 text-[9px] font-semibold text-violet-100">
                深夜树洞
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-medium tabular-nums text-emerald-200/90">
                <span className="home-live-dot h-1.5 w-1.5 rounded-full bg-[#34D399]" aria-hidden />
                {onlineLabel}
              </span>
            </div>
            <p className="mt-1 text-[16px] font-semibold leading-tight text-white">{entry.title}</p>
            <p className="mt-1 text-[11px] leading-[1.5] text-white/70">
              {TREEHOLE_HOME_COPY.title}
            </p>
          </div>

          <span className="home-treehole-entry-btn mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white px-2.5 py-2 text-[11px] font-semibold text-[#5B4FCF] shadow-sm">
            {entry.cta ?? "去聊聊"}
            <ArrowRight size={13} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-2.5">
          <TreeholeLiveStrip />
        </div>
      </div>
    </Link>
  );
}
