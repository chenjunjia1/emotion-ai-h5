"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Loader2, RefreshCw } from "lucide-react";
import {
  AdminCard,
  AdminShell,
  AdminStatGrid,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminContentStats,
  apiAdminRefreshHotTopics,
  isClientServerMode,
  type AdminContentStats,
} from "@/lib/client/server-api";

export default function AdminContentPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const [stats, setStats] = useState<AdminContentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminContentStats();
      if (r.stats) setStats(r.stats);
      else showToast("加载失败");
    } finally {
      setLoading(false);
    }
  }, [serverMode, showToast]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const onRefresh = async () => {
    if (
      !confirm(
        "将触发热点全量刷新（TianAPI → AI 加工 → 入库），可能耗时 1–3 分钟，确定继续？"
      )
    ) {
      return;
    }
    setRefreshing(true);
    try {
      const r = await apiAdminRefreshHotTopics();
      if (r.error) {
        showToast(r.error === "forbidden" ? "无权限" : "刷新失败");
        return;
      }
      showToast(`刷新完成 · ${r.count ?? 0} 条 · ${r.source ?? ""}`);
      void loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AdminShell
      title="内容统计"
      desc="每日热点、灵感标题、推送广播的数据统计与手动刷新"
    >
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => void loadStats()}
          className="flex items-center gap-1 rounded-xl border border-orange-100 px-3 py-2 text-xs text-slate-600"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          刷新统计
        </button>
        <Button
          disabled={refreshing || !serverMode}
          onClick={() => void onRefresh()}
          className="gap-1"
        >
          {refreshing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Flame size={16} />
          )}
          手动刷新今日热点
        </Button>
      </div>

      {stats && (
        <>
          <AdminStatGrid
            items={[
              {
                label: "今日有效热点",
                value: stats.hotTopicsActive,
                hint: stats.dateKey,
              },
              { label: "热点库总量", value: stats.hotTopicsTotal },
              { label: "今日灵感标题", value: stats.inspirationTitles },
              { label: "今日小红书笔记", value: stats.xhsNotes },
            ]}
          />

          <AdminCard title="最近推送广播" className="mt-6">
            {stats.latestPush ? (
              <div className="text-sm">
                <p className="font-bold text-slate-800">🔥 {stats.latestPush.title}</p>
                <p className="mt-1 text-slate-600">{stats.latestPush.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {stats.latestPush.dateKey} · {stats.latestPush.createdAt}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                暂无推送记录。定时任务成功后会在 push_broadcasts 表写入。
              </p>
            )}
          </AdminCard>

          <AdminCard title="说明" className="mt-4">
            <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
              <li>自动刷新：Vercel Cron / GitHub Actions 每日调用 refresh-hot-topics</li>
              <li>手动刷新：上方按钮，限 5 次/分钟（防误触）</li>
              <li>
                卡片文案配置请用顶栏「热点配置」「小红书灵感」
              </li>
            </ul>
          </AdminCard>
        </>
      )}
    </AdminShell>
  );
}
