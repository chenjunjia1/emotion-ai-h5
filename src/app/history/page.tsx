"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Flame, Sparkles, Wand2 } from "lucide-react";
import { BlindBoxMiniIcon } from "@/components/icons/blind-box-mini-icon";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { isClientServerMode } from "@/lib/client/server-api";
import {
  formatHistoryWhen,
  historyDetailHref,
  historyFilterForType,
  historyTypeMeta,
  type LibraryFilter,
} from "@/lib/history/library-meta";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "pack", label: "发布包" },
  { id: "topic", label: "盲盒选题" },
  { id: "emotion", label: "AI情绪" },
  { id: "review", label: "复盘" },
];

const STAT_CELLS = [
  { key: "pack", label: "发布包", emoji: "⚡" },
  { key: "topic", label: "盲盒", isBlindbox: true },
  { key: "emotion", label: "AI情绪", emoji: "💗" },
  { key: "review", label: "复盘", emoji: "📊" },
] as const;

export default function HistoryPage() {
  const { histories, tr, user, refreshUser } = useApp();
  const [filter, setFilter] = useState<LibraryFilter>("all");

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

        <Card className="mb-3 overflow-hidden border-[#FF7AAE]/30 shadow-[0_8px_28px_rgba(255,122,174,0.12)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] px-4 py-3.5 text-white">
            <span
              className="library-hero-shine pointer-events-none absolute -right-6 top-0 h-24 w-24 rounded-full bg-white/25 blur-2xl"
              aria-hidden
            />
            <p className="relative text-[10px] font-bold text-white/85">{tr("libraryHeroTag")}</p>
            <p className="relative mt-1 text-2xl font-black">{stats.total} 条创作记录</p>
            <div className="relative mt-3 grid grid-cols-4 gap-1.5">
              {STAT_CELLS.map((s) => {
                const value = stats[s.key as keyof typeof stats] as number;
                return (
                  <div
                    key={s.key}
                    className="library-stat-cell rounded-xl bg-white/15 py-2 text-center backdrop-blur-sm"
                  >
                    <div className="flex justify-center">
                      {"isBlindbox" in s ? (
                        <BlindBoxMiniIcon className="h-5 w-5 text-white play-icon-spark" />
                      ) : (
                        <span className="text-sm">{s.emoji}</span>
                      )}
                    </div>
                    <div className="text-base font-black">{value}</div>
                    <div className="text-[9px] font-medium text-white/90">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {histories.length > 0 ? (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 transition active:scale-95",
                    filter === f.id
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white ring-transparent shadow-sm"
                      : "bg-white text-slate-600 ring-orange-100"
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
                      "library-list-item overflow-hidden transition active:scale-[0.99]",
                      "ring-1",
                      meta.ring
                    )}
                    style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-sm",
                          meta.grad
                        )}
                      >
                        {meta.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-[#FF7AAE]">{meta.label}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm font-bold text-slate-800">
                          {h.topic || "未命名内容"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatHistoryWhen(h.createdAt)}
                        </p>
                      </div>
                      {href ? (
                        <ChevronRight className="shrink-0 text-orange-300" size={18} />
                      ) : null}
                    </CardContent>
                  </Card>
                );
                return href ? (
                  <Link key={h.id} href={href}>
                    {inner}
                  </Link>
                ) : (
                  <div key={h.id}>{inner}</div>
                );
              })}
            </div>
          </>
        ) : (
          <Card className="overflow-hidden border-orange-100/80">
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
                  className="play-entry-enter flex items-center justify-center gap-2 rounded-2xl bg-orange-50 py-3 text-sm font-bold text-orange-700 ring-1 ring-orange-100"
                  style={{ animationDelay: "0.22s" }}
                >
                  <Sparkles size={16} className="play-icon-spark" />
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
