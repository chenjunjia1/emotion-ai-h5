"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { HotTopicsFeed, type HotTopicsTabId } from "@/components/hot-topics/hot-topics-feed";
import { useApp } from "@/contexts/app-context";
import { apiGetHotTopics, apiRefreshHotTopics } from "@/lib/client/server-api";
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
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<HotTopicsTabId>("all");
  const [category, setCategory] = useState("全部");

  const loadTopics = useCallback(
    async (nextTab: HotTopicsTabId, nextCategory: string) => {
      const r = await apiGetHotTopics({
        platform: nextTab,
        category: nextCategory,
      });
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
      setMeta(
        r.meta
          ? {
              date: r.meta.date ?? new Date().toISOString().slice(0, 10),
              total: 0,
              updatedAt: r.meta.updatedAt ?? "08:00",
              stale: r.meta.stale,
              message: r.meta.note,
            }
          : null
      );
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await loadTopics(tab, category);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTopics, tab, category]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await apiRefreshHotTopics(true);
      await loadTopics(tab, category);
    } finally {
      setRefreshing(false);
    }
  };

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
      ) : (
        <HotTopicsFeed
          items={items}
          tab={tab}
          category={category}
          onTabChange={setTab}
          onCategoryChange={setCategory}
          onRefresh={() => void onRefresh()}
          refreshing={refreshing || loading}
          updatedAt={meta?.updatedAt ?? "08:00"}
        />
      )}

      {items.length > 0 && (
        <p className="mt-4 text-center text-[10px] text-[#8A94A6]">
          每天 8 点更新 · 抖音 / 微博 / 百度 / B站 / 头条 / 知乎 各平台热榜
        </p>
      )}
    </AppShell>
  );
}
