"use client";

import Link from "next/link";
import {
  Bot,
  ChevronRight,
  Crown,
  Flame,
  Heart,
  MessageCircle,
  ShoppingBag,
  Camera,
  UserRound,
  Wand2,
} from "lucide-react";
import { HomeBanner } from "@/components/home/home-banner";
import { AppShell } from "@/components/layout/app-shell";
import { HOT_PLAYS_HOME } from "@/lib/constants/hot-plays";
import { useApp } from "@/contexts/app-context";
import { HOT_PLAY_I18N } from "@/lib/i18n/form-options";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { I18nKey } from "@/lib/i18n";

const HOT_ICONS = {
  Heart,
  Camera,
  ShoppingBag,
  MessageCircle,
} as const;

export default function HomePage() {
  const { tr } = useApp();

  const cards: {
    href: string;
    titleKey: I18nKey;
    descKey: I18nKey;
    tagKey: I18nKey;
    icon: typeof UserRound;
    soft: string;
    iconColor: string;
  }[] = [
    {
      href: "/account-package",
      titleKey: "featureAccount",
      descKey: "homeCardAccountDesc",
      tagKey: "homeTagAccount",
      icon: UserRound,
      soft: theme.softOrange,
      iconColor: "text-orange-500",
    },
    {
      href: "/create?tab=daily",
      titleKey: "featureDaily",
      descKey: "homeCardDailyDesc",
      tagKey: "homeTagDaily",
      icon: Wand2,
      soft: theme.softRose,
      iconColor: "text-rose-500",
    },
    {
      href: "/create?tab=viral",
      titleKey: "featureViral",
      descKey: "homeCardViralDesc",
      tagKey: "homeTagViral",
      icon: Flame,
      soft: theme.softOrange,
      iconColor: "text-[#F9735B]",
    },
    {
      href: "/ai-video",
      titleKey: "featureVideo",
      descKey: "homeCardVideoDesc",
      tagKey: "homeTagVideo",
      icon: Bot,
      soft: theme.softRose,
      iconColor: "text-[#D9468F]",
    },
  ];

  return (
    <AppShell>
      <HomeBanner />

      <section className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={cn(
                "rounded-3xl border bg-white p-3.5 text-left shadow-sm active:scale-[0.98]",
                theme.border,
                theme.shadow
              )}
            >
              <div className="mb-2.5 flex items-start justify-between gap-1">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl",
                    c.soft
                  )}
                >
                  <Icon size={20} className={c.iconColor} />
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold",
                    c.soft
                  )}
                >
                  {tr(c.tagKey)}
                </span>
              </div>
              <div className="text-[13px] font-bold leading-snug text-slate-900">
                {tr(c.titleKey)}
              </div>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">{tr(c.descKey)}</p>
            </Link>
          );
        })}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{tr("hotPlaysTitle")}</h2>
          <Link
            href="/hot-plays"
            className="flex items-center text-xs font-bold text-orange-600 active:opacity-70"
          >
            {tr("more")} <ChevronRight size={14} />
          </Link>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
          {HOT_PLAYS_HOME.map((item) => {
            const Icon =
              HOT_ICONS[item.icon as keyof typeof HOT_ICONS] ?? Heart;
            const i18n = HOT_PLAY_I18N[item.id];
            return (
              <Link
                key={item.id}
                href={item.accountHref}
                className={cn(
                  "w-[132px] shrink-0 overflow-hidden rounded-3xl border bg-white shadow-sm transition active:scale-[0.98]",
                  theme.border,
                )}
              >
                <div
                  className={cn(
                    "flex h-[72px] items-center justify-center bg-gradient-to-br",
                    item.grad,
                  )}
                >
                  <Icon size={30} className="text-[#F9735B]" strokeWidth={1.5} />
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-bold text-slate-900">
                    {i18n ? tr(i18n.title) : item.title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-orange-600/80">
                    {i18n ? tr(i18n.sub) : item.sub}
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold text-rose-500">
                    {tr("goAccount")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Link
        href="/profile?pricing=1"
        className={cn(
          "flex items-center gap-3 rounded-3xl border bg-gradient-to-r p-4 from-orange-50 to-rose-50",
          theme.border
        )}
      >
        <div className={cn("rounded-2xl p-2.5", theme.softOrange)}>
          <Crown className="text-orange-600" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-900">{tr("proBannerTitle")}</div>
          <p className="mt-0.5 text-[11px] leading-5 text-slate-600">
            {tr("proBannerDesc")}
          </p>
        </div>
        <ChevronRight className="shrink-0 text-orange-400" size={20} />
      </Link>
    </AppShell>
  );
}
