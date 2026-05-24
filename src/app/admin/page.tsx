"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminAdjustUser,
  apiAdminOverview,
  isClientServerMode,
  type AdminOverview,
} from "@/lib/client/server-api";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types/v1";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="text-[10px] text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user, orders, tasks, histories, showToast } = useApp();
  const serverMode = isClientServerMode();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustQuota, setAdjustQuota] = useState("");
  const [adjustBonus, setAdjustBonus] = useState("");
  const [adjustCoin, setAdjustCoin] = useState("");

  const loadOverview = useCallback(async () => {
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
    if (user?.role === "admin" && serverMode) void loadOverview();
  }, [user?.role, serverMode, loadOverview]);

  if (!user || user.role !== "admin") {
    return (
      <AppShell>
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            {serverMode
              ? "请使用已在 Vercel 配置 ADMIN_MOBILES 白名单的管理员手机号登录。"
              : "演示模式：本地登录手机号末尾 0000 可体验 admin（仅开发）。"}
            <br />
            <Link href="/profile" className="mt-4 inline-block font-bold text-orange-600">
              返回我的
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const displayOrders = serverMode && overview ? overview.recentOrders : orders;
  const displayTasks = serverMode && overview ? overview.recentTasks : tasks;
  const displayHistories =
    serverMode && overview ? overview.recentHistories : histories;

  const onAdjust = async () => {
    if (!selectedUser) {
      showToast("请先在上方点选一位用户");
      return;
    }
    const r = await apiAdminAdjustUser(selectedUser.id, {
      dailyQuota: adjustQuota ? Number(adjustQuota) : undefined,
      bonusQuota: adjustBonus ? Number(adjustBonus) : undefined,
      videoCoin: adjustCoin ? Number(adjustCoin) : undefined,
      reason: "admin_panel",
    });
    if (r.user) {
      showToast(`已更新 ${r.user.mobile}`);
      setSelectedUser(r.user);
      void loadOverview();
    } else {
      showToast("调整失败");
    }
  };

  return (
    <AppShell>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle
          eyebrow="Admin"
          title="运营后台"
          desc={
            serverMode
              ? "服务端鉴权 · 全站数据概览 · 手动调额度"
              : "本地演示数据（未接 Supabase）"
          }
        />
        {serverMode && (
          <button
            type="button"
            onClick={() => void loadOverview()}
            className={cn("rounded-2xl p-2", theme.softOrange)}
            aria-label="刷新"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-orange-600" />
            ) : (
              <RefreshCw size={18} className="text-orange-600" />
            )}
          </button>
        )}
      </div>

      {serverMode && overview && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <StatCard label="用户数" value={overview.stats.users} />
          <StatCard label="订单" value={overview.stats.orders} />
          <StatCard label="已付款" value={overview.stats.paidOrders} />
          <StatCard label="成片任务" value={overview.stats.videoTasks} />
          <StatCard label="生成记录" value={overview.stats.generations} />
          <StatCard label="客服反馈" value={overview.stats.feedbacks} />
        </div>
      )}

      {serverMode && overview && (
        <Card className="mb-4">
          <CardContent>
            <h3 className="mb-1 font-bold">最近用户</h3>
            <p className="mb-2 text-xs text-slate-500">点击下方用户行选中，再填写额度并保存</p>
            {overview.recentUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUser(u);
                  setAdjustQuota(String(u.dailyQuota));
                  setAdjustBonus(String(u.bonusQuota));
                  setAdjustCoin(String(u.videoCoin));
                }}
                className={cn(
                  "mb-2 w-full rounded-2xl p-3 text-left text-xs leading-6",
                  selectedUser?.id === u.id
                    ? "bg-orange-100 ring-2 ring-orange-300"
                    : "bg-orange-50"
                )}
              >
                <b>{u.mobile}</b> · {u.plan} · 额度 {u.usedCount}/{u.dailyQuota}{" "}
                · 币 {u.videoCoin}
              </button>
            ))}
            {!overview.recentUsers.length && (
              <p className="text-sm text-slate-500">暂无用户</p>
            )}
          </CardContent>
        </Card>
      )}

      {serverMode && (
        <Card className="mb-4">
          <CardContent className="space-y-3">
            <h3 className="font-bold">手动调额</h3>
            <p
              className={cn(
                "rounded-xl px-3 py-2 text-xs",
                selectedUser ? "bg-orange-50 text-orange-800" : "bg-slate-50 text-slate-500"
              )}
            >
              {selectedUser
                ? `已选：${selectedUser.mobile}（${selectedUser.plan}）`
                : "请先在上方「最近用户」里点选一位用户"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Field label="日额度">
                <input
                  className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
                  value={adjustQuota}
                  onChange={(e) => setAdjustQuota(e.target.value)}
                  placeholder="40"
                />
              </Field>
              <Field label="奖励额度">
                <input
                  className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
                  value={adjustBonus}
                  onChange={(e) => setAdjustBonus(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="视频币">
                <input
                  className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
                  value={adjustCoin}
                  onChange={(e) => setAdjustCoin(e.target.value)}
                  placeholder="100"
                />
              </Field>
            </div>
            <Button className="w-full" onClick={() => void onAdjust()}>
              保存调整
            </Button>
          </CardContent>
        </Card>
      )}

      {serverMode && overview && (
        <>
          <Card className="mb-3">
            <CardContent>
              <h3 className="mb-2 font-bold">风控记录</h3>
              {overview.recentRisks.map((r) => (
                <div
                  key={r.id}
                  className="mb-2 rounded-2xl bg-rose-50 p-2.5 text-[11px] leading-5"
                >
                  <b>{r.contentType}</b> · {r.riskLevel}
                  <br />
                  {r.content}
                </div>
              ))}
              {!overview.recentRisks.length && (
                <p className="text-sm text-slate-500">暂无</p>
              )}
            </CardContent>
          </Card>
          <Card className="mb-3">
            <CardContent>
              <h3 className="mb-2 font-bold">客服反馈</h3>
              {overview.recentFeedbacks.map((f) => (
                <div
                  key={f.id}
                  className="mb-2 rounded-2xl bg-slate-50 p-2.5 text-[11px] leading-5"
                >
                  <b>{f.type}</b> · {f.status}
                  <br />
                  {f.description}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="mb-3">
        <CardContent>
          <div className="text-xs text-slate-500">当前管理员</div>
          <div className="font-bold">{user.mobile}</div>
        </CardContent>
      </Card>
      <Card className="mb-3">
        <CardContent>
          <h3 className="mb-2 font-bold">订单 ({displayOrders.length})</h3>
          <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[10px]">
            {JSON.stringify(displayOrders.slice(0, 5), null, 2)}
          </pre>
        </CardContent>
      </Card>
      <Card className="mb-3">
        <CardContent>
          <h3 className="mb-2 font-bold">视频任务 ({displayTasks.length})</h3>
          <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[10px]">
            {JSON.stringify(displayTasks.slice(0, 5), null, 2)}
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="mb-2 font-bold">生成历史 ({displayHistories.length})</h3>
          <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[10px]">
            {JSON.stringify(displayHistories.slice(0, 5), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </AppShell>
  );
}
