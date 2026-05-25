"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, Sparkles, Zap } from "lucide-react";
import { ProfileUserAvatar } from "@/components/profile/profile-user-avatar";
import { NotificationPanel } from "@/components/modals/notification-panel";
import { useApp } from "@/contexts/app-context";
import { useAppNotifications } from "@/hooks/use-app-notifications";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

export function AppHeader({ homePage = false }: { homePage?: boolean }) {
  const pathname = usePathname();
  const isHome = homePage || pathname === "/";
  const { user, setLoginOpen, tr, orders } = useApp();
  const [notifyOpen, setNotifyOpen] = useState(false);

  const remainTotal = user ? getTotalQuota(user) : 128;
  const pendingOrderCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders]
  );
  const { showDailyDot, showPendingBadge, pendingCount, markRead } =
    useAppNotifications(pendingOrderCount);

  const openNotify = () => {
    markRead();
    setNotifyOpen(true);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 px-4 py-3 backdrop-blur-xl",
          isHome
            ? "border-b border-[#FFE8F0]/60 bg-[#FFF5F8]/92"
            : "border-b border-orange-100/60 bg-[#FFF7F0]/95"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-[0_4px_14px_rgba(255,79,139,0.35)]",
                isHome
                  ? "bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D]"
                  : "bg-gradient-to-br from-[#FF6B6B] to-[#FF7AAE]"
              )}
            >
              <Sparkles size={18} className="text-white" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 text-left leading-tight">
              <div className="truncate text-[14px] font-black text-[#1F2937]">
                {tr("appName")}
              </div>
              {!isHome ? (
                <div className="truncate text-[10px] font-medium text-[#8A94A6]">
                  {tr("headerSubtitle")}
                </div>
              ) : null}
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openNotify}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ring-1 active:scale-95 transition",
                showDailyDot
                  ? "notify-bell-unread bg-gradient-to-br from-[#FFF8FB] to-white text-[#FF4F8B] ring-[#FF4F8B]/35"
                  : "bg-white text-[#6B7280] ring-[#FFE8F0]"
              )}
              aria-label={tr("notifyAria")}
            >
              <Bell
                size={18}
                className={cn(showDailyDot && "notify-bell-wiggle")}
                strokeWidth={showDailyDot ? 2.4 : 2}
              />
              {showPendingBadge ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5C8A] px-1 text-[9px] font-black text-white ring-2 ring-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              ) : showDailyDot ? (
                <span className="notify-dot-pulse absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#FF4F8B] ring-2 ring-white" />
              ) : null}
            </button>

            <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#FFF3E8] to-[#FFE8CC] px-2.5 py-1.5 text-[10px] font-black text-[#FF8C42] shadow-sm ring-1 ring-[#FFE0C8]/80">
              <Zap size={11} className="fill-[#FF9A4D] text-[#FF8C42]" />
              {remainTotal} {tr("headerInspirationUnit")}
            </span>

            {user ? (
              <Link href="/profile" className="active:scale-95">
                <ProfileUserAvatar userId={user.id} className="h-9 w-9 ring-2 ring-[#FFD0E8]" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB8D0] to-[#FF9A4D] text-[11px] font-black text-white shadow-sm active:scale-95"
              >
                我
              </button>
            )}
          </div>
        </div>
      </header>
      <NotificationPanel
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        onOpened={markRead}
      />
    </>
  );
}
