"use client";

import { XHS_FEED_TABS, XHS_TAB_EMOJI, type XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { cn } from "@/lib/utils";

/** 热点页 Tab 栏 */
export function HotTopicsFeedToolbar({
  tab,
  onTabChange,
}: {
  tab: XhsFeedTab;
  onTabChange: (tab: XhsFeedTab) => void;
}) {
  return (
    <div className="overflow-x-auto pb-0.5 scrollbar-none">
      <div className="flex gap-1.5">
        {XHS_FEED_TABS.map((t) => {
          const active = tab === t.id;
          const emoji = XHS_TAB_EMOJI[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition active:scale-95",
                active
                  ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md"
                  : "bg-white text-[#6B7280] ring-1 ring-[#F3F4F6]"
              )}
            >
              <span>
                {emoji ? `${emoji} ` : ""}
                {t.label}
              </span>
              {t.hint ? (
                <span
                  className={cn(
                    "mt-0.5 block text-[8px] font-medium leading-tight",
                    active ? "text-white/85" : "text-[#B0B8C4]"
                  )}
                >
                  {t.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
