"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { HotTopicsFeed } from "@/components/hot-topics/hot-topics-feed";
import { useApp } from "@/contexts/app-context";
import { apiGetHotTopics } from "@/lib/client/server-api";
import type { HotTopicItem } from "@/lib/hot-topics/types";
import { sortByHeat } from "@/lib/content/heat-level";

type HotMeta = {
  date: string;
  total: number;
  updatedAt: string;
  stale?: boolean;
  message?: string;
};

export default function HotTopicsPage() {
  const { tr } = useApp();
  const [items, setItems] = useState<HotTopicItem[]>([]);
  const [meta, setMeta] = useState<HotMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTopics = useCallback(async () => {
    const r = await apiGetHotTopics(0);
    if (r.items?.length) {
      setItems(sortByHeat(r.items));
      setMeta({
        date: r.meta?.date ?? new Date().toISOString().slice(0, 10),
        total: r.meta?.total ?? r.items.length,
        updatedAt: r.meta?.updatedAt ?? "08:00",
        stale: r.meta?.stale,
        message: r.meta?.note,
      });
      return;
    }
    setItems([]);
    setMeta(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await loadTopics();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTopics]);

  return (
    <AppShell>
      <SectionTitle
        eyebrow="🔥"
        title={tr("hotTopicsPageTitle")}
        desc={tr("hotTopicsPageDesc")}
      />

      {meta?.stale && meta.message ? (
        <p className="mb-3 rounded-2xl bg-[#FFF3E8] px-3 py-2 text-center text-[11px] font-bold text-[#FF9A4D]">
          {meta.message}
        </p>
      ) : null}

      {loading && items.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500">{tr("loading")}</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#8A94A6]">
          今日热点正在更新中，请稍后再来看看。
        </p>
      ) : (
        <HotTopicsFeed
          items={items}
          onRefresh={() => void loadTopics()}
          refreshing={loading}
          updatedAt={meta?.updatedAt ?? "08:00"}
        />
      )}

      {items.length > 0 && (
        <p className="mt-4 text-center text-[10px] text-[#8A94A6]">
          每天 8 点更新 · 数据来自 DailyHotApi + AI 筛选
        </p>
      )}
    </AppShell>
  );
}
