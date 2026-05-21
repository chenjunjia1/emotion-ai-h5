"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Coins,
  CreditCard,
  ChevronRight,
  Crown,
  FileText,
  HelpCircle,
  History,
  Languages,
  Lock,
  MessageCircle,
  Shield,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function ProfileContent() {
  const searchParams = useSearchParams();
  const {
    user,
    orders,
    tasks,
    flowLogs,
    tr,
    setLang,
    lang,
    logout,
    setLoginOpen,
    createOrder,
    products,
  } = useApp();
  const [view, setView] = useState<"main" | "pricing">("main");

  useEffect(() => {
    if (searchParams.get("pricing") === "1") setView("pricing");
  }, [searchParams]);

  if (!user) {
    return (
      <AppShell>
        <Card>
          <CardContent className="py-10 text-center">
            <Smartphone className="mx-auto mb-4 text-orange-500" size={46} />
            <h2 className="text-xl font-bold">{tr("pleaseLogin")}</h2>
            <Button className="mt-5" onClick={() => setLoginOpen(true)}>
              {tr("loginTitle")}
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (view === "pricing") {
    return (
      <AppShell>
        <button
          type="button"
          className="mb-4 text-sm font-bold text-orange-600"
          onClick={() => setView("main")}
        >
          {tr("backProfile")}
        </button>
        <SectionTitle
          eyebrow={tr("pricingEyebrow")}
          title={tr("pricing")}
          desc={tr("pricingDesc")}
        />
        {products.map((p) => (
          <Card key={p.productName} className="mb-3">
            <CardContent className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  p.productType === "video_coin" ? theme.softRose : theme.softOrange
                )}
              >
                {p.productType === "video_coin" ? <Coins /> : <Crown />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{p.productName}</div>
                <p className="mt-1 text-xs text-slate-500">
                  {"desc" in p && p.desc ? p.desc : `¥${p.amount}`}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold">¥{p.amount}</div>
                <button
                  type="button"
                  onClick={() => createOrder(p)}
                  className={cn(
                    "mt-2 rounded-xl bg-gradient-to-r px-3 py-2 text-xs font-bold text-white",
                    theme.primary
                  )}
                >
                  {tr("buy")}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </AppShell>
    );
  }

  const planLabel =
    user.plan === "free"
      ? tr("freePlan")
      : user.plan === "pro"
        ? tr("planPro")
        : user.plan === "premium"
          ? tr("planPremium")
          : tr("planStudio");

  const settingsLinks = [
    { href: "/support", labelKey: "linkSupport" as const, icon: HelpCircle },
    { href: "/support?tab=feedback", labelKey: "linkFeedback" as const, icon: MessageCircle },
    { href: "/agreement/user", labelKey: "linkUserAgreement" as const, icon: FileText },
    { href: "/agreement/privacy", labelKey: "linkPrivacy" as const, icon: Shield },
    { href: "/agreement/rights", labelKey: "linkRights" as const, icon: Crown },
    { href: "/about", labelKey: "linkAbout" as const, icon: ChevronRight },
  ];

  const stats = [
    {
      labelKey: "statRemainQuota" as const,
      value: user.dailyQuota - user.usedCount,
      Icon: Sparkles,
      color: "text-orange-500",
    },
    {
      labelKey: "statBonusQuota" as const,
      value: user.bonusQuota,
      Icon: Crown,
      color: "text-rose-500",
    },
    {
      labelKey: "statVideoCoin" as const,
      value: user.videoCoin,
      Icon: Coins,
      color: "text-[#F9735B]",
    },
    {
      labelKey: "statFrozenCoin" as const,
      value: user.frozenVideoCoin,
      Icon: Lock,
      color: "text-rose-400",
    },
    {
      labelKey: "statOrders" as const,
      value: orders.length,
      Icon: CreditCard,
      color: "text-orange-400",
    },
    {
      labelKey: "statVideoTasks" as const,
      value: tasks.length,
      Icon: History,
      color: "text-rose-400",
    },
  ];

  return (
    <AppShell>
      <SectionTitle
        eyebrow={tr("profileEyebrow")}
        title={tr("profileTitle")}
        desc={tr("profileDesc")}
      />
      <Card>
        <CardContent className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br text-white",
              theme.primary
            )}
          >
            <UserRound />
          </div>
          <div>
            <div className="font-bold">{user.mobile}</div>
            <div className="mt-1 text-xs text-slate-500">
              {planLabel} · {tr("quotaWord")} {user.dailyQuota - user.usedCount}+
              {user.bonusQuota} · {tr("statVideoCoin")} {user.videoCoin}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.labelKey}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <div className="text-[10px] text-slate-500">{tr(s.labelKey)}</div>
                <div className="mt-0.5 text-xl font-bold">{s.value}</div>
              </div>
              <s.Icon className={s.color} size={20} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => setView("pricing")}>
          <Crown size={16} /> {tr("buyBenefits")}
        </Button>
        <Link href="/history">
          <Button variant="secondary" className="w-full">
            <History size={16} /> {tr("history")}
          </Button>
        </Link>
      </div>

      <Card className="mt-4">
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("ordersTitle")}</h3>
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="mb-2 rounded-2xl bg-orange-50 p-3 text-xs leading-6">
              <b>{o.productName}</b>
              <br />¥{o.amount} · {o.status} · benefit:{String(o.benefitGranted)}
            </div>
          ))}
          {!orders.length && <p className="text-sm text-slate-500">{tr("noOrders")}</p>}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("tasksTitle")}</h3>
          {tasks.slice(0, 5).map((t) => (
            <div key={t.id} className="mb-2 rounded-2xl bg-rose-50 p-3 text-xs leading-6">
              <b>{t.taskType}</b> · {t.status}
            </div>
          ))}
          {!tasks.length && <p className="text-sm text-slate-500">{tr("noTasks")}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("flowTitle")}</h3>
          {flowLogs.slice(0, 8).map((l) => (
            <div key={l.id} className="mb-2 rounded-2xl bg-slate-50 p-2.5 text-[11px] leading-5">
              <span className={cn("font-bold", theme.textActive)}>{l.type}</span>
              <br />
              {l.message}
              <div className="mt-0.5 text-slate-400">{l.createdAt}</div>
            </div>
          ))}
          {!flowLogs.length && (
            <p className="text-sm text-slate-500">{tr("noFlow")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("settingsTitle")}</h3>
          <div className="space-y-1">
            {settingsLinks.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 active:bg-orange-50",
                  theme.border,
                  "border-b last:border-0"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} className="text-orange-500" />
                  {tr(labelKey)}
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Languages size={18} /> {tr("langSwitch")}
            </span>
            <div className="flex gap-2">
              <Button
                variant={lang === "zh" ? "primary" : "secondary"}
                className="px-3 py-2"
                onClick={() => setLang("zh")}
              >
                {tr("langZh")}
              </Button>
              <Button
                variant={lang === "en" ? "primary" : "secondary"}
                className="px-3 py-2"
                onClick={() => setLang("en")}
              >
                {tr("langEn")}
              </Button>
            </div>
          </div>
          {user.role === "admin" && (
            <Link href="/admin">
              <Button variant="secondary" className="w-full">
                {tr("adminPanel")}
              </Button>
            </Link>
          )}
          <Button variant="ghost" className="w-full" onClick={logout}>
            {tr("logout")}
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default function ProfilePage() {
  const { tr } = useApp();
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-orange-600">{tr("loading")}</div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
