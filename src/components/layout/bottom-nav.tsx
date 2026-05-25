"use client";

import { Home, MessageCircle, Plus, UserRound, Flame } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  labelKey: "navHome" | "navHotTopics" | "navPublishPack" | "navAiChat" | "navProfile";
  href: string;
  icon: typeof Home;
  center?: boolean;
};

const navItems: NavItem[] = [
  { id: "home", labelKey: "navHome", href: "/", icon: Home },
  { id: "hot", labelKey: "navHotTopics", href: "/hot-topics", icon: Flame },
  { id: "pack", labelKey: "navPublishPack", href: "/publish-pack", icon: Home, center: true },
  { id: "chat", labelKey: "navAiChat", href: "/emotion-chat", icon: MessageCircle },
  { id: "profile", labelKey: "navProfile", href: "/profile", icon: UserRound },
];

function isNavActive(pathname: string, item: NavItem): boolean {
  const { href, id } = item;
  if (id === "home") return pathname === "/";
  if (id === "hot") {
    return pathname.startsWith("/hot-topics") || pathname.startsWith("/hot/");
  }
  if (id === "pack") {
    return pathname.startsWith("/publish-pack") || pathname.startsWith("/create");
  }
  if (id === "chat") {
    return pathname.startsWith("/emotion-chat");
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
  const { tr } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#FFE8F0]/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-5 items-end px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
        {navItems.map((item) => {
          const active = isNavActive(pathname, item);

          const prefetch = item.id === "home" || item.id === "chat";

          if (item.center) {
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={prefetch}
                className="relative -mt-2.5 flex flex-col items-center justify-end gap-0.5 active:scale-[0.96]"
                aria-label={tr(item.labelKey)}
              >
                <span
                  className={cn(
                    "nav-publish-fab flex h-11 w-11 items-center justify-center rounded-[14px] shadow-[0_4px_16px_rgba(255,36,66,0.32)] ring-2 ring-white transition-transform duration-150",
                    active
                      ? "bg-gradient-to-br from-[#FF3B5C] to-[#FF2442]"
                      : "bg-gradient-to-br from-[#FF4F8B] to-[#FF2442]"
                  )}
                >
                  <Plus size={22} strokeWidth={2.5} className="text-white" />
                </span>
                <span
                  className={cn(
                    "text-[9px] font-bold leading-none",
                    active ? "text-[#FF2442]" : "text-[#374151]"
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
                className={cn(active ? "text-[#FF4F8B]" : "text-[#6B7280]")}
              />
              <span
                className={cn(
                  "text-[10px] font-bold",
                  active ? "text-[#FF4F8B]" : "text-[#6B7280]"
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
