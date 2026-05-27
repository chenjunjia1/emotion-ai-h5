"use client";

import { Home, MessageCircle, Plus, UserRound, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppUi } from "@/contexts/app-ui-context";
import { useTreeholeNightSynced } from "@/lib/hooks/use-treehole-night";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  labelKey: "navHome" | "navInspiration" | "navCreate" | "navAiChat" | "navProfile";
  href: string;
  icon: typeof Home;
  center?: boolean;
};

const navItems: NavItem[] = [
  { id: "home", labelKey: "navHome", href: "/", icon: Home },
  { id: "inspiration", labelKey: "navInspiration", href: "/inspiration", icon: Sparkles },
  { id: "create", labelKey: "navCreate", href: "/create", icon: Plus, center: true },
  { id: "chat", labelKey: "navAiChat", href: "/emotion-chat", icon: MessageCircle },
  { id: "profile", labelKey: "navProfile", href: "/profile", icon: UserRound },
];

function isNavActive(
  pathname: string,
  item: NavItem,
  chatMode: string | null
): boolean {
  const { href, id } = item;
  const isStrategistChat =
    pathname.startsWith("/emotion-chat") && chatMode === "strategist";
  const isTreeholeChat =
    pathname.startsWith("/emotion-chat") &&
    chatMode !== "strategist" &&
    chatMode !== "assistant";

  if (id === "home") return pathname === "/";
  if (id === "inspiration") {
    return (
      pathname.startsWith("/inspiration") ||
      pathname.startsWith("/hot-topics") ||
      pathname.startsWith("/hot/")
    );
  }
  if (id === "create") {
    return (
      pathname.startsWith("/create") ||
      pathname.startsWith("/publish-pack") ||
      pathname.startsWith("/expression/") ||
      isStrategistChat
    );
  }
  if (id === "chat") {
    return isTreeholeChat;
  }
  if (id === "profile") {
    return (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/support") ||
      pathname.startsWith("/history")
    );
  }
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatMode = pathname.startsWith("/emotion-chat")
    ? searchParams.get("mode")
    : null;
  const { tr } = useAppUi();
  const treeholeNight = useTreeholeNightSynced();
  const isTreeholeChat =
    pathname.startsWith("/emotion-chat") &&
    chatMode !== "strategist" &&
    chatMode !== "assistant";
  const darkNav = isTreeholeChat && treeholeNight;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl",
        darkNav
          ? "border-violet-900/45 bg-[#120a24]/96"
          : "border-[#FFE8F0]/80 bg-white/95"
      )}
    >
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-5 items-end px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
        {navItems.map((item) => {
          const active = isNavActive(pathname, item, chatMode);

          const prefetch = item.id === "home" || item.id === "chat";

          if (item.center) {
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={prefetch}
                className="nav-create-tab relative -mt-2 flex flex-col items-center justify-end gap-0.5 pb-0.5 active:scale-[0.96]"
                aria-label={tr(item.labelKey)}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "nav-create-fab relative flex h-10 w-10 items-center justify-center rounded-[10px] transition-transform duration-200",
                    active && "nav-create-fab--active",
                    darkNav && "nav-create-fab--night"
                  )}
                >
                  <Plus size={20} strokeWidth={2.75} className="relative z-[1] text-white" />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-black leading-none",
                    active
                      ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] bg-clip-text text-transparent"
                      : darkNav
                        ? "text-[#C4B5FD]"
                        : "text-[#374151]"
                  )}
                >
                  {tr(item.labelKey)}
                </span>
              </Link>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={prefetch}
              className="flex flex-col items-center justify-center gap-0.5 py-1 active:scale-95 transition-transform duration-150"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 2}
                className={cn(
                  active ? "text-[#FF4F8B]" : darkNav ? "text-[#9CA3AF]" : "text-[#6B7280]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold",
                  active ? "text-[#FF4F8B]" : darkNav ? "text-[#9CA3AF]" : "text-[#6B7280]"
                )}
              >
                {tr(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
