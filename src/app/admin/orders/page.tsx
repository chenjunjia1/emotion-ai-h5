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
  apiAdminListOrders,
  isClientServerMode,
  type AdminOrderRow,
} from "@/lib/client/server-api";
import { ORDER_STATUS_LABELS } from "@/lib/admin/nav";

const STATUS_FILTERS = [
  { id: "all", label: "全部" },
  { id: "pending", label: "待支付" },
  { id: "paid", label: "已付款" },
  { id: "failed", label: "失败" },
  { id: "closed", label: "已关闭" },
] as const;

export default function AdminOrdersPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminListOrders({
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

  return (
    <AdminShell title="订单管理" desc="查看支付订单与发放状态">
      <AdminCard>
        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStatus(f.id);
                setPage(1);
              }}
              className={
                status === f.id
                  ? "rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-3 py-1 text-xs font-medium text-white"
                  : "rounded-full border border-orange-100 px-3 py-1 text-xs text-slate-600"
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">加载中…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-orange-50 text-slate-500">
                  <th className="py-2 pr-3">订单号</th>
                  <th className="py-2 pr-3">用户</th>
                  <th className="py-2 pr-3">商品</th>
                  <th className="py-2 pr-3">金额</th>
                  <th className="py-2 pr-3">状态</th>
                  <th className="py-2">时间</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="border-b border-orange-50/80">
                    <td className="py-2.5 pr-3 font-mono text-[10px]">{o.orderNo}</td>
                    <td className="py-2.5 pr-3">{o.userMobile}</td>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{o.productName}</div>
                      <div className="text-slate-400">{o.productType}</div>
                    </td>
                    <td className="py-2.5 pr-3">¥{o.amount}</td>
                    <td className="py-2.5 pr-3">
                      <AdminStatusBadge status={o.status} map={ORDER_STATUS_LABELS} />
                      {o.benefitGranted && (
                        <span className="ml-1 text-[10px] text-emerald-600">已发放</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500">{o.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && (
              <p className="py-8 text-center text-sm text-slate-500">暂无订单</p>
            )}
          </div>
        )}

        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} />
      </AdminCard>
    </AdminShell>
  );
}
