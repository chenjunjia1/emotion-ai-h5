"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Crown,
  Dices,
  Flame,
  FolderOpen,
  Gift,
  ListChecks,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Sun,
  TrendingUp,
  UserRound,
  Wand2,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { apiGetHotTopics } from "@/lib/client/server-api";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { I18nKey } from "@/lib/i18n";

function SectionHead({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      {action}
    </div>
  );
}

function PlayGridCard({
  href,
  title,
  desc,
  icon: Icon,
  grad,
  iconBg,
}: {
  href: string;
  title: string;
  desc: string;
  icon: typeof Wand2;
  grad: string;
  iconBg?: string;
}) {
  const { tr } = useApp();
  return (
    <Link
      href={href}
      className={cn(
        "home-grid-card group flex flex-col rounded-[1.25rem] border border-orange-100/80 bg-white p-3.5 shadow-[0_4px_20px_rgba(249,115,22,0.08)]",
        "transition active:scale-[0.97] hover:shadow-[0_8px_28px_rgba(249,115,22,0.12)]"
      )}
    >
      <div
        className={cn(
          "mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-4 ring-white",
          grad,
          iconBg
        )}
      >
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <div className="text-[13px] font-bold leading-snug text-slate-900">{title}</div>
      <p className="mt-1 flex-1 text-[10px] leading-[1.45] text-slate-500">{desc}</p>
      <span className="mt-2.5 text-[11px] font-bold text-[#F9735B] group-hover:text-[#D9468F]">
        {tr("homeGoUse")} ›
      </span>
    </Link>
  );
}

