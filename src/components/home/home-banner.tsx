"use client";

import Link from "next/link";
import { Bot, Flame, Play, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function HomeBanner() {
  const { tr } = useApp();

  const miniCards = [
    { href: "/create?tab=daily", label: "今日视频", icon: Wand2 },
    { href: "/create?tab=viral", label: "爆款同款", icon: Flame },
    { href: "/ai-video", label: "AI成片", icon: Bot },
  ];

  return (
    <section
      className={cn(
        "relative min-h-[300px] overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-4 text-white shadow-xl",
        theme.primary,
        theme.shadow
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-[#FDBA74]/40 blur-3xl" />
      <div className="pointer-events-none absolute right-6 top-20 h-24 w-24 rounded-full bg-[#F9A8D4]/35 blur-2xl" />

      <div className="relative flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
            <Sparkles size={12} />
            AI短视频运营助手
          </div>
          <h1 className="text-[1.15rem] font-bold leading-snug tracking-tight sm:text-xl">
            {tr("homeTitle")}
          </h1>
          <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-white/92 sm:text-xs sm:leading-6">
            {tr("homeSubtitle")}
          </p>
          <Link
            href="/account-package"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#D9468F] shadow-lg shadow-orange-300/30 active:scale-[0.98]"
          >
            <Play size={16} className="fill-[#D9468F] text-[#D9468F]" />
            {tr("homeCta")}
          </Link>
        </div>

        <div className="relative shrink-0">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[1.25rem] bg-white/15 backdrop-blur-md ring-2 ring-white/25">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FDBA74] to-[#F9A8D4] shadow-inner">
              <Bot size={32} className="text-white" strokeWidth={1.5} />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#F9735B] shadow-md">
            <Sparkles size={14} />
          </div>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        {miniCards.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white/15 px-2 py-2.5 backdrop-blur-sm ring-1 ring-white/20 active:scale-[0.97]"
          >
            <Icon size={16} />
            <span className="text-[10px] font-bold">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
