"use client";

import Link from "next/link";
import {
  Award,
  ChevronRight,
  Crown,
  Flame,
  Gift,
  History,
  MessageCircle,
  Pencil,
  Sparkles,
  UserRound,
} from "lucide-react";
import { HintTip } from "@/components/ui/hint-tip";
import {
  ProfileUserAvatar,
  profileCompanionMeta,
  profileDisplayName,
} from "@/components/profile/profile-user-avatar";
import type { GrowthState } from "@/hooks/use-product";
import type { I18nKey } from "@/lib/i18n";
import type { User } from "@/lib/types/v1";
import { getNextLevel, getProfileLevelHintContent, xpProgress } from "@/lib/v1/growth";
import { cn } from "@/lib/utils";

type Tr = (key: I18nKey) => string;

const QUICK_ACTIONS = [
  {
    href: "/hot-topics",
    labelKey: "profileQuickHot" as const,
    icon: Flame,
    grad: "from-[#FF9A6B] to-[#FF6B6B]",
    iconAnim: "play-icon-pulse",
  },
  {
    href: "/emotion-chat",
    labelKey: "navAiChat" as const,
    icon: MessageCircle,
    grad: "from-[#A78BFA] to-[#C4B5FD]",
    iconAnim: "play-icon-bounce",
  },
  {
    href: "/history",
    labelKey: "history" as const,
    icon: History,
    grad: "from-[#FFC46B] to-[#FF9A6B]",
    iconAnim: "play-icon-wiggle",
  },
  {
    href: "/invite",
    labelKey: "profileQuickInvite" as const,
    icon: Gift,
    grad: "from-[#FF9EC4] to-[#FF7AAE]",
    iconAnim: "play-icon-spark",
  },
] as const;

function planBadgeClass(plan: User["plan"]) {
  if (plan === "studio") return "bg-violet-500/90 text-white";
  if (plan === "premium") return "bg-gradient-to-r from-amber-400 to-orange-400 text-white";
  if (plan === "pro") return "bg-gradient-to-r from-[#FF7AAE] to-[#FF5C8A] text-white";
  return "bg-white/80 text-slate-600 ring-1 ring-white/60";
}

function levelTitleBadgeClass(levelId: string) {
  if (levelId === "operator") return "from-violet-500 via-purple-500 to-fuchsia-500";
  if (levelId === "observer") return "from-amber-500 via-orange-500 to-[#FF9A6B]";
  if (levelId === "stable") return "from-[#FF6B6B] via-[#FF7AAE] to-[#FF9EC4]";
  if (levelId === "trainee") return "from-[#FF8EC4] via-[#FF7AAE] to-[#FFB347]";
  return "from-slate-400 via-slate-500 to-slate-600";
}

