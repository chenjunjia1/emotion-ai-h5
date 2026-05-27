"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { AdminAppSwitcherDock, AdminAppSwitcherSidebar } from "./admin-app-switcher";
import { AdminTopTabs } from "./admin-top-tabs";
import { AdminGuard } from "./admin-guard";
import { useApp } from "@/contexts/app-context";

export function AdminShell({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useApp();
  const [mobileNav, setMobileNav] = useState(false);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
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
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-md"
                : "text-slate-600 hover:bg-orange-50"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#FFF7F0]">
        <header className="sticky top-0 z-40 border-b border-orange-100/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl p-2 md:hidden"
                onClick={() => setMobileNav((v) => !v)}
                aria-label="菜单"
              >
                {mobileNav ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link
                href="/"
                className="hidden items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 md:flex"
              >
                <ArrowLeft size={14} />
                用户端
              </Link>
              <div>
                <h1 className="text-base font-bold text-slate-900 md:text-lg">
                  AI灵感创作 · 管理后台
                </h1>
                <p className="text-[11px] text-slate-500">
                  {user?.mobile} · {title}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 md:hidden"
            >
              用户端
            </Link>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl gap-0 md:gap-6 md:px-6 md:py-6">
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 border-r border-orange-100 bg-white p-4 pt-20 transition md:static md:block md:w-56 md:rounded-2xl md:border md:pt-4 md:shadow-sm",
              mobileNav ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}
          >
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 md:hidden">
              管理模块
            </p>
            <nav className="flex flex-col gap-1 md:hidden">
              <NavLinks onNavigate={() => setMobileNav(false)} />
            </nav>
            <p className="mb-1 mt-4 hidden px-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 md:block">
              管理模块
            </p>
            <nav className="hidden flex-col gap-1 md:flex">
              <NavLinks onNavigate={() => setMobileNav(false)} />
            </nav>
            <AdminAppSwitcherSidebar onNavigate={() => setMobileNav(false)} />
          </aside>

          {mobileNav && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              aria-label="关闭菜单"
              onClick={() => setMobileNav(false)}
            />
          )}

          <main className="min-w-0 flex-1 px-4 py-5 pb-24 md:px-0 md:py-0 md:pb-0">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
            </div>
            {children}
          </main>
        </div>

        <AdminAppSwitcherDock />
      </div>
    </AdminGuard>
  );
}

export function AdminStatGrid({
  items,
}: {
  items: { label: string; value: number | string; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className={cn(theme.card, "p-4")}>
          <div className="text-[11px] text-slate-500">{item.label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{item.value}</div>
          {item.hint && (
            <div className="mt-0.5 text-[10px] text-slate-400">{item.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function AdminCard({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(theme.card, "overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-orange-50 px-4 py-3">
          {title && <h3 className="font-bold text-slate-800">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function AdminPagination({
  page,
  total,
  limit,
  onPage,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
      <span>
        共 {total} 条 · 第 {page}/{pages} 页
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-orange-100 px-3 py-1 disabled:opacity-40"
        >
          上一页
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-orange-100 px-3 py-1 disabled:opacity-40"
        >
          下一页
        </button>
      </div>
    </div>
  );
}

export function AdminStatusBadge({
  status,
  map,
}: {
  status: string;
  map: Record<string, string>;
}) {
  const label = map[status] ?? status;
  const tone =
    status === "paid" || status === "processed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "pending"
        ? "bg-amber-50 text-amber-700"
        : status === "failed"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-600";

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", tone)}>
      {label}
    </span>
  );
}
