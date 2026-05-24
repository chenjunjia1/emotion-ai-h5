"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { Bookmark, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { enrichHotTopics, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { HotTopicCover } from "@/components/hot-topics/hot-topic-cover";
import type { HotTopicItem } from "@/hooks/use-product";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { cn } from "@/lib/utils";

export const PLATFORM_TABS = [
  { id: "all", label: "\u63a8\u8350" },
  { id: "douyin", label: "\u6296\u97f3\u7206\u6b3e" },
  { id: "xhs", label: "\u5c0f\u7ea2\u4e66\u7075\u611f" },
  { id: "web", label: "\u5168\u7f51\u70ed\u641c" },
] as const;

export type HotTopicsTabId = (typeof PLATFORM_TABS)[number]["id"];

const CATEGORY_FILTERS = [
  "\u5168\u90e8",
  "\u60c5\u611f",
  "\u804c\u573a",
  "\u751f\u6d3b",
  "\u5ba0\u7269",
  "\u7f8e\u98df",
  "\u5b66\u751f",
  "\u5b9d\u5988",
  "\u526f\u4e1a",
  "\u7a7f\u642d",
  "\u63a2\u5e97",
  "AI\u5de5\u5177",
] as const;

function matchCategory(item: HotTopicDisplay, cat: string): boolean {
  if (cat === "\u5168\u90e8") return true;
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
    <Wrapper className="space-y-3">
      <Wrapper className="overflow-hidden rounded-[20px] bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-3 py-2.5 text-white shadow-md">
        <p className="text-[13px] font-black">{tr("hotTopicsBannerTitle")}</p>
        <p className="mt-0.5 text-[10px] text-white/90">{tr("hotTopicsBannerDesc")}</p>
      </Wrapper>

      <Wrapper className="flex items-center justify-between gap-2 text-[11px] text-[#8A94A6]">
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
      </Wrapper>

      <Wrapper className="flex gap-2 overflow-x-auto scrollbar-none">
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
      </Wrapper>

      <Wrapper className="flex flex-wrap gap-1.5">
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
      </Wrapper>

      <Wrapper className="space-y-3">
        {filtered.length === 0 ? (
          <Wrapper className="rounded-[22px] border border-dashed border-[#FFD0E8] bg-white/80 px-4 py-10 text-center">
            <p className="text-sm font-black text-[#1F2937]">{"\u8be5\u5206\u7c7b\u6682\u65e0\u5339\u914d\u70ed\u70b9"}</p>
            <p className="mt-1 text-[11px] text-[#8A94A6]">
              {tab === "xhs"
                ? "\u5c0f\u7ea2\u4e66\u7075\u611f\u7531\u5168\u7f51\u70ed\u699c AI \u6539\u5199\uff0c\u70b9\u300c\u6362\u4e00\u6279\u70ed\u70b9\u300d\u62c9\u53d6\u6700\u65b0"
                : "\u8bd5\u8bd5\u5207\u6362\u5176\u4ed6 Tab \u6216\u5237\u65b0\u70ed\u70b9"}
            </p>
          </Wrapper>
        ) : null}
        {filtered.map((item, index) => {
          const locked = user?.plan === "free" && index >= viewLimit;
          const showProBanner = user?.plan === "free" && index === viewLimit;
          return (
            <Wrapper key={item.id}>
              {showProBanner ? (
                <Wrapper className="mb-3 rounded-[18px] border border-[#FFD0E8] bg-gradient-to-r from-[#FFF4F7] to-[#FFF3E8] px-4 py-3 text-center">
                  <p className="text-[11px] font-bold text-[#1F2937]">{tr("homeHotFreeLimit")}</p>
                  <Link
                    href="/profile?pricing=1"
                    className="mt-2 inline-block rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-4 py-1.5 text-[11px] font-black text-white"
                  >
                    {tr("hotTopicsUnlockPro")}
                  </Link>
                </Wrapper>
              ) : null}
              <article
                className={cn(
                  "hot-card-enter cream-card overflow-hidden rounded-[22px] p-3.5",
                  locked && "opacity-75"
                )}
              >
                <Wrapper className="flex gap-3">
                  <Wrapper className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#FFE0EC]">
                    <HotTopicCover item={item} className="rounded-xl" iconSize={18} />
                    <span className="absolute left-1 top-1 rounded-md bg-black/45 px-1 py-0.5 text-[9px] font-black text-white">
                      TOP {index + 1}
                    </span>
                  </Wrapper>
                  <Wrapper className="min-w-0 flex-1">
                    <Wrapper className="flex items-start gap-2">
                      <h3 className="flex-1 text-[13px] font-black text-[#1F2937]">{item.title}</h3>
                      {item.isNew ? (
                        <span className="shrink-0 rounded-md bg-[#FF4F8B] px-1.5 py-0.5 text-[9px] font-black text-white">
                          {"\u65b0"}
                        </span>
                      ) : null}
                    </Wrapper>
                    {item.rawTitle && item.rawTitle !== item.title ? (
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-[#FF9A4D]">
                        {"\u70ed\u699c\u539f\u6587\uff1a"}
                        {item.rawTitle}
                      </p>
                    ) : null}
                    <p className="mt-1 line-clamp-2 text-[10px] text-[#8A94A6]">{item.desc}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#FF4F8B]">
                      {item.heatValue} {"\u00b7"} {item.platform} {"\u00b7"} {tr("homeHotViral")}{" "}
                      {item.viralScore}%
                    </p>
                  </Wrapper>
                </Wrapper>
                <Wrapper className="mt-3 flex items-center gap-2">
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
                </Wrapper>
              </article>
            </Wrapper>
          );
        })}
      </Wrapper>
    </Wrapper>
  );
}

function Wrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}
