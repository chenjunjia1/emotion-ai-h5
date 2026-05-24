"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { enrichHotTopics, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { HotTopicCover } from "@/components/hot-topics/hot-topic-cover";
import type { HotTopicItem } from "@/hooks/use-product";
import { FEATURE_LIMITS } from "@/lib/v1/plan-limits";
import { cn } from "@/lib/utils";

const PLATFORM_TABS = [
  { id: "all", label: "\u63a8\u8350" },
  { id: "douyin", label: "\u6296\u97f3\u7206\u6b3e" },
  { id: "xhs", label: "\u5c0f\u7ea2\u4e66\u7075\u611f" },
  { id: "web", label: "\u5168\u7f51\u70ed\u641c" },
] as const;

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
  "AI工具",
] as const;

type TabId = (typeof PLATFORM_TABS)[number]["id"];

function matchTab(item: HotTopicDisplay, tab: TabId): boolean {
  if (tab === "all") return true;
  const p = item.platform;
  if (tab === "douyin") return p === "\u6296\u97f3" || item.track.includes("\u804c\u573a");
  if (tab === "xhs") return p === "\u5c0f\u7ea2\u4e66" || item.format.includes("\u56fe\u6587");
  return p === "\u5fae\u535a" || p === "B\u7ad9" || p === "\u89c6\u9891\u53f7";
}

function matchCategory(item: HotTopicDisplay, cat: string): boolean {
  if (cat === "\u5168\u90e8") return true;
  const hay = `${item.title}${item.track}${item.category ?? ""}${item.desc}${item.targetUsers.join("")}`;
  return hay.includes(cat);
}

export function HotTopicsFeed({
  items,
  onRefresh,
  refreshing,
  updatedAt,
}: {
  items: HotTopicItem[];
  onRefresh: () => void;
  refreshing: boolean;
  updatedAt: string;
}) {
  const router = useRouter();
  const { tr, user, setQuotaModalOpen } = useApp();
  const [tab, setTab] = useState<TabId>("all");
  const [category, setCategory] = useState<string>("\u5168\u90e8");

  const enriched = useMemo(() => enrichHotTopics(items), [items]);
  const filtered = useMemo(
    () => enriched.filter((i) => matchTab(i, tab) && matchCategory(i, category)),
    [enriched, tab, category]
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
            { n: String(Math.max(filtered.length, 20)), l: "\u4eca\u65e5\u7cbe\u9009" },
            { n: "08:00", l: "\u6bcf\u65e5\u66f4新" },
            { n: "AI", l: "\u667a\u80fd\u6539\u5199" },
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
          {tr("hotTopicsUpdatedAt")} {updatedAt.split(" ")[1] ?? "08:00"}
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
            onClick={() => setTab(t.id)}
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
            onClick={() => setCategory(c)}
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
                  <p className="mt-1 line-clamp-1 text-[10px] text-[#8A94A6]">{item.desc}</p>
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

