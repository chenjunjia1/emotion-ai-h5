"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { HistoryDetailView } from "@/components/history/history-detail-view";
import { useApp } from "@/contexts/app-context";
import { isClientServerMode } from "@/lib/client/server-api";
import { STORAGE_HISTORIES } from "@/lib/constants/v1";
import type { HistoryItem } from "@/lib/types/v1";

function loadLocalHistories(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_HISTORIES);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function DetailInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { histories, tr, user, refreshUser } = useApp();

  useEffect(() => {
    if (isClientServerMode() && user) void refreshUser();
  }, [user, refreshUser]);

  const item = useMemo(() => {
    const fromState = histories.find((h) => h.id === id);
    if (fromState) return fromState;
    return loadLocalHistories().find((h) => h.id === id) ?? null;
  }, [histories, id]);

  return (
    <AppShell>
      {!item ? (
        <div className="py-16 text-center">
          <p className="text-sm font-bold text-slate-700">{tr("historyNotFound")}</p>
          <Link href="/history" className="mt-4 inline-block text-sm font-bold text-[#FF7AAE]">
            {tr("historyBackLibrary")}
          </Link>
        </div>
      ) : (
        <HistoryDetailView item={item} />
      )}
    </AppShell>
  );
}

export default function HistoryDetailPage() {
  const { tr } = useApp();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
          {tr("loading")}
        </div>
      }
    >
      <DetailInner />
    </Suspense>
  );
}
