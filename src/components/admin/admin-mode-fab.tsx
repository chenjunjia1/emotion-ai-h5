"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { canAccessOpsAdmin } from "@/lib/auth/login-allowlist";
import { cn } from "@/lib/utils";

/**
 * 用户端悬浮入口：管理员可一键回到 /admin
 * 显示在底部导航上方，admin 路由下自动隐藏
 */
export function AdminModeFab() {
  const pathname = usePathname();
  const { user } = useApp();

  if (!canAccessOpsAdmin(user)) return null;
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/onboarding")) return null;
  if (pathname === "/profile") return null;

  return (
    <Link
      href="/admin"
      className={cn(
        "fixed right-3 z-[45] flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-white shadow-lg transition active:scale-95",
        "bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]",
        "bg-gradient-to-r from-slate-700 to-slate-900 ring-2 ring-white/80"
      )}
      aria-label="运营后台"
    >
      <Shield size={14} />
      后台
    </Link>
  );
}
