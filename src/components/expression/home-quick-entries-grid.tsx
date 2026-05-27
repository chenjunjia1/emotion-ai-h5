"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOME_QUICK_ENTRIES } from "@/lib/mock/home-quick-entries";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "compact" | "play";
  className?: string;
};

export function HomeQuickEntriesGrid({ variant = "default", className }: Props) {
  const compact = variant === "compact";
  const play = variant === "play";

  if (play) {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)}>
        {HOME_QUICK_ENTRIES.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            style={{ animationDelay: `${0.04 + index * 0.05}s` }}
            className={cn(
              "home-play-tile home-tool-card group relative flex items-center gap-2 overflow-hidden rounded-[16px] bg-white p-2.5 active:scale-[0.98]",
              item.hot
                ? "shadow-[0_8px_24px_rgba(255,79,139,0.16)] ring-2 ring-[#FF4F8B]/20"
                : "shadow-[0_4px_16px_rgba(15,23,42,0.06)] ring-1 ring-[#F3F4F6]"
            )}
          >
            <span
              className={cn(
                "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r",
                item.accentBar ?? "from-[#FF4F8B] to-[#FF9A4D]"
              )}
              aria-hidden
            />
            <div className="relative shrink-0">
              <span
                className={cn(
                  "absolute inset-0 scale-110 rounded-[12px] blur-md opacity-60",
                  item.iconGlow ?? "bg-pink-300/30"
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-[12px] text-[20px] text-white shadow-md ring-2 ring-white",
                  item.iconShell ?? "bg-gradient-to-br from-[#FF7AAE] to-[#FF9A4D]"
                )}
              >
                {item.emoji}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[13px] font-black text-[#111827]">{item.label}</p>
                {item.hot ? (
                  <span className="shrink-0 rounded bg-[#FF4F8B] px-1 py-px text-[7px] font-black text-white">
                    热
                  </span>
                ) : null}
              </div>
              <p className={cn("truncate text-[10px] font-medium", item.subClass ?? "text-[#9CA3AF]")}>
                {item.sub}
              </p>
            </div>
            <ChevronRight
              size={16}
              className="shrink-0 text-[#D1D5DB] transition group-active:translate-x-0.5 group-active:text-[#FF4F8B]"
            />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2",
        compact && "h-full min-h-[172px] gap-1.5 content-stretch",
        className
      )}
    >
      {HOME_QUICK_ENTRIES.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex min-w-0 bg-white ring-1 active:scale-[0.98]",
            compact
              ? "flex-col items-center justify-center gap-0.5 rounded-[12px] p-1.5"
              : "items-center gap-2.5 rounded-[14px] p-2.5",
            item.hot
              ? "ring-[#FF4F8B]/35 shadow-[0_4px_16px_rgba(255,79,139,0.1)]"
              : "ring-[#FFE8F0]"
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-[10px]",
              item.tint,
              compact ? "h-8 w-8 text-base" : "h-10 w-10 rounded-[12px] text-xl"
            )}
          >
            {item.emoji}
          </span>
          <span className={cn("min-w-0 text-center", !compact && "flex-1 text-left")}>
            <span className="flex items-center justify-center gap-0.5">
              <span
                className={cn(
                  "font-black text-[#1F2937]",
                  compact ? "text-[10px] leading-tight" : "text-[12px]"
                )}
              >
                {item.label}
              </span>
              {item.hot ? (
                <span className="rounded bg-[#FF4F8B] px-0.5 py-px text-[7px] font-bold text-white">
                  热
                </span>
              ) : null}
            </span>
            {!compact ? (
              <span className="mt-0.5 block truncate text-[10px] text-[#9CA3AF]">{item.sub}</span>
            ) : null}
          </span>
        </Link>
      ))}
    </div>
  );
}
