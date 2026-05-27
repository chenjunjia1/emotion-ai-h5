"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Flame, Plus, Wand2 } from "lucide-react";
import { HistoryTypeIcon } from "@/components/history/history-type-icon";
import { LibraryHeroBanner } from "@/components/history/library-hero-banner";
import { LibraryHistoryCard } from "@/components/history/library-history-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { isClientServerMode } from "@/lib/client/server-api";
import {
  BLINDBOX_HISTORY_META,
  historyFilterForType,
  type LibraryFilter,
} from "@/lib/history/library-meta";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "treehole", label: "树洞陪聊" },
  { id: "pack", label: "发布包" },
  { id: "topic", label: "盲盒选题" },
  { id: "emotion", label: "AI助手" },
  { id: "review", label: "复盘" },
];

const QUICK_LINKS = [
  { href: "/create", label: "新建创作", emoji: "✨", tint: "from-[#FF4F8B] to-[#FF9A4D]" },
  { href: "/publish-pack", label: "写发布包", emoji: "📦", tint: "from-[#FF7AAE] to-[#FFC46B]" },
  { href: "/inspiration", label: "逛灵感库", emoji: "🔥", tint: "from-[#FF6B6B] to-[#FF8A7A]" },
] as const;

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-400">加载中…</div>}>
      <HistoryInner />
    </Suspense>
  );
}

function HistoryInner() {
  const params = useSearchParams();
  const { histories, tr, user, refreshUser, showToast } = useApp();
  const [filter, setFilter] = useState<LibraryFilter>("all");

  useEffect(() => {
    const q = params.get("filter");
    if (q === "pack" || q === "topic" || q === "emotion" || q === "review" || q === "treehole") {
      setFilter(q);
    }
  }, [params]);

  useEffect(() => {
    if (isClientServerMode() && user) void refreshUser();
  }, [user, refreshUser]);

  const stats = useMemo(() => {
    const pack = histories.filter((h) => historyFilterForType(h.type) === "pack").length;
    const topic = histories.filter((h) => historyFilterForType(h.type) === "topic").length;
    const emotion = histories.filter((h) => historyFilterForType(h.type) === "emotion").length;
    const treehole = histories.filter((h) => historyFilterForType(h.type) === "treehole").length;
    const review = histories.filter((h) => historyFilterForType(h.type) === "review").length;
    return { total: histories.length, pack, topic, emotion, treehole, review };
  }, [histories]);

  const filterCount = (id: LibraryFilter) => {
    if (id === "all") return stats.total;
    return stats[id];
  };

  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? histories
        : histories.filter((h) => historyFilterForType(h.type) === filter);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filter, histories]);

  const onCopy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    showToast("已复制到剪贴板");
  };

  return (
    <AppShell>
      <div className="page-flow-stagger pb-2">
        <header className="mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7AAE] to-[#FF9A4D] text-lg text-white shadow-[0_4px_14px_rgba(255,79,139,0.35)]">
              📚
            </span>
            <div>
              <h1 className="text-[20px] font-black text-[#1F2937]">{tr("libraryTitle")}</h1>
              <p className="text-[11px] text-[#9CA3AF]">{tr("libraryDesc")}</p>
            </div>
          </div>
        </header>

        <LibraryHeroBanner
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
          tr={tr}
        />

        {histories.length > 0 ? (
          <>
            <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-2 text-[11px] font-black text-white shadow-md active:scale-95",
                    link.tint
                  )}
                >
                  <span aria-hidden>{link.emoji}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                const count = filterCount(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition active:scale-95",
                      active
                        ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white ring-transparent shadow-[0_4px_14px_rgba(255,79,139,0.35)]"
                        : "bg-white text-[#6B7280] ring-[#FFE8F0] shadow-sm"
                    )}
                  >
                    {f.label}
                    <span
                      className={cn(
                        "ml-1 tabular-nums",
                        active ? "text-white/90" : "text-[#FF4F8B]"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <Card className="border-0 ring-1 ring-[#FFE8F0]">
                <CardContent className="py-8 text-center">
                  <p className="text-sm font-bold text-[#1F2937]">该分类暂无记录</p>
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="mt-3 text-[12px] font-bold text-[#FF4F8B]"
                  >
                    查看全部 {stats.total} 条
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((h, index) => (
                  <LibraryHistoryCard
                    key={h.id}
                    item={h}
                    index={index}
                    onCopy={onCopy}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="overflow-hidden border-0 shadow-[0_4px_20px_rgba(255,122,174,0.08)] ring-1 ring-[#FFE8F0]">
            <CardContent className="py-10 text-center">
              <BookOpen className="library-empty-float mx-auto mb-3 text-[#FF7AAE]" size={42} />
              <p className="text-base font-black text-slate-800">{tr("libraryEmptyTitle")}</p>
              <p className="mt-2 text-sm text-slate-500">{tr("libraryEmptyDesc")}</p>
              <div className="mt-5 grid grid-cols-1 gap-2 px-2">
                <Link
                  href="/create"
                  className={cn(
                    "play-entry-enter flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-lg",
                    `bg-gradient-to-r ${theme.primary}`
                  )}
                  style={{ animationDelay: "0.08s" }}
                >
                  <Plus size={16} />
                  去创作中心
                </Link>
                <Link
                  href="/inspiration"
                  className="play-entry-enter flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A]"
                  style={{ animationDelay: "0.12s" }}
                >
                  <Flame size={16} />
                  {tr("libraryCtaHot")}
                </Link>
                <Link
                  href="/publish-pack"
                  className="play-entry-enter flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-[#FF5C8A] ring-2 ring-[#FF7AAE]/25"
                  style={{ animationDelay: "0.16s" }}
                >
                  <Wand2 size={16} />
                  {tr("libraryCtaPack")}
                </Link>
                <Link
                  href="/topic-box"
                  className="play-entry-enter flex items-center justify-center gap-2 rounded-2xl bg-[#FFF5F9] py-3 text-sm font-bold text-[#FF7AAE] ring-1 ring-[#FF7AAE]/20"
                  style={{ animationDelay: "0.22s" }}
                >
                  <HistoryTypeIcon meta={BLINDBOX_HISTORY_META} className="text-[#FF7AAE]" />
                  {tr("libraryCtaBlindbox")}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