/** 首页核心玩法：双列网格（对齐设计稿） */
export function HomeCoreEntries() {
  const { tr } = useApp();
  const entries = [
    {
      href: "/topic-box",
      title: tr("featTopicBox"),
      desc: tr("featTopicBoxDesc"),
      icon: Gift,
      grad: "from-[#FB7185] to-[#F9735B]",
    },
    {
      href: "/publish-pack",
      title: tr("featPublishPack"),
      desc: tr("featPublishPackDesc"),
      icon: Wand2,
      grad: "from-[#FBBF24] to-[#F9735B]",
    },
    {
      href: "/hot-topics",
      title: tr("featHotTopics"),
      desc: tr("featHotTopicsDesc"),
      icon: Dices,
      grad: "from-[#F9A8D4] to-[#F472B6]",
    },
    {
      href: "/create?tab=reply",
      title: tr("featReply"),
      desc: tr("featReplyDesc"),
      icon: MessageCircle,
      grad: "from-[#FDA4AF] to-[#FB7185]",
    },
    {
      href: "/review",
      title: tr("featReviewCard"),
      desc: tr("featReviewCardDesc"),
      icon: BarChart3,
      grad: "from-[#FDBA74] to-[#FB923C]",
    },
    {
      href: "/history",
      title: tr("featLibraryCard"),
      desc: tr("featLibraryCardDesc"),
      icon: FolderOpen,
      grad: "from-[#F9735B] to-[#EA580C]",
    },
  ];

  return (
    <section>
      <SectionHead title={tr("homeSectionPlay")} />
      <div className="grid grid-cols-2 gap-3">
        {entries.map((e) => (
          <PlayGridCard key={e.href} {...e} />
        ))}
      </div>
      <Link
        href="/account-test"
        className={cn(
          "mt-3 flex items-center gap-3 rounded-[1.25rem] border border-dashed border-orange-200/90 bg-white/70 px-3.5 py-3",
          "shadow-sm active:scale-[0.98]"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-orange-400 text-white">
          <UserRound size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-800">{tr("featAccountTest")}</div>
          <p className="text-[10px] text-slate-500">{tr("featAccountTestDesc")}</p>
        </div>
        <ChevronRight className="shrink-0 text-orange-300" size={16} />
      </Link>
    </section>
  );
}

export function HomeHotTopics() {
  const { tr, user } = useApp();
  const { hotTopics, featureLimits } = useProduct();
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState(hotTopics);
  useEffect(() => {
    if (hotTopics.length) setItems(hotTopics);
  }, [hotTopics]);
  const limit = featureLimits.hotTopicView;
  const visible = items.slice(0, limit);
  const locked = items.length > limit;
  const firstTopic = visible[0]?.title;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await apiGetHotTopics();
      if (r.items?.length) setItems(r.items);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <section>
      <SectionHead
        title={tr("homeRecommendTitle")}
        action={
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {tr("homeRecommendRefresh")}
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={
            firstTopic
              ? `/publish-pack?topic=${encodeURIComponent(firstTopic)}`
              : "/topic-box"
          }
          className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#F9735B] to-[#EF4444] p-3.5 text-white shadow-md active:scale-[0.98]"
        >
          <Flame className="absolute -right-1 -top-1 h-16 w-16 text-white/15" />
          <div className="relative">
            <div className="text-[13px] font-extrabold">{tr("homeRecommendHot")}</div>
            <p className="mt-1 text-[10px] leading-snug text-white/85">
              {tr("homeRecommendHotDesc")}
            </p>
            <span className="mt-3 inline-block text-[11px] font-bold">
              {tr("homeGoUse")} ›
            </span>
          </div>
        </Link>
        <Link
          href="/publish-pack"
          className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#FDBA74] to-[#F9735B] p-3.5 text-white shadow-md active:scale-[0.98]"
        >
          <Sun className="absolute -right-1 -top-1 h-16 w-16 text-white/15" />
          <div className="relative">
            <div className="text-[13px] font-extrabold">{tr("homeRecommendToday")}</div>
            <p className="mt-1 text-[10px] leading-snug text-white/85">
              {tr("homeRecommendTodayDesc")}
            </p>
            <span className="mt-3 inline-block text-[11px] font-bold">
              {tr("homeGoUse")} ›
            </span>
          </div>
        </Link>
      </div>

      {visible.length > 0 && (
        <div className="mt-3 space-y-2">
          {visible.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl border border-orange-100/60 bg-white/90 p-3 shadow-sm backdrop-blur-sm"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
                <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                  {item.heat}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{item.desc}</p>
              <Link
                href={`/publish-pack?topic=${encodeURIComponent(item.title)}`}
                className="mt-2 inline-block text-[10px] font-bold text-orange-600"
              >
                {tr("hotTopicGen")} →
              </Link>
            </div>
          ))}
          {locked && user?.plan === "free" && (
            <Link
              href="/profile?pricing=1"
              className="block rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-3 text-center text-[11px] font-bold text-orange-600"
            >
              开通 Pro 查看全部热点灵感 →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export function HomeDailyTasks() {
  const { tr } = useApp();
  const { growth, completeTask } = useProduct();
  const done = growth.tasksDone.length;
  return (
    <section
      className={cn(
        "rounded-[1.25rem] border border-orange-100/80 bg-white p-4 shadow-[0_4px_20px_rgba(249,115,22,0.06)]"
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-slate-900">{tr("dailyTasksTitle")}</h2>
        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600">
          {done}/3 · {tr("streakDays")} {growth.streakDays}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{tr("dailyTasksHint")}</p>
      <div className="mt-3 space-y-2">
        {(
          [
            ["topic", tr("taskTopic"), "/topic-box"],
            ["pack", tr("taskPack"), "/publish-pack"],
            ["reply", tr("taskReply"), "/create?tab=reply"],
          ] as const
        ).map(([id, label, href]) => {
          const finished = growth.tasksDone.includes(id);
          return (
            <div
              key={id}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm",
                finished ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-700"
              )}
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <ListChecks size={15} className={finished ? "text-emerald-500" : "text-orange-400"} />
                {label}
              </span>
              {finished ? (
                <span className="text-xs font-bold">✓</span>
              ) : (
                <Link href={href} className="text-xs font-bold text-[#F9735B]">
                  {tr("goDo")}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      {done >= 3 && (
        <button
          type="button"
          onClick={() => completeTask("checkin")}
          className={cn(
            "mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-md",
            `bg-gradient-to-r ${theme.primary}`
          )}
        >
          {tr("checkinDone")}
        </button>
      )}
    </section>
  );
}

export function HomeInviteCard() {
  const { tr } = useApp();
  return (
    <Link
      href="/invite"
      className="flex items-center gap-3 rounded-[1.25rem] border border-amber-100 bg-gradient-to-r from-amber-50/90 to-orange-50/90 p-3.5 shadow-sm active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Gift className="text-orange-500" size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-slate-900">{tr("inviteCardTitle")}</div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{tr("inviteCardDesc")}</p>
      </div>
      <ChevronRight className="text-orange-400" size={18} />
    </Link>
  );
}

export function HomeMemberCard() {
  const { tr } = useApp();
  return (
    <Link
      href="/profile?pricing=1"
      className="flex items-center gap-3 rounded-[1.25rem] border border-rose-100 bg-gradient-to-r from-orange-50/90 to-rose-50/90 p-3.5 shadow-sm active:scale-[0.98]"
    >
      <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", theme.softOrange)}>
        <Crown className="text-orange-600" size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-slate-900">{tr("memberCardTitle")}</div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-600">{tr("memberCardDesc")}</p>
      </div>
      <ChevronRight className="shrink-0 text-orange-400" size={18} />
    </Link>
  );
}

export function HomeRetentionCards() {
  const { tr } = useApp();
  const { growth } = useProduct();
  const cards: { href: string; titleKey: I18nKey; descKey: I18nKey; icon: typeof Bell }[] = [
    { href: "/review?tab=weekly", titleKey: "weeklyReport", descKey: "weeklyReportDesc", icon: BarChart3 },
    { href: "/review?tab=remind", titleKey: "publishRemind", descKey: "publishRemindDesc", icon: Bell },
    { href: "/profile", titleKey: "growthLevel", descKey: "growthLevelDesc", icon: TrendingUp },
  ];
  return (
    <section className="space-y-2 pb-2">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {tr("retentionSection")}
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center gap-2.5 rounded-xl border border-orange-100/60 bg-white/80 p-3 shadow-sm active:scale-[0.98]"
            >
              <Icon size={17} className="shrink-0 text-orange-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-slate-800">{tr(c.titleKey)}</div>
                <p className="text-[9px] text-slate-500">
                  {c.titleKey === "growthLevel"
                    ? `${growth.level.name} · ${growth.xp} XP`
                    : tr(c.descKey)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** @deprecated 保留导出兼容，请用 HomeCoreEntries */
export function HomeAccountTestEntry() {
  return null;
}