export function ProfileHeroCard({
  user,
  growth,
  totalQuota,
  planLabel,
  tr,
  onOpenPricing,
}: {
  user: User;
  growth: GrowthState;
  totalQuota: number;
  planLabel: string;
  tr: Tr;
  onOpenPricing?: () => void;
}) {
  const displayName = profileDisplayName(user.id, tr("profileDefaultName"));
  const companion = profileCompanionMeta(user.id);
  const progress = xpProgress(growth.xp);
  const nextLevel = getNextLevel(growth.xp);
  const xpRemain = nextLevel ? Math.max(0, nextLevel.minXp - growth.xp) : 0;
  const hintOk = tr("profileHintOk");
  const hintAria = tr("profileHintAria");
  const levelHint = getProfileLevelHintContent(growth.xp);
  const canUpgrade = user.plan === "free" && onOpenPricing;

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF7AAE] via-[#FF9EC4] to-[#FFB347] p-[1px] shadow-[0_16px_40px_rgba(255,122,174,0.28)]">
      <div className="relative overflow-hidden rounded-[27px] bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF8F0] px-4 py-4">
        <span
          className="profile-hero-glow pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FF7AAE]/20 blur-2xl"
          aria-hidden
        />
        <span
          className="profile-hero-glow pointer-events-none absolute -bottom-6 left-8 h-24 w-24 rounded-full bg-orange-200/35 blur-xl"
          aria-hidden
          style={{ animationDelay: "1.2s" }}
        />

        <Link
          href="/profile/edit"
          className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#FF7AAE] shadow-md ring-1 ring-[#FF7AAE]/25 transition active:scale-95"
        >
          <Pencil size={12} strokeWidth={2.2} />
          {tr("profileEditProfile")}
        </Link>

        <div className="relative flex items-start gap-3 pr-16">
          <Link
            href="/profile/edit"
            className="profile-avatar-float relative flex shrink-0 flex-col items-center active:opacity-90"
            aria-label={tr("profileEditProfile")}
          >
            <ProfileUserAvatar
              userId={user.id}
              className="h-[4.25rem] w-[4.25rem] ring-[3px] ring-white shadow-lg"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7AAE] text-white shadow ring-2 ring-white">
              <Pencil size={10} strokeWidth={2.5} />
            </span>
            {companion ? (
              <span className="mt-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[#FF5C8A] shadow-sm ring-1 ring-[#FF7AAE]/25">
                陪跑中
              </span>
            ) : null}
          </Link>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[10px] font-bold text-[#FF7AAE]">{tr("profileEyebrow")}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-lg font-black text-slate-800">{displayName}</h2>
              {canUpgrade ? (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="inline-flex shrink-0 items-stretch overflow-hidden rounded-full shadow-[0_4px_14px_rgba(255,196,107,0.45)] ring-2 ring-[#FFE8A8]/90 transition active:scale-95"
                >
                  <span className="bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-600">
                    {planLabel}
                  </span>
                  <span className="flex items-center gap-0.5 bg-gradient-to-b from-[#FFE8A8] via-[#FFD88A] to-[#FFC46B] px-2.5 py-1 text-[10px] font-black text-[#E85D04]">
                    <Crown size={11} className="shrink-0" strokeWidth={2.5} />
                    {tr("headerUpgrade")}
                  </span>
                </button>
              ) : (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-bold",
                    planBadgeClass(user.plan)
                  )}
                >
                  {planLabel}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "profile-level-badge inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-[11px] font-black text-white shadow-[0_3px_12px_rgba(255,122,174,0.4)] ring-2 ring-white/50",
                  levelTitleBadgeClass(growth.level.id)
                )}
              >
                <Award size={12} className="shrink-0 opacity-95" strokeWidth={2.5} />
                {growth.level.name}
              </span>
              <HintTip
                variant="popover"
                popoverSize="wide"
                title={tr("profileHintLevelTitle")}
                body={[levelHint.intro, levelHint.status, levelHint.footer].join("\n")}
                stages={levelHint.stages}
                okLabel={hintOk}
                ariaLabel={hintAria}
              />
            </div>
            {!companion ? (
              <Link
                href="/profile/edit"
                className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF7AAE] active:opacity-70"
              >
                <UserRound size={12} />
                {tr("profileEditIdentity")}
                <ChevronRight size={12} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-orange-50/90 px-3 py-3 ring-1 ring-[#FF7AAE]/15">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-bold text-slate-500">{tr("statUnifiedQuota")}</p>
              <HintTip
                variant="popover"
                title={tr("profileHintQuotaTitle")}
                body={tr("profileHintQuotaBody")}
                okLabel={hintOk}
                ariaLabel={hintAria}
              />
            </div>
            <p className="profile-quota-pop text-4xl font-black leading-none text-[#FF5C8A]">
              {totalQuota}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-inner">
            <Sparkles className="play-icon-spark text-[#FF7AAE]" size={26} />
          </div>
        </div>

        <div className="relative mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-500">{tr("statFrozenCoin")}</span>
              <HintTip
                variant="popover"
                title={tr("profileHintXpTitle")}
                body={tr("profileHintXpBody")}
                okLabel={hintOk}
                ariaLabel={hintAria}
              />
            </div>
            <span className="truncate text-right text-slate-400">
              {nextLevel
                ? tr("profileXpToNext")
                    .replace("{next}", nextLevel.name)
                    .replace("{n}", String(xpRemain))
                : tr("profileXpMax")}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-orange-100/80">
            <div
              className="profile-xp-shine h-full rounded-full bg-gradient-to-r from-[#FF7AAE] to-[#FFB347] transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(progress.pct, 4)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileQuickActions({ tr }: { tr: Tr }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="profile-action-tile flex flex-col items-center rounded-2xl bg-white px-1 py-2.5 shadow-sm ring-1 ring-orange-100/80 transition active:scale-[0.97]"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <span
              className={cn(
                "profile-action-icon mb-1.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                item.grad,
                item.iconAnim
              )}
            >
              <Icon size={18} />
            </span>
            <span className="text-center text-[10px] font-bold leading-tight text-slate-700">
              {tr(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
