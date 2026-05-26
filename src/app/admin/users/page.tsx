"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  AdminCard,
  AdminPagination,
  AdminShell,
} from "@/components/admin/admin-shell";
import { UserAdjustPanel, UserRowButton } from "@/components/admin/user-adjust-panel";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminListUsers,
  isClientServerMode,
  type AdminUserRow,
} from "@/lib/client/server-api";
import type { User } from "@/lib/types/v1";

export default function AdminUsersPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const limit = 15;

  const load = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminListUsers({ q: search || undefined, page, limit });
      if (r.error) {
        showToast(r.error === "forbidden" ? "无权限" : "加载失败");
        return;
      }
      setItems(r.items ?? []);
      setTotal(r.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [serverMode, search, page, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell title="用户管理" desc="搜索用户、调整额度与会员套餐">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminCard
            title="用户列表"
            action={
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setSearch(q.trim());
                }}
              >
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    className="w-40 rounded-lg border border-orange-100 py-1.5 pl-8 pr-2 text-xs sm:w-52"
                    placeholder="手机号 / 用户ID"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                >
                  搜索
                </button>
              </form>
            }
          >
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">加载中…</p>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">暂无用户</p>
            ) : (
              <div className="space-y-2">
                {items.map((u) => (
                  <UserRowButton
                    key={u.id}
                    user={u}
                    selected={selected?.id === u.id}
                    extra={u.createdAt}
                    onSelect={() => setSelected(u)}
                  />
                ))}
              </div>
            )}
            <AdminPagination
              page={page}
              total={total}
              limit={limit}
              onPage={setPage}
            />
          </AdminCard>
        </div>

        <div className="lg:col-span-2">
          <AdminCard title="调整用户">
            <UserAdjustPanel
              user={selected}
              onToast={showToast}
              onUpdated={(u) => setSelected(u)}
            />
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}
