"use client";

import Link from "next/link";
import { Bell, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, setLoginOpen, showToast, tr } = useApp();

  const remainQuota = user
    ? Math.max(0, user.dailyQuota - user.usedCount) + user.bonusQuota
    : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white/80 px-4 py-2.5 backdrop-blur-md",
        theme.border
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
              theme.primary,
              theme.shadow
            )}
          >
            <Sparkles size={18} />
          </div>
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-bold text-slate-900">
              {tr("appName")}
            </div>
            <div className="text-[10px] text-orange-600/80">{tr("appTagline")}</div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              showToast(user ? tr("notifyLoggedIn") : tr("notifyGuest"))
            }
            className={cn(
              "rounded-xl p-2 transition active:scale-95",
              theme.softRose
            )}
            aria-label={tr("notifyAria")}
          >
            <Bell size={17} className="text-rose-600" />
          </button>
          {user ? (
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-1.5 rounded-xl bg-gradient-to-r py-1.5 pl-2 pr-2.5 text-white shadow-sm transition active:scale-95",
                theme.primary
              )}
              title={`${user.mobile.slice(0, 3)}****${user.mobile.slice(-4)}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
                <UserRound size={14} />
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[11px] font-bold">{tr("navProfile")}</span>
                <span className="mt-0.5 text-[9px] font-medium text-white/85">
                  {tr("headerQuota")}
                  {remainQuota} · {tr("headerCoin")}
                  {user.videoCoin}
                </span>
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className={cn(
                "rounded-xl border bg-white px-2.5 py-1.5 text-xs font-bold text-orange-700 transition active:scale-95",
                theme.border
              )}
            >
              {tr("login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
