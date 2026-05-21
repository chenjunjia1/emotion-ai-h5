"use client";

import { Home, UserRound, Video, Wallet, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", labelKey: "navHome" as const, href: "/", icon: Home },
  { id: "account", labelKey: "navAccount" as const, href: "/account-package", icon: UserRound },
  { id: "create", labelKey: "navCreate" as const, href: "/create", icon: Wand2 },
  { id: "video", labelKey: "navVideo" as const, href: "/ai-video", icon: Video },
  { id: "profile", labelKey: "navProfile" as const, href: "/profile", icon: Wallet },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/create") {
    return (
      pathname.startsWith("/create") ||
      pathname.startsWith("/daily-video") ||
      pathname.startsWith("/viral-copy")
    );
  }
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const { tr } = useApp();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-xl",
        theme.border
      )}
    >
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-5 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  active
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-md ${theme.shadow}`
                    : "text-slate-400"
                )}
              >
                <Icon size={20} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  active ? theme.textActive : "text-slate-400"
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
