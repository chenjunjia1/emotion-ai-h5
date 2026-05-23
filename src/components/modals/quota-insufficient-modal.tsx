"use client";

import Link from "next/link";
import { Crown, Gift, X } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function QuotaInsufficientModal() {
  const { quotaModalOpen, setQuotaModalOpen, quotaModalDetail, tr } = useApp();
  if (!quotaModalOpen) return null;

  const detailText =
    quotaModalDetail != null
      ? tr("quotaNeedMore")
          .replace("{need}", String(quotaModalDetail.need))
          .replace("{have}", String(quotaModalDetail.have))
      : tr("quotaInsufficient");

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className={cn(
          "w-full max-w-md rounded-3xl border bg-white p-5 shadow-xl",
          theme.border
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{tr("quotaModalTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{detailText}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#FF7AAE]">
              {tr("quotaModalProHint")}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400"
            onClick={() => setQuotaModalOpen(false)}
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          <Link
            href="/profile?pricing=1"
            onClick={() => setQuotaModalOpen(false)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white",
              `bg-gradient-to-r ${theme.primary}`
            )}
          >
            <Crown size={18} /> {tr("quotaUpgrade")}
          </Link>
          <Link
            href="/invite"
            onClick={() => setQuotaModalOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 py-3 text-sm font-bold text-orange-700"
          >
            <Gift size={18} /> {tr("quotaInvite")}
          </Link>
        </div>
      </div>
    </div>
  );
}
