"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Bell, Crown } from "lucide-react";
import { ProfileUserAvatar } from "@/components/profile/profile-user-avatar";
import { NotificationPanel } from "@/components/modals/notification-panel";
import { useApp } from "@/contexts/app-context";
import { getTotalQuota } from "@/lib/v1/quota";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, setLoginOpen, tr, orders } = useApp();
  const [notifyOpen, setNotifyOpen] = useState(false);

  const remainTotal = user ? getTotalQuota(user) : 0;
  const notifyBadge = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders]
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-orange-100/60 bg-[#FFF7F0]/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/brand-avatar.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-2xl shadow-[0_4px_14px_rgba(255,107,107,0.35)]"
              priority
            />
            <div className="min-w-0 text-left leading-tight">
              <div className="truncate text-[14px] font-black text-slate-800">
                {tr("appName")}
              </div>
              <div className="truncate text-[10px] font-medium text-slate-500">
                {tr("headerSubtitle")}
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setNotifyOpen(true)}
              className="notify-bell-wiggle relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-500 shadow-sm ring-1 ring-orange-100/80 transition active:scale-95"
              aria-label={tr("notifyAria")}
            >
              <Bell size={18} />
              {notifyBadge > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5C8A] px-1 text-[9px] font-black text-white ring-2 ring-[#FFF7F0]">
                  {notifyBadge > 9 ? "9+" : notifyBadge}
                </span>
              ) : (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#FFC46B] ring-2 ring-[#FFF7F0]" />
              )}
            </button>
            {user ? (
              user.plan === "free" ? (
                <div className="flex items-stretch overflow-hidden rounded-full shadow-md ring-2 ring-[#FFE8A8]/70">
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-1.5 py-1.5 pl-1.5 pr-2 text-white",
                      `bg-gradient-to-r ${theme.primaryBtn}`
                    )}
                  >
                    <ProfileUserAvatar
                      userId={user.id}
                      className="h-7 w-7 ring-2 ring-white/40"
                    />
                    <span className="flex flex-col items-start leading-none">
                      <span className="text-[11px] font-bold">{tr("navProfile")}</span>
                      <span className="mt-0.5 text-[9px] font-medium text-white/90">
                        {remainTotal} {tr("headerQuota")}
                      </span>
                    </span>
                  </Link>
                  <Link
                    href="/profile?pricing=1#membership"
                    className="flex items-center justify-center bg-gradient-to-b from-[#FFE8A8] to-[#FFC46B] px-2.5 text-[10px] font-black text-[#FF5C2A] active:scale-95"
                  >
                    {tr("headerUpgrade")}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/profile?pricing=1#membership"
                    className="flex h-9 items-center gap-0.5 rounded-xl bg-gradient-to-r from-[#FFE8A8] to-[#FFC46B] px-2 text-[10px] font-black text-[#E85D04] shadow-sm ring-1 ring-[#FFE8A8]/80 active:scale-95"
                  >
                    <Crown size={12} />
                    {tr("profileRenewCta")}
                  </Link>
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-1.5 rounded-full bg-gradient-to-r py-1.5 pl-1.5 pr-3 text-white shadow-md",
                      theme.primaryBtn
                    )}
                  >
                    <ProfileUserAvatar
                      userId={user.id}
                      className="h-7 w-7 ring-2 ring-white/40"
                    />
                    <span className="flex flex-col items-start leading-none">
                      <span className="text-[11px] font-bold">{tr("navProfile")}</span>
                      <span className="mt-0.5 text-[9px] font-medium text-white/90">
                        {remainTotal} {tr("headerQuota")}
                      </span>
                    </span>
                  </Link>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className={cn(
                  "rounded-full bg-gradient-to-r px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95",
                  theme.primaryBtn
                )}
              >
                {tr("login")}
              </button>
            )}
          </div>
        </div>
      </header>
      <NotificationPanel open={notifyOpen} onClose={() => setNotifyOpen(false)} />
    </>
  );
}
