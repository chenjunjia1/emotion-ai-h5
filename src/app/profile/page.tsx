"use client";



import { Suspense, useCallback, useEffect, useRef } from "react";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { hasCompletedAiProfile } from "@/lib/onboarding/ai-profile";

import {

  ChevronRight,

  Crown,

  FileText,

  HelpCircle,

  Languages,

  MessageCircle,

  Pencil,

  Shield,

  Smartphone,

} from "lucide-react";

import { useProduct } from "@/hooks/use-product";

import { AppShell } from "@/components/layout/app-shell";

import {

  ProfileHeroCard,

  ProfileQuickActions,

} from "@/components/profile/profile-dashboard";

import { ProfilePurchaseStrip } from "@/components/profile/profile-purchase-strip";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { useApp } from "@/contexts/app-context";

import { getProfileStoreProducts } from "@/lib/constants/v1";

import { orderStatusLabel } from "@/lib/orders/display";

import { trackEvent } from "@/lib/analytics";

import { getTotalQuota } from "@/lib/v1/quota";

import { theme } from "@/lib/theme";

import { cn } from "@/lib/utils";



function ProfileContent() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const membershipRef = useRef<HTMLDivElement>(null);

  const {

    user,

    orders,

    tr,

    setLang,

    lang,

    logout,

    setLoginOpen,

    createOrder,

    products,

    refreshUser,

    setPayOrder,

  } = useApp();

  const { growth } = useProduct();

  const storeProducts = getProfileStoreProducts(products);



  const scrollToMembership = useCallback(() => {

    membershipRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  }, []);



  useEffect(() => {

    if (!user) return;

    if (!hasCompletedAiProfile(user.id)) {

      router.replace("/onboarding");

      return;

    }

    if (searchParams.get("pricing") === "1") {

      trackEvent("view_pricing");

      const t = window.setTimeout(() => scrollToMembership(), 120);

      return () => window.clearTimeout(t);

    }

  }, [user, searchParams, router, scrollToMembership]);



  useEffect(() => {

    if (user) void refreshUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅在用户切换时同步

  }, [user?.id]);



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



  const planLabel =

    user.plan === "free"

      ? tr("freePlan")

      : user.plan === "pro"

        ? tr("planPro")

        : user.plan === "premium"

          ? tr("planPremium")

          : tr("planStudio");



  const settingsLinks = [

    { href: "/profile/edit", labelKey: "profileEditProfile" as const, icon: Pencil },

    { href: "/support", labelKey: "linkSupport" as const, icon: HelpCircle },

    { href: "/support?tab=feedback", labelKey: "linkFeedback" as const, icon: MessageCircle },

    { href: "/agreement/user", labelKey: "linkUserAgreement" as const, icon: FileText },

    { href: "/agreement/privacy", labelKey: "linkPrivacy" as const, icon: Shield },

    { href: "/agreement/rights", labelKey: "linkRights" as const, icon: Crown },

    { href: "/about", labelKey: "linkAbout" as const, icon: ChevronRight },

  ];



  const totalQuota = getTotalQuota(user);

  const recentOrders = orders.slice(0, 3);

  const benefitsLabel = user.plan === "free" ? tr("buyBenefits") : tr("buyBenefitsRenew");



  return (

    <AppShell>

      <div className="profile-stagger space-y-3 pb-2">

        <ProfileHeroCard

          user={user}

          growth={growth}

          totalQuota={totalQuota}

          planLabel={planLabel}

          tr={tr}

          onOpenPricing={scrollToMembership}

        />



        <ProfileQuickActions tr={tr} />



        <div ref={membershipRef}>

          <ProfilePurchaseStrip products={storeProducts} onBuy={createOrder} tr={tr} />

        </div>



        {recentOrders.length > 0 ? (

          <Card>

            <CardContent className="py-3">

              <div className="mb-2 flex items-center justify-between">

                <h3 className="text-sm font-bold">{tr("ordersTitle")}</h3>

                <button

                  type="button"

                  onClick={scrollToMembership}

                  className="text-[10px] font-bold text-[#FF7AAE]"

                >

                  {benefitsLabel}

                </button>

              </div>

              {recentOrders.map((o) => {

                const pending = o.status === "pending";

                return (

                  <button

                    key={o.id}

                    type="button"

                    disabled={!pending}

                    onClick={() => pending && setPayOrder(o)}

                    className={cn(

                      "mb-1.5 w-full rounded-xl bg-orange-50/80 px-3 py-2 text-left text-[11px] leading-5 last:mb-0",

                      pending && "cursor-pointer ring-1 ring-[#FF7AAE]/25 active:bg-orange-100/90"

                    )}

                  >

                    <b>{o.productName}</b>

                    <span className="text-slate-500">

                      {" "}

                      · ¥{o.amount} · {orderStatusLabel(o.status)}

                    </span>

                    {pending ? (

                      <span className="ml-1 font-bold text-[#FF5C8A]">{tr("orderTapToPay")}</span>

                    ) : null}

                  </button>

                );

              })}

            </CardContent>

          </Card>

        ) : null}



        <Card>

          <CardContent className="py-2">

            <h3 className="mb-2 px-1 text-sm font-bold">{tr("settingsTitle")}</h3>

            <div className="space-y-0.5">

              {settingsLinks.map(({ href, labelKey, icon: Icon }) => (

                <Link

                  key={href}

                  href={href}

                  className={cn(

                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 active:bg-orange-50",

                    theme.border,

                    "border-b last:border-0"

                  )}

                >

                  <span className="flex items-center gap-2">

                    <Icon size={15} className="text-orange-500" />

                    {tr(labelKey)}

                  </span>

                  <ChevronRight size={15} className="text-slate-300" />

                </Link>

              ))}

            </div>

            <div className="mt-3 flex items-center justify-between border-t border-orange-50 pt-3">

              <span className="flex items-center gap-2 text-xs font-bold text-slate-600">

                <Languages size={16} /> {tr("langSwitch")}

              </span>

              <div className="flex gap-1.5">

                <Button

                  variant={lang === "zh" ? "primary" : "secondary"}

                  className="px-2.5 py-1.5 text-xs"

                  onClick={() => setLang("zh")}

                >

                  {tr("langZh")}

                </Button>

                <Button

                  variant={lang === "en" ? "primary" : "secondary"}

                  className="px-2.5 py-1.5 text-xs"

                  onClick={() => setLang("en")}

                >

                  {tr("langEn")}

                </Button>

              </div>

            </div>

            {user.role === "admin" ? (

              <Link href="/admin" className="mt-2 block">

                <Button variant="secondary" className="w-full text-sm">

                  {tr("adminPanel")}

                </Button>

              </Link>

            ) : null}

            <Button variant="ghost" className="mt-2 w-full text-sm" onClick={logout}>

              {tr("logout")}

            </Button>

          </CardContent>

        </Card>

      </div>

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


