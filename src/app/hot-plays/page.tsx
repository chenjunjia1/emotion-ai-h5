"use client";

import Link from "next/link";
import {
  Briefcase,
  Camera,
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  ShoppingBag,
  UserCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { HOT_PLAYS } from "@/lib/constants/hot-plays";
import { useApp } from "@/contexts/app-context";
import { HOT_PLAY_I18N } from "@/lib/i18n/form-options";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Heart> = {
  Heart,
  Camera,
  ShoppingBag,
  MessageCircle,
  Briefcase,
  MapPin,
  UserCircle,
};

export default function HotPlaysPage() {
  const { tr } = useApp();

  return (
    <AppShell>
      <Link
        href="/"
        className={cn(
          "mb-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600",
        )}
      >
        <ChevronLeft size={16} />
        {tr("backHome")}
      </Link>
      <SectionTitle
        eyebrow={tr("hotPlaysEyebrow")}
        title={tr("hotPlaysTitle")}
        desc={tr("hotPlaysDesc")}
      />
      <div className="space-y-3">
        {HOT_PLAYS.map((item) => {
          const Icon = ICONS[item.icon] ?? Heart;
          const i18n = HOT_PLAY_I18N[item.id];
          return (
            <div
              key={item.id}
              className={cn(
                "overflow-hidden rounded-3xl border bg-white shadow-sm",
                theme.border,
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3 bg-gradient-to-r p-4",
                  item.grad,
                )}
              >
                <div className={cn("rounded-2xl p-2.5", theme.softOrange)}>
                  <Icon size={24} className="text-[#F9735B]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900">
                    {i18n ? tr(i18n.title) : item.title}
                  </div>
                  <div className="text-xs text-orange-700/80">
                    {i18n ? tr(i18n.sub) : item.sub}
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-slate-600">
                    {i18n ? tr(i18n.hint) : item.hint}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                <Link
                  href={item.accountHref}
                  className={cn(
                    "rounded-2xl py-2.5 text-center text-xs font-bold text-white active:scale-[0.98]",
                    "bg-gradient-to-r",
                    theme.primary,
                  )}
                >
                  {tr("hotPlaysGenAccount")}
                </Link>
                <Link
                  href={item.createHref}
                  className={cn(
                    "rounded-2xl border py-2.5 text-center text-xs font-bold text-orange-700 active:scale-[0.98]",
                    theme.border,
                    theme.softOrange,
                  )}
                >
                  {tr("hotPlaysGenDaily")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
