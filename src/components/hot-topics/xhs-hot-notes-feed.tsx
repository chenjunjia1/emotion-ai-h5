"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HotTopicsFeedToolbar } from "@/components/hot-topics/hot-topics-feed-toolbar";
import { XhsInspirationNoteCard } from "@/components/hot-topics/xhs-inspiration-note-card";
import { useAppUi } from "@/contexts/app-ui-context";
import { type XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { filterXhsNotesByTab } from "@/lib/xhs/xhs-client-api";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import type { XhsHotNote } from "@/lib/xhs/types";
import { cn } from "@/lib/utils";

export function XhsHotNotesFeed({
  notes,
  tab,
  onTabChange,
  onRetry,
  loading,
  error,
  toolbarCompact = false,
}: {
  notes: XhsHotNote[];
  tab: XhsFeedTab;
  onTabChange: (tab: XhsFeedTab) => void;
  onRetry?: () => void;
  loading: boolean;
  error: string | null;
  toolbarCompact?: boolean;
}) {
  const { user, openQuotaModal, tr } = useAppUi();
  const viewLimit = user ? FEATURE_LIMITS[user.plan].hotTopicView : 5;

  const filtered = useMemo(() => filterXhsNotesByTab(notes, tab), [notes, tab]);

  return (
    <section className="inspiration-feed-panel space-y-2.5">
      <div
        className={cn(
          toolbarCompact && "sticky top-0 z-10 -mx-0.5 pb-2 pt-0.5"
        )}
      >
        <HotTopicsFeedToolbar tab={tab} onTabChange={onTabChange} compact={toolbarCompact} />
      </div>

      {loading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="inspiration-skeleton h-[112px] rounded-[18px] ring-1 ring-[#FFE8F0]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
          <p className="text-center text-[11px] text-[#9CA3AF]">正在拉取小红书热门图文…</p>
        </div>
      ) : null}

      {error && !loading ? (
        <div className="rounded-[16px] border border-dashed border-[#FFD0E8] bg-white/90 px-4 py-8 text-center">
          <p className="text-[13px] font-black text-[#1F2937]">{error}</p>
          <p className="mt-1 text-[10px] text-[#8A94A6]">
            {error.includes("TIKHUB")
              ? "服务端未配置 TikHub 密钥，请联系管理员或在 Vercel 添加 TIKHUB_API_KEY 后重新部署"
              : "请稍后重试，或检查网络连接"}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-2 text-[11px] font-black text-white"
            >
              重试
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <div className="rounded-[16px] bg-white px-4 py-8 text-center ring-1 ring-[#FFE8F0]">
          <p className="text-[13px] font-black text-[#1F2937]">
            {tab === "life"
              ? "暂无生活感灵感"
              : tab === "weekend"
                ? "暂无周末碎片灵感"
                : tab === "moments"
                  ? "暂无适合朋友圈的灵感"
                  : tab === "work"
                    ? "暂无打工人灵感"
                    : "暂无该分类灵感"}
          </p>
          <p className="mt-1 text-[10px] text-[#8A94A6]">
            {tab === "life"
              ? "可先逛「今日爆款」或其他 Tab"
              : tab === "weekend"
                ? "周末内容更新中，可先逛「好吃好拍」"
                : tab === "moments"
                  ? "可先逛其他 Tab"
                  : tab === "work"
                    ? "可先逛「生活感」"
                    : "换个 Tab 试试"}
          </p>
        </div>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <ul key={tab} className="inspiration-feed-list space-y-2.5">
          {filtered.map((note, index) => {
            const locked = user?.plan === "free" && index >= viewLimit;
            const showProBanner = user?.plan === "free" && index === viewLimit;

            if (showProBanner) {
              return (
                <li key="xhs-pro-banner">
                  <div className="rounded-[16px] border border-[#FFD0E8] bg-gradient-to-r from-[#FFF4F7] to-[#FFF8F0] px-4 py-3.5 text-center">
                    <p className="text-[12px] font-black text-[#1F2937]">{tr("homeHotFreeLimit")}</p>
                    <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                      <Link
                        href="/invite"
                        className="rounded-full bg-white px-4 py-1.5 text-[11px] font-black text-[#FF4F8B] ring-1 ring-[#FFD0E8]"
                      >
                        {tr("hotTopicsUnlockInvite")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => openQuotaModal()}
                        className="rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-1.5 text-[11px] font-black text-white"
                      >
                        {tr("hotTopicsUnlockPro")}
                      </button>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={note.noteId}
                className="inspiration-feed-item cv-auto"
                style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
              >
                <XhsInspirationNoteCard
                  note={note}
                  index={index}
                  tab={tab}
                  locked={locked}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
