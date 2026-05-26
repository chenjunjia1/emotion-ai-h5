"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  AdminCard,
  AdminShell,
  AdminStatGrid,
} from "@/components/admin/admin-shell";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminOverview,
  isClientServerMode,
  type AdminOverview,
} from "@/lib/client/server-api";
import { ADMIN_NAV } from "@/lib/admin/nav";

export default function AdminDashboardPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminOverview();
      if (r.overview) setOverview(r.overview);
      else if (r.error === "forbidden") showToast("无管理员权限");
      else showToast("加载失败");
    } finally {
      setLoading(false);
    }
  }, [serverMode, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell
      title="数据概览"
      desc={
        serverMode
          ? "全站核心指标与最近动态"
          : "请开启 NEXT_PUBLIC_BACKEND_MODE=server 后使用完整后台"
      }
    >
      {!serverMode && (
        <AdminCard title="提示">
          <p className="text-sm text-slate-600">
            当前为本地演示模式，请在 .env 中设置{" "}
            <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_BACKEND_MODE=server</code>{" "}
            并配置 Supabase 后刷新。
          </p>
        </AdminCard>
      )}

      {serverMode && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              刷新
            </button>
          </div>

          {overview && (
            <>
              <AdminStatGrid
                items={[
                  { label: "注册用户", value: overview.stats.users },
                  { label: "订单总数", value: overview.stats.orders },
                  { label: "已付款", value: overview.stats.paidOrders },
                  { label: "生成记录", value: overview.stats.generations },
                  { label: "视频任务", value: overview.stats.videoTasks },
                  { label: "客服反馈", value: overview.stats.feedbacks },
                  { label: "风控记录", value: overview.stats.riskRecords },
                ]}
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <AdminCard title="快捷入口">
                  <div className="grid grid-cols-2 gap-2">
                    {ADMIN_NAV.filter((n) => n.href !== "/admin").map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        className="rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-3 text-sm font-medium text-orange-800 hover:bg-orange-100"
                      >
                        {n.label}
                      </Link>
                    ))}
                  </div>
                </AdminCard>

                <AdminCard title="最近风控">
                  {overview.recentRisks.length === 0 ? (
                    <p className="text-sm text-slate-500">暂无</p>
                  ) : (
                    <ul className="space-y-2">
                      {overview.recentRisks.slice(0, 5).map((r) => (
                        <li
                          key={r.id}
                          className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-900"
                        >
                          <b>{r.contentType}</b> · {r.riskLevel} · {r.createdAt}
                          <p className="mt-0.5 line-clamp-2 text-rose-700">{r.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminCard>

                <AdminCard title="最近反馈" className="lg:col-span-2">
                  {overview.recentFeedbacks.length === 0 ? (
                    <p className="text-sm text-slate-500">暂无</p>
                  ) : (
                    <ul className="space-y-2">
                      {overview.recentFeedbacks.slice(0, 5).map((f) => (
                        <li
                          key={f.id}
                          className="rounded-lg border border-orange-50 px-3 py-2 text-xs"
                        >
                          <span className="font-bold">{f.type}</span> · {f.status} ·{" "}
                          {f.createdAt}
                          <p className="mt-0.5 text-slate-600">{f.description}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/admin/feedback"
                    className="mt-3 inline-block text-xs font-bold text-orange-600"
                  >
                    查看全部反馈 →
                  </Link>
                </AdminCard>
              </div>
            </>
          )}
        </>
      )}
    </AdminShell>
  );
}
