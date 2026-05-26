"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

/** 管理后台模块切换（概览 / 订单 / 反馈 / 内容统计 / 热点配置 …） */
export function AdminTopTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[57px] z-30 border-b border-orange-100/80 bg-[#FFF7F0]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-6">
        <div className="flex min-w-max gap-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ADMIN_NAV.map((item) => {
            const active =
              "exact" in item && item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition",
                  active
                    ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-md"
                    : "bg-white text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50"
                )}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
