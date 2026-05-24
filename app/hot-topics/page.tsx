"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContentFormChips } from "@/components/v1/content-form-chips";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct, type HotTopicItem } from "@/hooks/use-product";
import { apiGetHotTopics } from "@/lib/client/server-api";
import { QUOTA_COST, STORAGE_HOT_TOPICS } from "@/lib/constants/v1";
import { getTotalQuota, hotTopicPackAffordableCount } from "@/lib/v1/quota";
import { HOT_TOPICS_POOL_SIZE } from "@/lib/hot-topics/daily-pool";
import {
  GOAL_VALUES,
  PLATFORM_VALUES,
  STYLE_VALUES,
  TRACK_VALUES,
} from "@/lib/i18n/form-options";
import { mockHotTopics } from "@/lib/mock/content-v1";
import { readHotTopicsForToday, todayKey } from "@/lib/hot-topics/read-cached";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FORMAT_OPTIONS = ["口播", "图文", "短视频", "直播切片"] as const;

type HotMeta = {
  date: string;
  total: number;
  updatedAt: string;
  sources: string[];
  note: string;
};

export default function HotTopicsPage() {
  const router = useRouter();
  const { tr, showToast, user } = useApp();
  const { hotTopics, generatePublishPack } = useProduct();
  const { run, busy } = useAsyncAction();
  const [items, setItems] = useState<HotTopicItem[]>(() => readHotTopicsForToday(0));
  const [batch, setBatch] = useState(0);
  const [meta, setMeta] = useState<HotMeta | null>(() => {
    const initial = readHotTopicsForToday(0);
    const key = todayKey();
    return {
      date: key,
      total: initial.length,
      updatedAt: `${key} 08:00`,
      sources: ["抖音", "小红书", "视频号"],
      note: "加载中…",
    };
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>(PLATFORM_VALUES[0]);
  const [track, setTrack] = useState<string>(TRACK_VALUES[3]);
  const [goal, setGoal] = useState<string>(GOAL_VALUES[0]);
  const [style, setStyle] = useState<string>(STYLE_VALUES[0]);
  const [format, setFormat] = useState<string>(FORMAT_OPTIONS[0]);
  const [usingDemoPool, setUsingDemoPool] = useState(false);

  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null;
  const hotPackCost = QUOTA_COST.hot_topic_pack ?? 3;
  const totalQuota = user ? getTotalQuota(user) : 0;
  const hotAffordable = user ? hotTopicPackAffordableCount(user) : 0;
  const total = items.length > 0 ? items.length : (meta?.total ?? HOT_TOPICS_POOL_SIZE);

  const loadTopics = useCallback(
    async (nextBatch: number) => {
      const key = todayKey();
      try {
        const r = await apiGetHotTopics(nextBatch);
        if (r.items?.length) {
          setUsingDemoPool(false);
          setItems(r.items);
          setMeta({
            ...(r.meta ?? {
              date: key,
              updatedAt: `${key} 08:00`,
              sources: ["抖音", "小红书", "视频号"],
              note: tr("hotTopicsMetaNote"),
            }),
            total: r.items.length,
          });
          localStorage.setItem(
            STORAGE_HOT_TOPICS,
            JSON.stringify({ date: key, items: r.items, batch: nextBatch })
          );
          return;
        }
      } catch {
        /* 走本地兜底 */
      }
      const local = mockHotTopics(key, nextBatch);
      setUsingDemoPool(true);
      setItems(local);
      setMeta({
        date: key,
        total: local.length,
        updatedAt: `${key} 08:00`,
        sources: ["抖音", "小红书", "视频号"],
        note: "本地热点库",
      });
      localStorage.setItem(
        STORAGE_HOT_TOPICS,
        JSON.stringify({ date: key, items: local, batch: nextBatch })
      );
    },
    [tr]
  );

  useEffect(() => {
    if (hotTopics.length > 0) setItems(hotTopics);
  }, [hotTopics]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await loadTopics(0);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTopics]);

  useEffect(() => {
    if (items.length && !selectedId) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = batch + 1;
      await loadTopics(next);
      setBatch(next);
      setSelectedId(items[0]?.id ?? null);
      showToast(tr("hotTopicsRefreshDone"));
    } finally {
      setRefreshing(false);
    }
  }, [batch, items, loadTopics, showToast, tr]);

  const onSelect = (item: HotTopicItem) => {
    setSelectedId(item.id);
    setTrack(item.track || track);
    if (item.format && FORMAT_OPTIONS.includes(item.format as (typeof FORMAT_OPTIONS)[number])) {
      setFormat(item.format);
    }
  };

  const onGenerate = () =>
    void run(async () => {
      if (!selected) return;
      const pack = await generatePublishPack({
        topic: selected.title,
        platform,
        track,
        goal,
        style,
        withXhs: platform === "小红书" || format === "图文",
        quotaAction: "hot_topic_pack",
      });
      if (pack) {
        showToast(tr("publishPackBtn"));
        router.push(`/publish-pack?topic=${encodeURIComponent(selected.title)}`);
      }
    });

  const heatClass = (heat: string) =>
    heat === "爆"
      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white"
      : heat === "高"
        ? "bg-rose-50 text-rose-600"
        : "bg-orange-50 text-orange-600";

  return (
    <AppShell>
      <SectionTitle
        eyebrow="🔥"
        title={tr("hotTopicsPageTitle")}
        desc={tr("hotTopicsPageDesc")}
      />

      <Card className="mb-3 border-[#FF7AAE]/25 bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE]">
        <CardContent className="py-3">
          <p className="text-xs font-black text-[#FF5C8A]">
            {tr("hotTopicsMetaLine")
              .replace("{total}", String(total))
              .replace("{date}", meta?.updatedAt ?? "今日 08:00")}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
            {tr("hotTopicsMetaSources")}：{meta?.sources?.join(" · ") ?? "抖音 · 小红书 · 视频号"}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">{meta?.note ?? tr("hotTopicsMetaNote")}</p>
          {usingDemoPool ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
              {tr("hotTopicsDemoNote")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mb-3 border-orange-100/80 bg-orange-50/40">
        <CardContent className="space-y-1 py-3 text-[10px] text-slate-600">
          <p className="font-black text-orange-700">{tr("hotTopicsRulesTitle")}</p>
          <p>· {tr("hotTopicsRule1")}</p>
          <p>· {tr("hotTopicsRule2")}</p>
          <p>· {tr("hotTopicsRule3")}</p>
          <p className="font-bold text-[#FF5C8A]">
            {tr("hotTopicsQuotaHint")
              .replace("{cost}", String(hotPackCost))
              .replace("{total}", String(totalQuota))
              .replace("{count}", String(hotAffordable))}
          </p>
        </CardContent>
      </Card>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          {tr("hotTopicsPick")}（{items.length}）
        </span>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={refreshing}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#FF7AAE] ring-1 ring-[#FF7AAE]/30 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {tr("hotTopicsRefresh")}
        </button>
      </div>

      <div className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-0.5">
        {loading && items.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">{tr("loading")}</p>
        ) : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-4 text-center">
            <p className="text-xs text-slate-600">热点列表加载失败</p>
            <button
              type="button"
              className="mt-2 text-[11px] font-bold text-[#FF7AAE]"
              onClick={() => void loadTopics(batch)}
            >
              点击重试
            </button>
          </div>
        ) : null}
        {items.map((item) => {
          const active = selected?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "w-full rounded-2xl border p-3 text-left transition active:scale-[0.99]",
                active
                  ? "border-[#FF7AAE] bg-[#FFF0F5] shadow-md ring-2 ring-[#FF7AAE]/30"
                  : "border-orange-100/80 bg-white/95"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-black leading-snug text-slate-900">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black",
                    heatClass(item.heat)
                  )}
                >
                  {item.heat}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{item.desc}</p>
              <p className="mt-1.5 text-[10px] font-semibold text-[#FF7AAE]">
                {item.track} · {item.format}
              </p>
            </button>
          );
        })}
      </div>

      {selected ? (
        <Card className="mt-4 border-orange-100/80">
          <CardContent className="space-y-4 pt-4">
            <p className="text-xs font-black text-slate-800">
              {tr("hotTopicsSelected")}：{selected.title}
            </p>
            <ContentFormChips
              platform={platform}
              track={track}
              goal={goal}
              style={style}
              onPlatform={setPlatform}
              onTrack={setTrack}
              onGoal={setGoal}
              onStyle={setStyle}
            />
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-slate-600">{tr("hotTopicsFormat")}</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMAT_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      format === f
                        ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white"
                        : "bg-white text-slate-600 ring-1 ring-orange-100"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className={cn("w-full rounded-2xl py-3.5 font-black text-white", theme.primary)}
              disabled={busy || hotAffordable < 1}
              onClick={onGenerate}
            >
              <Sparkles size={16} className="mr-1" />
              {busy
                ? tr("loading")
                : tr("hotTopicsGenBtn").replace("{cost}", String(hotPackCost))}
            </Button>
            <Link
              href={`/publish-pack?topic=${encodeURIComponent(selected.title)}`}
              className="block text-center text-[11px] font-bold text-[#FF7AAE]"
            >
              {tr("hotTopicsGoPack")}
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}
