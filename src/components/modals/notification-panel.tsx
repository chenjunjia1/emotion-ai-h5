"use client";

import Link from "next/link";
import { Bell, Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/contexts/app-context";
import { getTotalQuota } from "@/lib/v1/quota";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FUN_TIPS = [
  { href: "/topic-box", emoji: "🎲", key: "notifyPanelTip1" as const },
  { href: "/invite", emoji: "🎁", key: "notifyPanelTip2" as const },
  { href: "/hot-topics", emoji: "🔥", key: "notifyPanelTip3" as const },
] as const;

export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, orders, tr, setLoginOpen, setPayOrder } = useApp();

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );
  const lowQuota = user ? getTotalQuota(user) < 15 : false;

  if (!open) return null;

  const hasAlerts = pendingOrders.length > 0 || lowQuota;

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-black/35 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="notify-panel-title"
      >
        <div className="flex items-center justify-between border-b border-orange-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="notify-bell-wiggle flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F5] to-orange-50 text-[#FF7AAE]">
              <Bell size={18} />
            </span>
            <div>
              <h2 id="notify-panel-title" className="text-sm font-black text-slate-900">
                {tr("notifyPanelTitle")}
              </h2>
              <p className="text-[10px] text-slate-400">{tr("notifyPanelSubtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn("rounded-xl p-2", theme.softOrange)}
            aria-label={tr("close")}
          >
            <X size={18} className="text-orange-600" />
          </button>
        </div>

        <div className="max-h-[min(70vh,420px)] overflow-y-auto px-4 py-4">
          {!user ? (
            <div className="py-6 text-center">
              <p className="text-4xl">🔔</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{tr("notifyGuest")}</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setLoginOpen(true);
                }}
                className={cn(
                  "mt-4 rounded-2xl px-5 py-2.5 text-sm font-black text-white",
                  `bg-gradient-to-r ${theme.primary}`
                )}
              >
                {tr("loginTitle")}
              </button>
            </div>
          ) : (
            <>
              {pendingOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setPayOrder(o);
                    onClose();
                  }}
                  className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-orange-50 px-3 py-3 text-left ring-1 ring-[#FF7AAE]/20 active:scale-[0.99]"
                >
                  <span className="text-xl">💳</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800">{tr("notifyPanelPending")}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {o.productName} · ¥{o.amount}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold text-[#FF5C8A]">
                    {tr("orderTapToPay")}
                  </span>
                </button>
              ))}

              {lowQuota ? (
                <Link
                  href="/profile?pricing=1#membership"
                  onClick={onClose}
                  className="mb-3 flex items-center gap-3 rounded-2xl bg-amber-50 px-3 py-3 ring-1 ring-amber-200/80"
                >
                  <span className="text-xl">⚡</span>
                  <div className="flex-1">
                    <p className="text-xs font-black text-amber-900">{tr("notifyPanelLowQuota")}</p>
                    <p className="mt-0.5 text-[10px] text-amber-800/80">{tr("profileStoreDesc")}</p>
                  </div>
                  <Sparkles size={16} className="text-amber-600" />
                </Link>
              ) : null}

              {!hasAlerts ? (
                <div className="rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-[#FFF0F5] px-4 py-5 text-center">
                  <p className="notify-empty-float text-4xl">🌙</p>
                  <p className="mt-2 text-sm font-black text-slate-800">{tr("notifyPanelEmptyTitle")}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {tr("notifyPanelEmptyDesc")}
                  </p>
                </div>
              ) : null}

              <p className="mb-2 mt-3 text-[10px] font-bold text-slate-400">{tr("notifyPanelFunTitle")}</p>
              <div className="space-y-2">
                {FUN_TIPS.map((tip) => (
                  <Link
                    key={tip.key}
                    href={tip.href}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-orange-100 active:bg-orange-50"
                  >
                    <span>{tip.emoji}</span>
                    {tr(tip.key)}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
