"use client";

import { useCallback, useEffect, useState } from "react";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { HotTopicsPageHero } from "@/components/hot-topics/hot-topics-page-hero";
import { XhsHotNotesFeed } from "@/components/hot-topics/xhs-hot-notes-feed";
import {
  apiGetInspirationPool,
  apiGetXhsHotNotesMeta,
} from "@/lib/xhs/xhs-client-api";
import { INSPIRATION_POOL_TARGET } from "@/lib/xhs/inspiration-pool";
import {
  hasFullInspirationPoolCache,
  readInspirationPoolCache,
  writeInspirationPoolCache,
} from "@/lib/xhs/inspiration-pool-client-cache";
import {
  clearXhsHotNotesClientCache,
  getXhsHotNotesClientCache,
  setXhsHotNotesClientCache,
} from "@/lib/xhs/xhs-hot-notes-cache";
import { type XhsFeedTab, XHS_FEED_TABS } from "@/lib/xhs/xhs-page-tabs";
import type { XhsHotNote } from "@/lib/xhs/types";

function resolveInitialTab(
  tabFromUrl: string | null,
  platformFromUrl: string | null
): XhsFeedTab {
  if (platformFromUrl === "moments") return "moments";
  if (platformFromUrl === "xhs") return "xhs";
  if (tabFromUrl && XHS_FEED_TABS.some((t) => t.id === tabFromUrl)) {
    return tabFromUrl as XhsFeedTab;
  }
  return "hot";
}

/** 灵感页 — 与「今日热点」同款列表布局（渐变头图 + 分类 Tab + 横卡） */
export function InspirationPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const platformFromUrl = searchParams.get("platform");

  const [xhsTab, setXhsTab] = useState<XhsFeedTab>(() =>
    resolveInitialTab(tabFromUrl, platformFromUrl)
  );
  const mounted = useMounted();
  const [xhsNotes, setXhsNotes] = useState<XhsHotNote[]>([]);
  const [xhsLoading, setXhsLoading] = useState(true);
  const [xhsError, setXhsError] = useState<string | null>(null);

  const applyResponse = useCallback((res: Awaited<ReturnType<typeof apiGetInspirationPool>>) => {
    if (!res.success || !res.data?.length) {
      setXhsError(res.message ?? "暂无灵感，请稍后再试");
      setXhsNotes([]);
      return;
    }
    setXhsError(null);
    setXhsNotes(res.data);
    writeInspirationPoolCache(res.data, res.dataRevision);
    setXhsHotNotesClientCache(res);
  }, []);

  const loadNotes = useCallback(
    async (opts?: { force?: boolean; silent?: boolean }) => {
      const force = opts?.force ?? false;
      const silent = opts?.silent ?? false;

      let serverRevision: string | null = null;
      try {
        const meta = await apiGetXhsHotNotesMeta();
        serverRevision = meta.dataRevision;
      } catch {
        /* 元数据失败仍继续 */
      }

      if (!force) {
        const sessionHit = readInspirationPoolCache(0) ?? [];
        if (sessionHit.length >= INSPIRATION_POOL_TARGET) {
          setXhsNotes(sessionHit);
          setXhsError(null);
          setXhsLoading(false);
        }

        const legacyHit = getXhsHotNotesClientCache(serverRevision);
        if (legacyHit?.data?.length && legacyHit.data.length >= INSPIRATION_POOL_TARGET) {
          setXhsNotes(legacyHit.data);
          writeInspirationPoolCache(legacyHit.data, legacyHit.dataRevision);
          setXhsError(null);
          setXhsLoading(false);
          if (serverRevision && legacyHit.dataRevision === serverRevision) {
            return;
          }
        } else if (hasFullInspirationPoolCache()) {
          void apiGetInspirationPool(false).then(applyResponse);
          return;
        }
      }

      if (!silent) setXhsLoading(true);
      setXhsError(null);
      const res = await apiGetInspirationPool(force || Boolean(serverRevision));
      applyResponse(res);
      setXhsLoading(false);
    },
    [applyResponse]
  );

  useEffect(() => {
    if (!mounted) return;
    const cached = readInspirationPoolCache(0);
    if (cached?.length) {
      setXhsNotes(cached);
      setXhsError(null);
      if (cached.length >= INSPIRATION_POOL_TARGET) {
        setXhsLoading(false);
      }
    }
    void loadNotes({ force: false, silent: false });
  }, [loadNotes, mounted]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadNotes({ force: true, silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadNotes]);

  useEffect(() => {
    setXhsTab(resolveInitialTab(searchParams.get("tab"), searchParams.get("platform")));
  }, [searchParams]);

  const onRetry = () => {
    clearXhsHotNotesClientCache();
    void loadNotes({ force: true });
  };

  return (
    <AppShell homePage>
      <div className="inspiration-page-flow flex flex-col gap-2.5 pb-2">
        <HotTopicsPageHero />
        <XhsHotNotesFeed
          notes={xhsNotes}
          tab={xhsTab}
          onTabChange={setXhsTab}
          onRetry={onRetry}
          loading={xhsLoading}
          error={xhsError}
          toolbarCompact
        />
      </div>
    </AppShell>
  );
}
