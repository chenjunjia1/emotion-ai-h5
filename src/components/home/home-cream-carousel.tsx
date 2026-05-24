"use client";

/**
 * 首页奶油风轮播
 * 顺序：① 多平台发片 ② 今日选题盲盒 ③ 开通 Pro（免费）/ 仅两屏（已会员）
 * 邀请好友见页面底部卡片
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import {
  bannerMemberTitleLines,
  CreamBannerSlide,
} from "@/components/home/cream-banner-slide";
import { PLAN_QUOTA, PRODUCTS } from "@/lib/constants/v1";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 5000;

type SlideId = "creator" | "blindbox" | "member";

/** 轮播动图未上传时用 CSS 插画，避免 404 */
const MOTION: Partial<Record<SlideId, string>> = {};

const GRADIENTS: Record<SlideId, string> = {
  creator: "from-[#FF4D6D] via-[#FF6B8A] to-[#FFB347]",
  blindbox: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
  member: "from-[#FFB347] via-[#FF6B8A] to-[#FF5C7A]",
};

const PRO_PRICE = PRODUCTS.find((p) => p.plan === "pro")?.amount ?? 39;

function BannerSlideShell({
  gradient,
  children,
}: {
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full max-w-full overflow-hidden bg-gradient-to-br",
        gradient
      )}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-24 rounded-full bg-white/15 blur-xl" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function HomeCreamCarousel() {
  const router = useRouter();
  const { tr, showToast, user, setLoginOpen } = useApp();
  const { dailyUsage, featureLimits } = useProduct();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const topicBoxRemain = Math.max(0, featureLimits.topicBox - dailyUsage.topicBox);
  const topicBoxHighlight = tr("topicBoxRemain")
    .replace("{remain}", String(topicBoxRemain))
    .replace("{limit}", String(featureLimits.topicBox));

  const showMemberSlide = user == null || user.plan === "free";
  const slides = useMemo<SlideId[]>(
    () => (showMemberSlide ? ["creator", "blindbox", "member"] : ["creator", "blindbox"]),
    [showMemberSlide]
  );
  const slidesKey = slides.join("-");

  useEffect(() => {
    setIndex(0);
  }, [slidesKey]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [paused, slides.length, slidesKey]);

  const go = (n: number) =>
    setIndex(((n % slides.length) + slides.length) % slides.length);

  const onCreator = () => {
    showToast(tr("bannerCreatorToast"));
    router.push("/publish-pack");
  };

  const onBlindbox = () => {
    showToast(tr("bannerBlindboxToast"));
    router.push("/topic-box");
  };

  const onMember = () => {
    if (!user) {
      setLoginOpen(true);
      showToast(tr("memberPromoLoginHint"));
      return;
    }
    router.push("/profile?pricing=1#membership");
  };

  const memberLines = bannerMemberTitleLines(tr("memberPromoTitle"));

  const renderSlide = (id: SlideId) => {
    switch (id) {
      case "creator":
        return (
          <BannerSlideShell gradient={GRADIENTS.creator}>
            <CreamBannerSlide
              tag={tr("bannerCreatorTag")}
              tagEmoji="🎬"
              highlight={tr("bannerCreatorHighlight")}
              line1={tr("bannerCreatorTitle")}
              line2={tr("bannerCreatorTitleLine2")}
              desc={tr("bannerCreatorDesc")}
              cta={tr("bannerCreatorCta")}
              onCta={onCreator}
              motionSrc={MOTION.creator ?? ""}
              visual="creator"
              perkChips={[tr("bannerCreatorPerk1"), tr("bannerCreatorPerk2")]}
              withDailyTicker
            />
          </BannerSlideShell>
        );
      case "blindbox":
        return (
          <BannerSlideShell gradient={GRADIENTS.blindbox}>
            <CreamBannerSlide
              tag={tr("featTopicBox")}
              tagEmoji="🎁"
              highlight={topicBoxHighlight}
              line1={tr("bannerBlindboxTitle")}
              line2={tr("bannerBlindboxTitleLine2")}
              desc={tr("bannerBlindboxDesc")}
              cta={tr("bannerBlindboxCta")}
              onCta={onBlindbox}
              onShellClick={onBlindbox}
              motionSrc={MOTION.blindbox ?? ""}
              visual="blindbox"
              perkChips={[
                tr("bannerBlindboxPerk1"),
                tr("bannerBlindboxPerk2"),
                tr("bannerBlindboxPerk3"),
              ]}
            />
          </BannerSlideShell>
        );
      case "member":
        return (
          <BannerSlideShell gradient={GRADIENTS.member}>
            <CreamBannerSlide
              tag={tr("memberPromoBadge")}
              tagEmoji="👑"
              highlight={tr("memberPromoPrice")}
              line1={memberLines.line1}
              line2={memberLines.line2 || undefined}
              desc={tr("memberPromoSub")}
              cta={tr("memberPromoCta")}
              onCta={onMember}
              onShellClick={onMember}
              motionSrc=""
              visual="member"
              perkChips={[
                tr("memberPromoBenefit1"),
                tr("memberPromoBenefit2"),
                tr("memberPromoBenefit3"),
                `每日 ${PLAN_QUOTA.pro} 次 · ¥${PRO_PRICE}`,
              ]}
            />
          </BannerSlideShell>
        );
    }
  };

  return (
    <section
      className="relative h-[200px] w-full max-w-full overflow-hidden rounded-[30px] shadow-[0_12px_32px_rgba(255,107,107,0.2)] ring-1 ring-white/50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={tr("bannerCarouselLabel")}
    >
      <div className="relative h-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slides[index]}
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {renderSlide(slides[index])}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5">
        {slides.map((id, i) => (
          <button
            key={id}
            type="button"
            aria-label={`${i + 1} / ${slides.length}`}
            className={cn(
              "pointer-events-auto rounded-full shadow-sm transition-all",
              i === index ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/50"
            )}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
