"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Sparkles, Wand2, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { fetchHomeTop3FromApi } from "@/lib/home/fetch-home-top3";
import { getCachedHomeTop3, loadHomeTop3 } from "@/lib/home/home-top3-cache";
import { buildPublishPackQuickHref } from "@/lib/publish-pack/publish-pack-links";

function QuickActionHero() {
  return (
    <div className="relative mx-auto flex h-[100px] w-[76px] flex-col items-center justify-center">
      <span className="banner-pulse-ring pointer-events-none absolute left-1/2 top-[42%] h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
      <div className="banner-gift-bounce relative z-10 flex h-[54px] w-[54px] items-center justify-center rounded-[18px] bg-white/28 ring-2 ring-white/50 backdrop-blur-sm">
        <Gift size={28} className="text-white drop-shadow" strokeWidth={2} />
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-white">
          <Wand2 size={14} className="text-[#FF5C8A]" strokeWidth={2.2} />
        </span>
      </div>
      <Sparkles
        size={11}
        className="banner-twinkle pointer-events-none absolute left-0 top-3 text-[#FFE8A8]"
      />
    </div>
  );
}

/**
 * 轮播第 2 屏：左文案 + 右插画 + 两个小入口（同图 3 邀请屏结构）
 */
export function HomeAttractCarouselSlide() {
  const { tr, showToast } = useApp();
  const [packHref, setPackHref] = useState("/publish-pack?mode=quick");

  useEffect(() => {
    const cached = getCachedHomeTop3();
    if (cached?.[0]) {
      setPackHref(buildPublishPackQuickHref(cached[0].topic));
      return;
    }
    void loadHomeTop3(fetchHomeTop3FromApi).then((picks) => {
      const top = picks?.[0];
      if (top) setPackHref(buildPublishPackQuickHref(top.topic));
    });
  }, []);

  return (
    <div className="flex h-full flex-col px-3.5 pb-9 pt-2.5">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_76px] gap-2">
        <div className="flex min-w-0 flex-col justify-between">
          <div className="min-w-0">
            <span className="banner-shimmer-tag inline-flex max-w-full items-center gap-1 rounded-full bg-white/28 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <Sparkles size={10} />
              {tr("homeBannerDualEyebrow")}
            </span>

            <h2 className="mt-1.5 text-[19px] font-black leading-[1.12] text-white">
              {tr("homeQuickActionTitle")}
            </h2>
            <p className="mt-1 text-[10px] leading-[1.4] text-white/90">
              {tr("homeBannerDualSub")}
            </p>

            <div className="mt-1.5 flex flex-wrap gap-1">
              {[tr("homeBannerChipQuick"), tr("homeBannerChipBox")].map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg bg-white/22 px-1.5 py-0.5 text-[8px] font-bold text-white ring-1 ring-white/25"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-1.5">
            <Link
              href={packHref}
              onClick={(e) => e.stopPropagation()}
              className="banner-cta-breathe flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full bg-white px-2.5 py-2 text-[11px] font-black text-[#FF5C8A] shadow-md active:scale-[0.98]"
            >
              <Zap size={12} className="fill-[#FF5C8A]" />
              {tr("homeQuickActionFreeCta")}
            </Link>
            <Link
              href="/topic-box"
              onClick={(e) => {
                e.stopPropagation();
                showToast(tr("bannerBlindboxToast"));
              }}
              className="flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full bg-white/22 px-2.5 py-2 text-[11px] font-bold text-white ring-1 ring-white/45 backdrop-blur-sm active:scale-[0.98]"
            >
              <Gift size={12} strokeWidth={2.2} />
              {tr("bannerAttractCtaBlindbox")}
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <QuickActionHero />
        </div>
      </div>
    </div>
  );
}
