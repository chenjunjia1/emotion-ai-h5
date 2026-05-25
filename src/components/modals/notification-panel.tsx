"use client";

import Link from "next/link";
import { Bell, Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/contexts/app-context";
import { useAppNotifications } from "@/hooks/use-app-notifications";
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
  onOpened,
}: {
  open: boolean;
  onClose: () => void;
  onOpened?: () => void;
}) {
  const { user, orders, tr, setLoginOpen, setPayOrder } = useApp();

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
    [orders]
  );
  const { dailyMessage } = useAppNotifications(pendingOrders.length);
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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F5] to-orange-50 text-[#FF7AAE]">
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
            onClick={() => {
              onOpened?.();
              onClose();
            }}
            className={cn("rounded-xl p-2", theme.softOrange)}
            aria-label={tr("close")}
          >
            <X size={18} className="text-orange-600" />
          </button>
        </div>

        <div className="max-h-[min(70vh,480px)] overflow-y-auto px-4 py-4">
          {!user ? (
            <div className="py-6 text-center">
              <p className="text-4xl">🔔</p>
              <p className="mt-2 text-sm font-bold text-slate-800">{tr("notifyGuest")}</p>
              <p className="mt-1 text-[11px] text-slate-500">{tr("notifyGuestDailyHint")}</p>
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
              <div className="notify-sms-bubble relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] p-4 text-white shadow-[0_8px_24px_rgba(255,79,139,0.28)]">
                <span
                  className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/15 blur-xl"
                  aria-hidden
                />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black">
                    {tr("notifyDailyTag")} · {dailyMessage.tag}
                  </span>
                  <span className="text-[9px] font-medium text-white/80">
                    {tr("notifyDailyTime")}
                  </span>
                </div>
                <p className="relative mt-2 text-[22px] leading-none">{dailyMessage.emoji}</p>
                <p className="relative mt-2 text-[14px] font-black leading-snug">
                  {dailyMessage.title}
                </p>
                <p className="relative mt-1.5 text-[12px] leading-relaxed text-white/92">
                  {dailyMessage.body}
                </p>
                {dailyMessage.href && dailyMessage.cta ? (
                  <Link
                    href={dailyMessage.href}
                    onClick={() => {
                      onOpened?.();
                      onClose();
                    }}
                    className="relative mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[11px] font-black text-[#FF4F8B] shadow-md active:scale-[0.98]"
                  >
                    {dailyMessage.cta}
                    <span aria-hidden>→</span>
                  </Link>
                ) : null}
              </div>

              {pendingOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setPayOrder(o);
                    onOpened?.();
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
                  onClick={() => {
                    onOpened?.();
                    onClose();
                  }}
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
                <p className="mb-2 text-center text-[10px] text-slate-400">
                  {tr("notifyPanelEmptyDesc")}
                </p>
              ) : null}

              <p className="mb-2 mt-1 text-[10px] font-bold text-slate-400">{tr("notifyPanelFunTitle")}</p>
              <div className="space-y-2">
                {FUN_TIPS.map((tip) => (
                  <Link
                    key={tip.key}
                    href={tip.href}
                    onClick={() => {
                      onOpened?.();
                      onClose();
                    }}
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
