"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, ChevronRight, Flame, Wand2 } from "lucide-react";
import {
  HistoryTypeIcon,
  HistoryTypeIconBadge,
} from "@/components/history/history-type-icon";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { isClientServerMode } from "@/lib/client/server-api";
import {
  BLINDBOX_HISTORY_META,
  formatHistoryWhen,
  historyDetailHref,
  historyFilterForType,
  historyTypeMeta,
  LIBRARY_STAT_METAS,
  type LibraryFilter,
} from "@/lib/history/library-meta";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "pack", label: "发布包" },
  { id: "topic", label: "盲盒选题" },
  { id: "emotion", label: "AI助手" },
  { id: "review", label: "复盘" },
];

const STAT_KEYS = ["pack", "topic", "emotion", "review"] as const;

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-400">加载中…</div>}>
      <HistoryInner />
    </Suspense>
  );
}

function HistoryInner() {
  const params = useSearchParams();
  const { histories, tr, user, refreshUser } = useApp();
  const [filter, setFilter] = useState<LibraryFilter>("all");

  useEffect(() => {
    const q = params.get("filter");
    if (q === "pack" || q === "topic" || q === "emotion" || q === "review") {
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
    const review = histories.filter((h) => historyFilterForType(h.type) === "review").length;
    return { total: histories.length, pack, topic, emotion, review };
  }, [histories]);

  const filtered = useMemo(() => {
    if (filter === "all") return histories;
    return histories.filter((h) => historyFilterForType(h.type) === filter);
  }, [filter, histories]);

  return (
    <AppShell>
      <div className="page-flow-stagger">
        <SectionTitle
          eyebrow="📚"
          title={tr("libraryTitle")}
          desc={tr("libraryDesc")}
        />

        <Card className="mb-4 overflow-hidden border-0 shadow-[0_10px_32px_rgba(255,122,174,0.18)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] px-4 py-4 text-white">
            <span
              className="library-hero-shine pointer-events-none absolute -right-8 top-2 h-28 w-28 rounded-full bg-white/20 blur-2xl"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-[#FFC46B]/30 blur-2xl"
              aria-hidden
            />
            <p className="relative text-[10px] font-bold tracking-wide text-white/90">
              {tr("libraryHeroTag")}
            </p>
            <p className="relative mt-1 text-[26px] font-black leading-none">
              {stats.total}
              <span className="ml-1 text-base font-bold text-white/90">条创作记录</span>
            </p>
            <div className="relative mt-3.5 grid grid-cols-4 gap-2">
              {STAT_KEYS.map((key) => {
                const meta = LIBRARY_STAT_METAS[key];
                const value = stats[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={cn(
                      "library-stat-cell rounded-2xl py-2.5 text-center transition active:scale-[0.97]",
                      filter === key
                        ? "bg-white/28 ring-2 ring-white/50"
                        : "bg-white/14 ring-1 ring-white/25 hover:bg-white/20"
                    )}
                  >
                    <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/35">
                      <HistoryTypeIcon meta={meta} className="text-white" />
                    </div>
                    <div className="text-lg font-black leading-none">{value}</div>
                    <div className="mt-0.5 text-[9px] font-semibold text-white/92">
                      {meta.shortLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {histories.length > 0 ? (
          <>
            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition active:scale-95",
                    filter === f.id
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white ring-transparent shadow-[0_4px_12px_rgba(255,107,107,0.35)]"
                      : "bg-white text-slate-600 ring-[#FFE8F0] shadow-sm"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {filtered.map((h, index) => {
                const meta = historyTypeMeta(h.type);
                const href = historyDetailHref(h.id);
                const inner = (
                  <Card
                    className={cn(
                      "library-list-item cv-auto overflow-hidden border-0 bg-white shadow-[0_2px_16px_rgba(255,122,174,0.08)] transition active:scale-[0.99]",
                      "ring-1",
                      meta.ring
                    )}
                    style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
                  >
                    <CardContent className="flex items-center gap-3.5 p-3.5">
                      <HistoryTypeIconBadge meta={meta} list />
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex max-w-full truncate rounded-full bg-[#FFF5F9] px-2 py-0.5 text-[9px] font-bold text-[#FF5C8A] ring-1 ring-[#FF7AAE]/12">
                          {meta.shortLabel}
                        </span>
                        <p className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-slate-800">
                          {h.topic || "未命名内容"}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          {formatHistoryWhen(h.createdAt)}
                        </p>
                      </div>
                      {href ? (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF7F0] text-[#FF7AAE]">
                          <ChevronRight size={18} />
                        </span>
                      ) : null}
                    </CardContent>
                  </Card>
                );
                return href ? (
                  <Link key={h.id} href={href} className="block">
                    {inner}
                  </Link>
                ) : (
                  <div key={h.id}>{inner}</div>
                );
              })}
            </div>
          </>
        ) : (
          <Card className="overflow-hidden border-0 shadow-[0_4px_20px_rgba(255,122,174,0.08)] ring-1 ring-[#FFE8F0]">
            <CardContent className="py-10 text-center">
              <BookOpen className="library-empty-float mx-auto mb-3 text-[#FF7AAE]" size={42} />
              <p className="text-base font-black text-slate-800">{tr("libraryEmptyTitle")}</p>
              <p className="mt-2 text-sm text-slate-500">{tr("libraryEmptyDesc")}</p>
              <div className="mt-5 grid grid-cols-1 gap-2 px-2">
                <Link
                  href="/hot-topics"
                  className={cn(
                    "play-entry-enter flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white",
                    `bg-gradient-to-r ${theme.primary}`
                  )}
                  style={{ animationDelay: "0.1s" }}
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
                  <HistoryTypeIcon
                    meta={BLINDBOX_HISTORY_META}
                    className="text-[#FF7AAE]"
                  />
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
