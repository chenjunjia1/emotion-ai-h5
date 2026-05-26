"use client";

import Link from "next/link";
import { ExternalLink, LayoutGrid } from "lucide-react";
import { ADMIN_APP_LINKS } from "@/lib/admin/app-links";
import { cn } from "@/lib/utils";

/** 侧边栏：切换到用户端各功能 */
export function AdminAppSwitcherSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mt-4 border-t border-orange-100 pt-4">
      <div className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <LayoutGrid size={12} />
        用户端预览
      </div>
      <div className="flex flex-col gap-0.5">
        {ADMIN_APP_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <Icon size={16} className="text-orange-500" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/"
        onClick={onNavigate}
        className="mt-2 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-3 py-2.5 text-sm font-bold text-white shadow-md"
      >
        <ExternalLink size={14} />
        进入 App 首页
      </Link>
    </div>
  );
}

/** 底部固定：手机端快速切换（不挡主内容太多） */
export function AdminAppSwitcherDock() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-orange-100/90 bg-white/95 px-2 py-2 backdrop-blur-md md:hidden">
      <p className="mb-1.5 text-center text-[10px] font-medium text-slate-400">
        切换用户端
      </p>
      <div className="flex gap-1 overflow-x-auto pb-[max(0.25rem,env(safe-area-inset-bottom))] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_APP_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5",
                "text-[10px] font-medium text-slate-600 active:bg-orange-50"
              )}
            >
              <Icon size={18} className="text-[#FF7AAE]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
