"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { HotTopicsPageHero } from "@/components/hot-topics/hot-topics-page-hero";
import { HotTopicsStatsStrip } from "@/components/hot-topics/hot-topics-stats-strip";
import { XhsHotNotesFeed } from "@/components/hot-topics/xhs-hot-notes-feed";
import { apiGetXhsHotNotes, apiGetXhsHotNotesMeta } from "@/lib/xhs/xhs-client-api";
import {
  clearXhsHotNotesClientCache,
  getXhsHotNotesClientCache,
  setXhsHotNotesClientCache,
} from "@/lib/xhs/xhs-hot-notes-cache";
import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { XHS_FEED_TABS } from "@/lib/xhs/xhs-page-tabs";
import type { XhsHotNote } from "@/lib/xhs/types";

function HotTopicsPageFallback() {
  return (
    <AppShell>
      <HotTopicsPageHero />
      <HotTopicsStatsStrip />
      <div className="py-8 text-center text-[11px] text-[#9CA3AF]">加载灵感库…</div>
    </AppShell>
  );
}

function HotTopicsPageContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && XHS_FEED_TABS.some((t) => t.id === tabFromUrl)
      ? (tabFromUrl as XhsFeedTab)
      : "hot";

  const [xhsTab, setXhsTab] = useState<XhsFeedTab>(initialTab);
  const [xhsNotes, setXhsNotes] = useState<XhsHotNote[]>([]);
  const [xhsLoading, setXhsLoading] = useState(true);
  const [xhsError, setXhsError] = useState<string | null>(null);

  const applyResponse = useCallback((res: Awaited<ReturnType<typeof apiGetXhsHotNotes>>) => {
    if (!res.success || !res.data?.length) {
      setXhsError(res.message ?? "暂无小红书热门图文");
      setXhsNotes([]);
      return;
    }
    setXhsError(null);
    setXhsNotes(res.data);
    setXhsHotNotesClientCache(res);
  }, []);

  const loadXhsNotes = useCallback(
    async (opts?: { force?: boolean; silent?: boolean }) => {
      const force = opts?.force ?? false;
      const silent = opts?.silent ?? false;

      let serverRevision: string | null = null;
      try {
        const meta = await apiGetXhsHotNotesMeta();
        serverRevision = meta.dataRevision;
      } catch {
        /* 元数据失败仍尝试拉列表 */
      }

      if (!force) {
        const hit = getXhsHotNotesClientCache(serverRevision);
        if (hit?.data?.length) {
          setXhsNotes(hit.data);
          setXhsError(null);
          setXhsLoading(false);
          if (serverRevision && hit.dataRevision === serverRevision) {
            return;
          }
        }
      }

      if (!silent) setXhsLoading(true);
      setXhsError(null);
      const res = await apiGetXhsHotNotes(force || Boolean(serverRevision));
      applyResponse(res);
      setXhsLoading(false);
    },
    [applyResponse]
  );

  useEffect(() => {
    void loadXhsNotes({ force: false, silent: false });
  }, [loadXhsNotes]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadXhsNotes({ force: true, silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadXhsNotes]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && XHS_FEED_TABS.some((t) => t.id === tab)) {
      setXhsTab(tab as XhsFeedTab);
    }
  }, [searchParams]);

  const onRetryXhs = () => {
    clearXhsHotNotesClientCache();
    void loadXhsNotes({ force: true });
  };

  return (
    <AppShell>
      <HotTopicsPageHero />
      <HotTopicsStatsStrip />

      <XhsHotNotesFeed
        notes={xhsNotes}
        tab={xhsTab}
        onTabChange={setXhsTab}
        onRetry={onRetryXhs}
        loading={xhsLoading}
        error={xhsError}
      />
    </AppShell>
  );
}

export default function HotTopicsPage() {
  return (
    <Suspense fallback={<HotTopicsPageFallback />}>
      <HotTopicsPageContent />
    </Suspense>
  );
}
