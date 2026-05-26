"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  Heart,
  MessageCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { enrichHotTopics, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { HotTopicPexelsCover } from "@/components/hot-topics/hot-topic-pexels-cover";
import { useHotTopicPexelsCovers } from "@/components/hot-topics/use-hot-topic-pexels-covers";
import {
  HOT_MOOD_FILTERS,
  HOT_SCENE_TABS,
  filterByMood,
  filterBySceneTab,
  platformLabelForItem,
  suggestPublishPlatform,
  type HotTopicsSceneTab,
} from "@/lib/hot-topics/hot-topics-page-utils";
import type { HotTopicItem } from "@/lib/hot-topics/types";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { cn } from "@/lib/utils";

export type { HotTopicsSceneTab };

export function HotTopicsFeed({
  allItems,
  sceneTab,
  mood,
  onSceneTabChange,
  onMoodChange,
  onRefresh,
  refreshing,
}: {
  allItems: HotTopicItem[];
  sceneTab: HotTopicsSceneTab;
  mood: string;
  onSceneTabChange: (tab: HotTopicsSceneTab) => void;
  onMoodChange: (mood: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const router = useRouter();
  const { tr, user, setQuotaModalOpen } = useApp();

  const filtered = useMemo(() => {
    const byScene = filterBySceneTab(allItems, sceneTab);
    const byMood = filterByMood(byScene, mood);
    return enrichHotTopics(byMood);
  }, [allItems, sceneTab, mood]);

  const { covers: pexelsCovers } = useHotTopicPexelsCovers(filtered);

  const viewLimit = user ? FEATURE_LIMITS[user.plan].hotTopicView : 5;
  const defaultPlatform = suggestPublishPlatform(sceneTab);

  const onGenerate = (item: HotTopicDisplay, index: number) => {
    if (user?.plan === "free" && index >= viewLimit) {
      setQuotaModalOpen(true);
      return;
    }
    const platform = defaultPlatform ?? platformLabelForItem(item);
    const q = new URLSearchParams({
      topic_id: item.id,
      topic: item.title,
    });
    if (platform) q.set("platform", platform);
    router.push(`/publish-pack?${q.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-[#8A94A6]">{tr("hotTopicsPickHint")}</p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#FF6B8A] shadow-sm ring-1 ring-[#FFE8F0] disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {tr("hotTopicsRefresh")}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {HOT_SCENE_TABS.map((t) => {
          const active = sceneTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSceneTabChange(t.id)}
              className={cn(
                "flex flex-col items-center rounded-[14px] px-1 py-2 transition-transform duration-150 active:scale-[0.97]",
                active
                  ? "bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md"
                  : "bg-white text-[#6B7280] ring-1 ring-[#FFE8F0]"
              )}
            >
              <span className="text-[11px] font-black leading-tight">{t.label}</span>
              <span
                className={cn(
                  "mt-0.5 text-[8px] font-medium leading-tight",
                  active ? "text-white/85" : "text-[#9CA3AF]"
                )}
              >
                {t.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {HOT_MOOD_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onMoodChange(c)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition",
              mood === c
                ? "bg-[#FFF0F5] text-[#FF4F8B] ring-1 ring-[#FF4F8B]/35"
                : "bg-white text-[#8A94A6] ring-1 ring-[#F3F4F6]"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#FFD0E8] bg-white/90 px-4 py-12 text-center">
          <p className="text-[14px] font-black text-[#1F2937]">{tr("hotTopicsEmptyTitle")}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#8A94A6]">
            {tr("hotTopicsEmptyDesc")}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item, index) => {
            const locked = user?.plan === "free" && index >= viewLimit;
            const showProBanner = user?.plan === "free" && index === viewLimit;
            const plat = platformLabelForItem(item);

            if (showProBanner) {
              return (
                <li key="pro-banner">
                  <div className="rounded-[16px] border border-[#FFD0E8] bg-gradient-to-r from-[#FFF4F7] to-[#FFF8F0] px-4 py-3.5 text-center">
                    <p className="text-[12px] font-black text-[#1F2937]">{tr("homeHotFreeLimit")}</p>
                    <p className="mt-1 text-[10px] text-[#8A94A6]">{tr("hotTopicsUnlockBoth")}</p>
                    <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                      <Link
                        href="/invite"
                        className="rounded-full bg-white px-4 py-1.5 text-[11px] font-black text-[#FF4F8B] ring-1 ring-[#FFD0E8]"
                      >
                        {tr("hotTopicsUnlockInvite")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setQuotaModalOpen(true)}
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
              <li key={item.id} className="cv-auto">
                <article
                  className={cn(
                    "flex gap-3 overflow-hidden rounded-[18px] bg-white p-2.5 shadow-[0_2px_14px_rgba(255,120,150,0.08)] ring-1 ring-[#FFE8F0]",
                    locked && "pointer-events-none select-none blur-[2px] opacity-60"
                  )}
                >
                  <div className="relative shrink-0">
                    <HotTopicPexelsCover
                      cover={pexelsCovers.get(item.id) ?? null}
                      title={item.title}
                      priority={index < 6}
                      size={96}
                    />
                    <span className="absolute left-1 top-1 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-black/55 px-1 text-[9px] font-black text-white">
                      {index + 1}
                    </span>
                    {item.badgeLabel ? (
                      <span className="absolute right-1 top-1 z-10 rounded-md bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-1 py-0.5 text-[7px] font-black text-white">
                        {item.badgeLabel}
                      </span>
                    ) : index === 0 ? (
                      <span className="absolute right-1 top-1 z-10 rounded-md bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-1 py-0.5 text-[7px] font-black text-white">
                        最多人点
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col py-0.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="rounded-md bg-[#FFF0F5] px-1.5 py-0.5 text-[8px] font-bold text-[#FF4F8B]">
                        {plat}
                      </span>
                      <span className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[8px] font-bold text-[#6B7280]">
                        {item.category || item.track || "灵感"}
                      </span>
                      {item.isNew ? (
                        <span className="rounded-md bg-[#FF4F8B] px-1.5 py-0.5 text-[8px] font-black text-white">
                          NEW
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-[13px] font-black leading-snug text-[#1F2937]">
                      {item.title}
                    </h3>
                    {item.likesLabel || item.savesLabel || item.commentsLabel ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] font-bold text-[#8A94A6]">
                        {item.likesLabel ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Heart size={10} className="text-[#FF6B8A]" />
                            {item.likesLabel}
                          </span>
                        ) : null}
                        {item.savesLabel ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Bookmark size={10} />
                            {item.savesLabel}
                          </span>
                        ) : null}
                        {item.commentsLabel ? (
                          <span className="inline-flex items-center gap-0.5">
                            <MessageCircle size={10} />
                            {item.commentsLabel}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#FF6B8A]">
                        <TrendingUp size={11} />
                        {item.heatValue} · 爆款率 {item.viralScore}%
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => onGenerate(item, index)}
                      className="mt-auto flex w-full items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2 text-[11px] font-black text-white shadow-sm active:scale-[0.98]"
                    >
                      <Sparkles size={13} />
                      {locked ? tr("hotTopicsUnlockShort") : tr("hotTopicsGenOneTap")}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-[10px] leading-relaxed text-[#9CA3AF]">
        {tr("hotTopicsFooterNote")}
      </p>
    </div>
  );
}
