"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, Sparkles, Zap } from "lucide-react";
import { ProfileUserAvatar } from "@/components/profile/profile-user-avatar";
import { NotificationPanel } from "@/components/modals/notification-panel";
import { useAppUi } from "@/contexts/app-ui-context";
import { useAppNotifications } from "@/hooks/use-app-notifications";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

function resolveHeaderCopy(
  pathname: string,
  isHome: boolean,
  chatMode: string | null,
  tr: (key: "appName" | "headerSubtitle" | "navInspiration") => string
): { title: string; subtitle: string | null } {
  if (isHome) {
    return { title: tr("appName"), subtitle: null };
  }
  if (pathname.startsWith("/inspiration") || pathname.startsWith("/hot-topics")) {
    return { title: tr("navInspiration"), subtitle: null };
  }
  if (pathname.startsWith("/emotion-chat") && chatMode === "strategist") {
    return { title: "聊天军师", subtitle: "高情商回复 · 私域话术" };
  }
  if (pathname.startsWith("/emotion-chat")) {
    return { title: "情绪树洞", subtitle: "陪聊搭子 · 帮你回 · 情绪文案" };
  }
  if (pathname.startsWith("/profile")) {
    return { title: "我的", subtitle: "编辑资料 · 成长等级 · 创作资产" };
  }
  return { title: tr("appName"), subtitle: tr("headerSubtitle") };
}

export function AppHeader({ homePage = false }: { homePage?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatMode = pathname.startsWith("/emotion-chat")
    ? searchParams.get("mode")
    : null;
  const isHome = homePage && pathname === "/";
  /** 首页 / 灵感等奶油壳：顶栏与 home-shell-bg 一致 */
  const creamChrome = homePage;
  const { user, setLoginOpen, tr, pendingOrderCount } = useAppUi();
  const [notifyOpen, setNotifyOpen] = useState(false);

  const remainTotal = user ? getTotalQuota(user) : 0;
  const { showDailyDot, showPendingBadge, pendingCount, markRead } =
    useAppNotifications(pendingOrderCount);

  const headerCopy = resolveHeaderCopy(pathname, isHome, chatMode, tr);

  const openNotify = () => {
    markRead();
    setNotifyOpen(true);
  };

  const notifyBadgeLabel =
    pendingCount > 0 ? (pendingCount > 9 ? "9+" : String(pendingCount)) : showDailyDot ? "1" : null;

  const bellBtn = (
    <button
      type="button"
      onClick={openNotify}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 active:scale-95 transition",
        isHome ? "h-10 w-10" : "h-9 w-9",
        showDailyDot
          ? "notify-bell-unread text-[#FF4F8B] ring-[#FF4F8B]/35"
          : "text-[#6B7280] ring-[#FFE8F0]"
      )}
      aria-label={tr("notifyAria")}
    >
      <Bell
        size={isHome ? 20 : 18}
        className={cn(showDailyDot && "notify-bell-wiggle")}
        strokeWidth={showDailyDot ? 2.4 : 2}
      />
      {notifyBadgeLabel ? (
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-full bg-[#FF4F8B] font-black text-white ring-2 ring-white",
            isHome ? "h-[18px] min-w-[18px] px-1 text-[10px]" : "h-4 min-w-4 px-1 text-[9px]"
          )}
        >
          {notifyBadgeLabel}
        </span>
      ) : null}
    </button>
  );

  const quotaPill = user ? (
    <Link
      href="/profile?pricing=1"
      className={cn(
        "flex h-10 shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#FFF3E8] to-[#FFE8CC] font-black text-[#FF8C42] shadow-sm ring-1 ring-[#FFE0C8]/80 active:scale-[0.98]",
        isHome ? "px-2.5 text-[11px]" : "px-2.5 text-[10px]"
      )}
    >
      <Zap
        size={isHome ? 14 : 11}
        className="fill-[#FF9A4D] text-[#FF8C42]"
        strokeWidth={2.5}
      />
      {remainTotal} {tr("headerInspirationUnit")}
    </Link>
  ) : null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 px-4 backdrop-blur-xl",
          creamChrome
            ? "home-header-soft border-b border-[#FFE8F0]/50 bg-[#FFF5F0]/80 py-2.5"
            : "border-b border-orange-100/60 bg-[#FFF7F0]/95 py-3"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between",
            isHome ? "gap-3" : "gap-2"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex min-w-0 items-center",
              isHome ? "max-w-[48%] gap-2" : "flex-1 gap-2.5"
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FF9A4D] shadow-[0_4px_14px_rgba(255,79,139,0.32)]",
                isHome ? "h-10 w-10" : "h-9 w-9"
              )}
            >
              <Sparkles size={isHome ? 20 : 18} className="text-white" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <div
                className={cn(
                  "truncate font-black leading-none text-[#1F2937]",
                  isHome ? "text-[16px] tracking-tight" : "text-[14px]"
                )}
              >
                {headerCopy.title}
              </div>
              {headerCopy.subtitle ? (
                <div className="mt-0.5 truncate text-[10px] font-medium leading-none text-[#8A94A6]">
                  {headerCopy.subtitle}
                </div>
              ) : null}
            </div>
          </Link>

          <div
            className={cn(
              "flex shrink-0 items-center",
              isHome ? "gap-2" : "gap-1.5"
            )}
          >
            {bellBtn}
            {user ? (
              <>
                {quotaPill}
                <Link href="/profile" className="active:scale-95" aria-label={tr("navProfile")}>
                  <ProfileUserAvatar
                    userId={user.id}
                    className={cn("ring-2 ring-[#FFD0E8]", isHome ? "h-10 w-10" : "h-9 w-9")}
                  />
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className={cn(
                  "flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] font-black text-white shadow-sm active:scale-95",
                  isHome ? "px-3.5 py-2 text-[11px]" : "px-3 py-1.5 text-[11px]"
                )}
              >
                {tr("headerGuestLoginCta")}
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
