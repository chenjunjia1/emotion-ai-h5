"use client";

import { ChevronRight } from "lucide-react";
import { XHS_FEED_TABS, XHS_TAB_EMOJI, type XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { cn } from "@/lib/utils";

type Props = {
  tab: XhsFeedTab;
  onTabChange: (tab: XhsFeedTab) => void;
  /** 灵感页：单行胶囊 + 白卡片容器 */
  compact?: boolean;
};

function TabList({
  tab,
  onTabChange,
  compact,
}: {
  tab: XhsFeedTab;
  onTabChange: (tab: XhsFeedTab) => void;
  compact: boolean;
}) {
  return (
    <div className={cn("inspiration-tab-rail", compact ? "" : "-mx-0.5")}>
      <div
        className={cn(
          "inspiration-tab-scroll scrollbar-none overflow-x-auto overflow-y-hidden",
          "snap-x snap-mandatory scroll-smooth",
          compact ? "px-0.5 py-0.5" : "pb-0.5"
        )}
      >
        <div
          className={cn(
            "flex w-max items-center",
            compact ? "gap-2.5 pr-4" : "gap-1.5 pr-4"
          )}
          role="tablist"
          aria-label="灵感分类"
        >
          {XHS_FEED_TABS.map((t) => {
            const active = tab === t.id;
            const emoji = XHS_TAB_EMOJI[t.id];
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(t.id)}
                className={cn(
                  "inspiration-tab-pill flex shrink-0 snap-start flex-col items-center gap-0.5 rounded-[16px] font-bold transition-all active:scale-[0.96]",
                  compact ? "min-w-[72px] px-3 py-2.5" : "flex-row gap-1 rounded-full px-3 py-1.5 text-[10px]",
                  active
                    ? cn(
                        "inspiration-tab-pill-active text-white shadow-[0_6px_20px_rgba(255,79,139,0.32)]",
                        compact
                          ? "bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] ring-2 ring-white/40"
                          : "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] shadow-[0_4px_14px_rgba(255,79,139,0.28)]"
                      )
                    : compact
                      ? "bg-white text-[#374151] ring-1 ring-[#FFE8F0] shadow-[0_2px_10px_rgba(255,120,150,0.08)]"
                      : "bg-[#FFF0F5] text-[#6B7280] ring-1 ring-[#FFE8F0]"
                )}
              >
                {emoji ? (
                  <span
                    className={cn(
                      "leading-none",
                      compact ? "text-[20px]" : "text-[13px]"
                    )}
                    aria-hidden
                  >
                    {emoji}
                  </span>
                ) : null}
                <span className={cn(compact ? "text-[11px]" : "")}>{t.label}</span>
                {compact && t.hint ? (
                  <span
                    className={cn(
                      "text-[8px] font-semibold leading-none",
                      active ? "text-white/85" : "text-[#9CA3AF]"
                    )}
                  >
                    {t.hint}
                  </span>
                ) : null}
                {!compact && t.hint ? (
                  <span
                    className={cn(
                      "ml-0.5 hidden text-[8px] font-medium sm:inline",
                      active ? "text-white/80" : "text-[#B0B8C4]"
                    )}
                  >
                    · {t.hint}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 热点 / 灵感页 · 分类 Tab */
export function HotTopicsFeedToolbar({ tab, onTabChange, compact = false }: Props) {
  if (!compact) {
    return <TabList tab={tab} onTabChange={onTabChange} compact={false} />;
  }

  const activeMeta = XHS_FEED_TABS.find((t) => t.id === tab);

  return (
    <div className="inspiration-tab-panel overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_6px_24px_rgba(255,100,140,0.1)] ring-1 ring-[#FFE8F0]">
      <div className="mb-2.5 flex items-end justify-between gap-2">
        <div>
          <p className="text-[13px] font-black text-[#1F2937]">按场景逛灵感</p>
          {activeMeta?.hint ? (
            <p className="mt-0.5 text-[10px] font-medium text-[#9CA3AF]">
              当前：<span className="font-bold text-[#FF4F8B]">{activeMeta.hint}</span>
              ，点卡片一键改成你的文案
            </p>
          ) : null}
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-[#FF4F8B]">
          横滑
          <ChevronRight size={12} />
        </span>
      </div>
      <TabList tab={tab} onTabChange={onTabChange} compact />
    </div>
  );
}
