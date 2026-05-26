"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminCard,
  AdminPagination,
  AdminShell,
  AdminStatusBadge,
} from "@/components/admin/admin-shell";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminListFeedback,
  apiAdminUpdateFeedback,
  isClientServerMode,
} from "@/lib/client/server-api";
import { FEEDBACK_STATUS_LABELS } from "@/lib/admin/nav";

export default function AdminFeedbackPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const [status, setStatus] = useState<"all" | "pending" | "processed">("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<
    {
      id: string;
      type: string;
      contact: string;
      description: string;
      status: string;
      createdAt: string;
    }[]
  >([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 15;

  const load = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminListFeedback({
        status: status === "all" ? undefined : status,
        page,
        limit,
      });
      if (r.error) {
        showToast("加载失败");
        return;
      }
      setItems(r.items ?? []);
      setTotal(r.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [serverMode, status, page, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "pending" ? "processed" : "pending";
    const r = await apiAdminUpdateFeedback(id, next);
    if (r.ok) {
      showToast(next === "processed" ? "已标记处理" : "已改回待处理");
      void load();
    } else {
      showToast("操作失败");
    }
  };

  return (
    <AdminShell title="客服反馈" desc="处理用户提交的问题与建议">
      <AdminCard>
        <div className="mb-4 flex gap-2">
          {(["all", "pending", "processed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={
                status === s
                  ? "rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                  : "rounded-full border border-orange-100 px-3 py-1 text-xs text-slate-600"
              }
            >
              {s === "all" ? "全部" : FEEDBACK_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">加载中…</p>
        ) : (
          <ul className="space-y-3">
            {items.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-orange-100/80 bg-white p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{f.type}</span>
                    <AdminStatusBadge status={f.status} map={FEEDBACK_STATUS_LABELS} />
                  </div>
                  <span className="text-xs text-slate-400">{f.createdAt}</span>
                </div>
                {f.contact && (
                  <p className="mt-1 text-xs text-slate-500">联系：{f.contact}</p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{f.description}</p>
                <button
                  type="button"
                  onClick={() => void toggleStatus(f.id, f.status)}
                  className="mt-3 rounded-lg border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
                >
                  {f.status === "pending" ? "标记已处理" : "改回待处理"}
                </button>
              </li>
            ))}
            {!items.length && (
              <p className="py-8 text-center text-sm text-slate-500">暂无反馈</p>
            )}
          </ul>
        )}

        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} />
      </AdminCard>
    </AdminShell>
  );
}
