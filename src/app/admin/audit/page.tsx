"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminCard,
  AdminPagination,
  AdminShell,
} from "@/components/admin/admin-shell";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminListAudit,
  isClientServerMode,
  type AdminAuditLog,
} from "@/lib/client/server-api";

const ACTION_LABELS: Record<string, string> = {
  adjust_user: "调整用户",
  update_feedback: "更新反馈",
  refresh_hot_topics: "刷新热点",
};

export default function AdminAuditPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminListAudit({ page, limit });
      if (r.error) {
        showToast("加载失败");
        return;
      }
      setItems(r.items ?? []);
      setTotal(r.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [serverMode, page, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell title="审计日志" desc="管理员操作记录（调额、反馈处理、内容刷新等）">
      <AdminCard>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">加载中…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-orange-50 text-slate-500">
                  <th className="py-2 pr-3">时间</th>
                  <th className="py-2 pr-3">管理员</th>
                  <th className="py-2 pr-3">操作</th>
                  <th className="py-2 pr-3">对象</th>
                  <th className="py-2">备注</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.id} className="border-b border-orange-50/80">
                    <td className="py-2.5 pr-3 text-slate-500">{log.createdAt}</td>
                    <td className="py-2.5 pr-3">{log.adminMobile}</td>
                    <td className="py-2.5 pr-3 font-medium">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="py-2.5 pr-3">
                      {log.targetType}
                      {log.targetId && (
                        <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                          {log.targetId.length > 24
                            ? `${log.targetId.slice(0, 24)}…`
                            : log.targetId}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500">{log.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && (
              <p className="py-8 text-center text-sm text-slate-500">暂无审计记录</p>
            )}
          </div>
        )}

        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} />
      </AdminCard>
    </AdminShell>
  );
}
