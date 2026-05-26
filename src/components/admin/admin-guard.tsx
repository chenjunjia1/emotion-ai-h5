"use client";

import Link from "next/link";
import { useApp } from "@/contexts/app-context";
import { canAccessOpsAdmin } from "@/lib/auth/login-allowlist";
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useApp();

  if (!canAccessOpsAdmin(user) || user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-bold text-slate-800">无管理权限</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          仅内测管理员账号（13798221796）可访问运营后台。
        </p>
        <Link
          href="/profile"
          className="mt-6 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-6 py-2.5 text-sm font-bold text-white"
        >
          返回我的
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
