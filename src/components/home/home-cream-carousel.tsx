"use client";

/**
 * 首页奶油风轮播
 * 顺序：① 多平台发片 ② 盲盒+情绪助手 ③ 邀请好友 ④ 开通 Pro（仅免费用户）
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { InviteFriendsModal } from "@/components/modals/invite-friends-modal";
import {
  bannerMemberTitleLines,
  bannerTitleLines,
  CreamBannerSlide,
} from "@/components/home/cream-banner-slide";
import { HomeAttractCarouselSlide } from "@/components/home/home-attract-carousel-slide";
import { PLAN_QUOTA, PRODUCTS } from "@/lib/constants/v1";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 5000;

type SlideId = "creator" | "attract" | "invite" | "member";

/** 轮播动图未上传时用 CSS 插画，避免 404 */
const MOTION: Partial<Record<SlideId, string>> = {
  invite: "/banner/invite-motion.gif",
};

const GRADIENTS: Record<SlideId, string> = {
  creator: "from-[#FF4D6D] via-[#FF6B8A] to-[#FFB347]",
  /** 盲盒 + 情绪助手：蜜桃粉→珊瑚，与全站主色一致 */
  attract: "from-[#FF6B8A] via-[#FF8FAB] to-[#FFC46B]",
  /** 邀请屏：暖金→蜜桃粉，与项目粉橙主色一致，略偏礼物感 */
  invite: "from-[#FFC46B] via-[#FF8FAB] to-[#FF4F8B]",
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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const showMemberSlide = user == null || user.plan === "free";
  const slides = useMemo<SlideId[]>(() => {
    const base: SlideId[] = ["creator", "attract", "invite"];
    if (showMemberSlide) base.push("member");
    return base;
  }, [showMemberSlide]);
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

  const onMember = () => {
    if (!user) {
      setLoginOpen(true);
      showToast(tr("memberPromoLoginHint"));
      return;
    }
    router.push("/profile?pricing=1#membership");
  };

  const memberLines = bannerMemberTitleLines(tr("memberPromoTitle"));
  const inviteLines = bannerTitleLines(tr("banner2Title"));

  const onInvite = () => setInviteOpen(true);

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
      case "attract":
        return (
          <BannerSlideShell gradient={GRADIENTS.attract}>
            <HomeAttractCarouselSlide />
          </BannerSlideShell>
        );
      case "invite":
        return (
          <BannerSlideShell gradient={GRADIENTS.invite}>
            <CreamBannerSlide
              tag={tr("banner2Tag")}
              tagEmoji="🎁"
              line1={inviteLines.line1}
              line2={inviteLines.line2 || undefined}
              desc={tr("banner2Desc")}
              cta={tr("banner2Cta")}
              onCta={onInvite}
              onShellClick={onInvite}
              motionSrc={MOTION.invite ?? ""}
              visual="invite"
              perkChips={["各得 10 点灵感", "小红书 · 抖音 · 视频号"]}
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
        {slides.map((id, i) => (
          <div
            key={id}
            className={cn(
              "absolute inset-0 overflow-hidden transition-opacity duration-200 ease-out",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
            )}
            aria-hidden={i !== index}
          >
            {renderSlide(id)}
          </div>
        ))}
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

      <InviteFriendsModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </section>
  );
}
