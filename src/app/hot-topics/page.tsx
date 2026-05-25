"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { HotTopicsPageHero } from "@/components/hot-topics/hot-topics-page-hero";
import { HotTopicsStatsStrip } from "@/components/hot-topics/hot-topics-stats-strip";
import { XhsHotNotesFeed } from "@/components/hot-topics/xhs-hot-notes-feed";
import { apiGetXhsHotNotes } from "@/lib/xhs/xhs-client-api";
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

  const loadXhsNotes = useCallback(async (force = false) => {
    if (!force) {
      const hit = getXhsHotNotesClientCache();
      if (hit?.data?.length) {
        setXhsNotes(hit.data);
        setXhsLoading(false);
        setXhsError(null);
        return;
      }
    }

    setXhsLoading(true);
    setXhsError(null);
    const res = await apiGetXhsHotNotes(force);
    if (!res.success || !res.data?.length) {
      setXhsError(res.message ?? "暂无小红书热门图文");
      setXhsNotes([]);
      setXhsLoading(false);
      return;
    }
    setXhsNotes(res.data);
    setXhsHotNotesClientCache(res);
    setXhsLoading(false);
  }, []);

  useEffect(() => {
    void loadXhsNotes(false);
  }, [loadXhsNotes]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && XHS_FEED_TABS.some((t) => t.id === tab)) {
      setXhsTab(tab as XhsFeedTab);
    }
  }, [searchParams]);

  const onRetryXhs = () => {
    clearXhsHotNotesClientCache();
    void loadXhsNotes(true);
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
