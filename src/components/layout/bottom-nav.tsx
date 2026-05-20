"use client";

import { Clock, Home, UserRound, Wand2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "首页", href: "/", icon: Home },
  { id: "generate", label: "生成", href: "/generate", icon: Wand2 },
  { id: "history", label: "历史", href: "/history", icon: Clock },
  { id: "mine", label: "我的", href: "/mine", icon: UserRound },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/generate") {
    return pathname === "/generate" || pathname === "/result";
  }
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-rose-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3 text-xs text-stone-500">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                active && "font-medium text-rose-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
