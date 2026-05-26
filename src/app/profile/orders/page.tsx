"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileOrdersSection } from "@/components/profile/profile-orders-section";
import { useApp } from "@/contexts/app-context";

export default function ProfileOrdersPage() {
  const { user, orders, tr, setLoginOpen } = useApp();

  if (!user) {
    return (
      <AppShell>
        <div className="py-12 text-center">
          <p className="text-sm text-slate-600">{tr("pleaseLogin")}</p>
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="mt-4 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-6 py-2.5 text-sm font-bold text-white"
          >
            {tr("loginTitle")}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-3">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#FF7AAE]"
        >
          <ChevronLeft size={16} />
          {tr("profileOrdersBack")}
        </Link>
        <h1 className="mt-2 text-lg font-black text-slate-900">
          {tr("profileOrdersPageTitle")}
        </h1>
        <p className="mt-1 text-[11px] text-slate-500">{tr("profileOrdersPageDesc")}</p>
      </div>

      <ProfileOrdersSection orders={orders} tr={tr} variant="full" />
    </AppShell>
  );
}
