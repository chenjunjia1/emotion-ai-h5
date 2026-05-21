"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";

export default function AdminPage() {
  const { user, orders, tasks, histories } = useApp();

  if (!user || user.role !== "admin") {
    return (
      <AppShell>
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            仅演示用：前端判断 admin，无服务端鉴权，不可用于生产运营后台。
            <br />
            Mock 测试号：13800138000（末尾 0000）。
            <br />
            <Link href="/profile" className="mt-4 inline-block font-bold text-orange-600">
              返回我的
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionTitle
        eyebrow="Admin"
        title="后台管理"
        desc="V1 Mock：查看用户、订单、任务、历史与风控概览。"
      />
      <Card className="mb-3">
        <CardContent>
          <div className="text-xs text-slate-500">当前用户</div>
          <div className="font-bold">{user.mobile}</div>
          <div className="mt-1 text-xs">
            {user.plan} · 额度 {user.usedCount}/{user.dailyQuota} · 币 {user.videoCoin}
          </div>
        </CardContent>
      </Card>
      <Card className="mb-3">
        <CardContent>
          <h3 className="mb-2 font-bold">订单 ({orders.length})</h3>
          <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[10px]">
            {JSON.stringify(orders.slice(0, 5), null, 2)}
          </pre>
        </CardContent>
      </Card>
      <Card className="mb-3">
        <CardContent>
          <h3 className="mb-2 font-bold">视频任务 ({tasks.length})</h3>
          <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[10px]">
            {JSON.stringify(tasks.slice(0, 5), null, 2)}
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="mb-2 font-bold">生成历史 ({histories.length})</h3>
          <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[10px]">
            {JSON.stringify(histories.slice(0, 5), null, 2)}
          </pre>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-slate-400">
        完整 admin_logs / 手动加减额度 → 执行 002 迁移后接 Supabase API
      </p>
    </AppShell>
  );
}
