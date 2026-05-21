"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";

export default function HistoryPage() {
  const { histories, tr } = useApp();

  return (
    <AppShell>
      <SectionTitle
        eyebrow="资产"
        title={tr("history")}
        desc="账号方案、今日视频、爆款同款记录。"
      />
      {histories.length ? (
        histories.map((h) => (
          <Card key={h.id} className="mb-3">
            <CardContent>
              <div className="text-xs font-bold text-orange-600">{h.type}</div>
              <div className="mt-2 font-bold">{h.topic}</div>
              <div className="mt-1 text-xs text-slate-500">{h.createdAt}</div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="mx-auto mb-3 text-orange-500" size={42} />
            <b>暂无历史</b>
            <p className="mt-2 text-sm text-slate-500">生成内容后会出现在这里。</p>
            <Link href="/create" className="mt-4 inline-block text-sm font-bold text-orange-600">
              去创作 →
            </Link>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
