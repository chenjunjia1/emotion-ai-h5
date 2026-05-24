"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bookmark, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { enrichHotTopics, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { HotTopicCover } from "@/components/hot-topics/hot-topic-cover";
import type { HotTopicItem } from "@/hooks/use-product";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { cn } from "@/lib/utils";

export const PLATFORM_TABS = [
  { id: "all", label: "推荐" },
  { id: "douyin", label: "抖音爆款" },
  { id: "xhs", label: "小红书灵感" },
  { id: "web", label: "全网热搜" },
] as const;

export type HotTopicsTabId = (typeof PLATFORM_TABS)[number]["id"];

const CATEGORY_FILTERS = [
  "全部",
  "情感",
  "职场",
  "生活",
  "宠物",
  "美食",
  "学生",
  "宝妈",
  "副业",
  "穿搭",
  "探店",
  "AI工具",
] as const;

function matchCategory(item: HotTopicDisplay, cat: string): boolean {
  if (cat === "全部") return true;
  const hay = `${item.title}${item.track}${item.category ?? ""}${item.desc}${item.targetUsers.join("")}`;
  return hay.includes(cat);
}

export function HotTopicsFeed({
  items,
  tab,
  category,
  onTabChange,
  onCategoryChange,
  onRefresh,
  refreshing,
  updatedAt,
}: {
  items: HotTopicItem[];
  tab: HotTopicsTabId;
  category: string;
  onTabChange: (tab: HotTopicsTabId) => void;
  onCategoryChange: (cat: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  updatedAt: string;
}) {
  const router = useRouter();
  const { tr, user, setQuotaModalOpen } = useApp();

  const enriched = useMemo(() => enrichHotTopics(items), [items]);
  const filtered = useMemo(
    () => enriched.filter((i) => matchCategory(i, category)),
    [enriched, category]
  );

  const viewLimit = user ? FEATURE_LIMITS[user.plan].hotTopicView : 5;

  const onGenerate = (item: HotTopicDisplay, index: number) => {
    if (user?.plan === "free" && index >= viewLimit) {
      setQuotaModalOpen(true);
      return;
    }
    router.push(
      `/publish-pack?topic_id=${encodeURIComponent(item.id)}&topic=${encodeURIComponent(item.title)}`
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] p-4 text-white shadow-lg">
        <p className="text-sm font-black">{tr("hotTopicsBannerTitle")}</p>
        <p className="mt-1 text-[11px] text-white/90">{tr("hotTopicsBannerDesc")}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { n: String(Math.max(filtered.length, items.length, 20)), l: "今日精选" },
            { n: "08:00", l: "每日更新" },
            { n: "6+", l: "平台热榜" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-white/15 px-1 py-2 backdrop-blur-sm">
              <p className="text-sm font-black">{s.n}</p>
              <p className="text-[9px] font-bold text-white/85">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px] text-[#8A94A6]">
        <span>
          {tr("hotTopicsUpdatedAt")} {updatedAt.split(" ")[1] ?? updatedAt ?? "08:00"}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E8] px-2.5 py-1 font-bold text-[#FF9A4D] disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {tr("hotTopicsRefresh")}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {PLATFORM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-black transition",
              tab === t.id
                ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm"
                : "bg-white text-[#8A94A6] ring-1 ring-[#FFE0EC]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold",
              category === c
                ? "bg-[#FFF0F5] text-[#FF4F8B] ring-1 ring-[#FF4F8B]/30"
                : "bg-white text-[#8A94A6] ring-1 ring-orange-100/80"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#FFD0E8] bg-white/80 px-4 py-10 text-center">
            <p className="text-sm font-black text-[#1F2937]">该分类暂无匹配热点</p>
            <p className="mt-1 text-[11px] text-[#8A94A6]">
              {tab === "xhs"
                ? "小红书灵感由全网热榜 AI 改写，点「换一批热点」拉取最新"
                : "试试切换其他 Tab 或刷新热点"}
            </p>
          </div>
        ) : null}
        {filtered.map((item, index) => {
          const locked = user?.plan === "free" && index >= viewLimit;
          const showProBanner = user?.plan === "free" && index === viewLimit;
          return (
            <div key={item.id}>
              {showProBanner ? (
                <div className="mb-3 rounded-[18px] border border-[#FFD0E8] bg-gradient-to-r from-[#FFF4F7] to-[#FFF3E8] px-4 py-3 text-center">
                  <p className="text-[11px] font-bold text-[#1F2937]">{tr("homeHotFreeLimit")}</p>
                  <Link
                    href="/profile?pricing=1"
                    className="mt-2 inline-block rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-1.5 text-[11px] font-black text-white"
                  >
                    {tr("hotTopicsUnlockPro")}
                  </Link>
                </div>
              ) : null}
              <article
                className={cn(
                  "hot-card-enter cream-card overflow-hidden rounded-[22px] p-3.5",
                  locked && "opacity-75"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#FFE0EC]">
                    <HotTopicCover item={item} className="rounded-xl" iconSize={18} />
                    <span className="absolute left-1 top-1 rounded-md bg-black/45 px-1 py-0.5 text-[9px] font-black text-white">
                      TOP {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 text-[13px] font-black text-[#1F2937]">{item.title}</h3>
                      {item.isNew ? (
                        <span className="shrink-0 rounded-md bg-[#FF4F8B] px-1.5 py-0.5 text-[9px] font-black text-white">
                          新
                        </span>
                      ) : null}
                    </div>
                    {item.rawTitle && item.rawTitle !== item.title ? (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-[#FF9A4D]">
                        热榜原文：{item.rawTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 line-clamp-2 text-[10px] text-[#8A94A6]">{item.desc}</p>
                    <p className="mt-1 text-[10px] text-[#8A94A6]">
                      {tr("homeHotHeat")} {item.heatValue} · {item.platform}
                    </p>
                    <p className="mt-1 text-[10px] text-[#8A94A6]">
                      {tr("hotTopicDetailTarget")}：{item.targetUsers.join(" / ")}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[10px] text-[#FF9A4D]">
                      AI：{item.recommendAngles.join(" · ")}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-[#FF4F8B]">
                      {tr("homeHotViral")} {item.viralScore}%
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/hot-topics/${encodeURIComponent(item.id)}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3E8] text-[#FF9A4D]"
                    aria-label="detail"
                  >
                    <Bookmark size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onGenerate(item, index)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2 text-[12px] font-black text-white shadow-sm active:scale-[0.98]"
                  >
                    <Sparkles size={14} />
                    {locked ? tr("hotTopicsUnlockPro") : tr("homeHotGen")}
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
