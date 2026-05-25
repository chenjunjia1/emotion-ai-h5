"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { XHS_FEED_TABS } from "@/lib/xhs/xhs-page-tabs";
import { XHS_TAB_EMOJI } from "@/lib/xhs/xhs-tab-ui";
import { cn } from "@/lib/utils";

const SHORTCUT_TABS = XHS_FEED_TABS.filter((t) => t.id !== "hot");

/** 首页场景快捷入口 — 直达今日热点各 Tab */
export function HomeXhsShortcuts() {
  const { tr } = useApp();

  return (
    <section className="home-section-enter overflow-hidden rounded-[22px] border border-[#FFD0E8]/70 bg-white p-3 shadow-[0_6px_24px_rgba(255,79,139,0.07)]">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[14px] font-black text-[#1F2937]">{tr("homeXhsShortcutsTitle")}</h2>
          <p className="mt-0.5 text-[10px] text-[#8A94A6]">{tr("homeXhsShortcutsSub")}</p>
        </div>
        <Link
          href="/hot-topics"
          className="flex shrink-0 items-center gap-0.5 text-[10px] font-black text-[#FF4F8B]"
        >
          {tr("homeMore")}
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-0.5 pl-0.5 scrollbar-none">
        {SHORTCUT_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/hot-topics?tab=${tab.id}`}
            className={cn(
              "flex w-[88px] shrink-0 flex-col items-center rounded-[16px] bg-[#FFFBFC] px-2 py-2.5",
              "ring-1 ring-[#FFE8F0] active:scale-[0.97]"
            )}
          >
            <span className="text-[22px] leading-none">{XHS_TAB_EMOJI[tab.id] ?? "✨"}</span>
            <span className="mt-1.5 line-clamp-1 w-full text-center text-[10px] font-black text-[#1F2937]">
              {tab.label}
            </span>
            {tab.hint ? (
              <span className="mt-0.5 line-clamp-1 w-full text-center text-[8px] font-bold text-[#9CA3AF]">
                {tab.hint}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
