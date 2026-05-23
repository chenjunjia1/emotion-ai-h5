"use client";

import { BookOpen, Home, Sparkles, UserRound, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", labelKey: "navHome" as const, href: "/", icon: Home },
  { id: "create", labelKey: "navCreate" as const, href: "/create", icon: Sparkles },
  { id: "review", labelKey: "navReview" as const, href: "/review", icon: ClipboardList },
  { id: "library", labelKey: "navLibrary" as const, href: "/history", icon: BookOpen },
  { id: "profile", labelKey: "navProfile" as const, href: "/profile", icon: UserRound },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/create") {
    return (
      pathname.startsWith("/create") ||
      pathname.startsWith("/publish-pack") ||
      pathname.startsWith("/topic-box") ||
      pathname.startsWith("/hot-topics") ||
      pathname.startsWith("/title-gacha") ||
      pathname.startsWith("/account-test") ||
      pathname.startsWith("/account-package")
    );
  }
  if (href === "/review") {
    return pathname.startsWith("/review") || pathname.startsWith("/emotion-chat");
  }
  if (href === "/profile") {
    return (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/support")
    );
  }
  if (href === "/history") {
    return pathname.startsWith("/history");
  }
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const { tr } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-100/70 bg-[#FFF7F0]/95 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-5 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch
              className="flex flex-col items-center justify-center gap-0.5 active:scale-95"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-[0_4px_12px_rgba(255,122,174,0.35)]"
                    : "text-slate-400"
                )}
              >
                <Icon size={20} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  active ? "text-[#FF7AAE]" : "text-slate-400"
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
