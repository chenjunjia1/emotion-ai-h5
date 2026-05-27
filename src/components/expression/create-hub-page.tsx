"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, History, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  CreateFeaturedCard,
  CreateToolTile,
  CreateTreeholeLink,
} from "@/components/expression/create-hub-cards";
import { SectionHeader } from "@/components/expression/ui";
import { useApp } from "@/contexts/app-context";
import { CreateHistoryCard, type CreateHistoryRecord } from "@/components/expression/create-history-card";
import {
  formatHistoryWhen,
  historyDetailHref,
  historyTypeMeta,
} from "@/lib/history/library-meta";
import {
  CREATE_HISTORY_MOCK,
  CREATE_HISTORY_RECENT_LIMIT,
  CREATE_HUB_ENTRIES,
  CREATE_HUB_FEATURED_ID,
} from "@/lib/mock/expression-assistant";
import { CREATE_QUICK_STARTS } from "@/lib/mock/create-quick-start";
import {
  buildCreateToolHref,
  readInspirationPick,
  type InspirationCreateTool,
  type InspirationPick,
  CREATE_TOOL_ENTRY_IDS,
} from "@/lib/inspiration/inspiration-create-bridge";
function toolLabel(tool: InspirationCreateTool | null): string {
  if (tool === "pack" || tool === "video") return "高级图文包";
  if (tool === "moments") return "朋友圈文案";
  if (tool === "image") return "图片配文";
  return "";
}

export function CreateHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { histories } = useApp();
  const toolParam = searchParams.get("tool") as InspirationCreateTool | null;
  const topicParam = searchParams.get("topic");
  const fromInspiration = searchParams.get("from") === "inspiration";

  const [lastPick, setLastPick] = useState<InspirationPick | null>(null);

  const featuredEntry = useMemo(
    () => CREATE_HUB_ENTRIES.find((e) => e.id === CREATE_HUB_FEATURED_ID),
    []
  );
  const { gridTools, treeholeEntry } = useMemo(() => {
    const tools = CREATE_HUB_ENTRIES.filter((e) => !e.featured);
    return {
      gridTools: tools.filter((e) => e.id !== "treehole"),
      treeholeEntry: tools.find((e) => e.id === "treehole"),
    };
  }, []);

  useEffect(() => {
    setLastPick(readInspirationPick());
  }, []);

  const highlightedEntryId = useMemo(() => {
    if (!toolParam) return null;
    return CREATE_TOOL_ENTRY_IDS[toolParam] ?? null;
  }, [toolParam]);

  const topicDecoded = topicParam ? decodeURIComponent(topicParam) : "";

  const recentRecords = useMemo((): CreateHistoryRecord[] => {
    if (histories.length > 0) {
      return [...histories]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, CREATE_HISTORY_RECENT_LIMIT)
        .map((h) => ({
          id: h.id,
          meta: historyTypeMeta(h.type),
          preview: h.topic || "未命名内容",
          time: formatHistoryWhen(h.createdAt),
          detailHref: historyDetailHref(h.id),
        }));
    }
    return CREATE_HISTORY_MOCK.slice(0, CREATE_HISTORY_RECENT_LIMIT).map((h) => ({
      id: h.id,
      meta: historyTypeMeta(h.type),
      preview: h.preview,
      time: h.time,
      detailHref: "/history",
    }));
  }, [histories]);

  return (
    <AppShell showHeader={false} homePage>
      <div className="create-hub-page create-hub-page--xhs space-y-5 pb-2">
        <header className="flex items-center justify-between pt-0.5">
          <div>
            <h1 className="text-[18px] font-semibold text-[#333]">创作</h1>
            <p className="mt-0.5 text-[12px] text-[#999]">
              {fromInspiration ? "从灵感过来，选工具开写" : "文案 · 配图 · 一键可发"}
            </p>
          </div>
          <Link
            href="/history"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0F0F0] bg-white text-[#666] active:bg-[#FAFAFA]"
            aria-label="创作记录"
          >
            <History size={18} strokeWidth={1.8} />
          </Link>
        </header>

        {featuredEntry ? <CreateFeaturedCard entry={featuredEntry} /> : null}

        {lastPick ? (
          <button
            type="button"
            onClick={() => router.push(lastPick.targetHref)}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-[#F0F0F0] bg-white p-3 text-left active:bg-[#FAFAFA]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F0] text-[#FF2442]">
              <Sparkles size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-[#999]">继续上次</p>
              <p className="truncate text-[13px] font-medium text-[#333]">{lastPick.headline}</p>
            </div>
            <span className="shrink-0 text-[12px] font-medium text-[#FF2442]">继续</span>
          </button>
        ) : null}

        {toolParam && topicDecoded ? (
          <div className="rounded-2xl border border-[#FFE4E8] bg-[#FFFBFB] px-3 py-2.5">
            <p className="text-[10px] font-medium text-[#FF2442]">已带入选题</p>
            <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-[#333]">{topicDecoded}</p>
            <button
              type="button"
              onClick={() => router.push(buildCreateToolHref(toolParam, topicDecoded))}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-[#FF2442] py-2 text-[12px] font-medium text-white active:opacity-90"
            >
              用此选题打开{toolLabel(toolParam)}
              <ArrowRight size={14} />
            </button>
          </div>
        ) : null}

        <section className="space-y-2.5">
          <SectionHeader title="常用工具" sub="文案、配图、分析" />
          <div className="grid grid-cols-2 gap-2">
            {gridTools.map((entry, i) => (
              <CreateToolTile
                key={entry.id}
                entry={entry}
                tintIndex={i}
                highlighted={highlightedEntryId === entry.id}
              />
            ))}
          </div>
          {treeholeEntry ? (
            <div className="mt-3">
              <CreateTreeholeLink
                entry={treeholeEntry}
                highlighted={highlightedEntryId === treeholeEntry.id}
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-2">
          <SectionHeader title="快捷开写" sub="预填场景，少想一步" />
          <div className="create-quick-start-rail -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5 scrollbar-none">
            {CREATE_QUICK_STARTS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#F0F0F0] bg-white py-1.5 pl-1.5 pr-3 active:bg-[#FAFAFA]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F7F7] text-sm">
                  {item.emoji}
                </span>
                <span className="text-[12px] font-medium text-[#333]">{item.label}</span>
              </Link>
            ))}
          </div>
          <p className="text-center text-[11px] text-[#BBB]">
            更多选题
            <Link
              href="/inspiration"
              className="ml-1 inline-flex items-center gap-0.5 font-medium text-[#FF2442]"
            >
              去灵感库
              <ArrowRight size={11} />
            </Link>
          </p>
        </section>

        <section className="rounded-2xl border border-[#F0F0F0] bg-white p-3.5">
          <SectionHeader
            title="我的创作"
            sub={`最近 ${CREATE_HISTORY_RECENT_LIMIT} 条`}
            action={
              <Link
                href="/history"
                className="mb-0.5 inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[#666] active:text-[#FF2442]"
              >
                全部
                <ArrowRight size={12} />
              </Link>
            }
          />
            <div className="relative -mx-0.5 mt-1">
              <div className="create-history-rail flex gap-3 overflow-x-auto px-0.5 pb-1 pt-0.5 scrollbar-none snap-x snap-mandatory">
                {recentRecords.map((h, i) => (
                  <CreateHistoryCard
                    key={h.id}
                    record={h}
                    index={i}
                    onCopy={(text) => void navigator.clipboard?.writeText(text)}
                  />
                ))}
              </div>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent"
                aria-hidden
              />
            </div>
        </section>
      </div>
    </AppShell>
  );
}
