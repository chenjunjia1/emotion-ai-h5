"use client";

/**
 * 首页运营 Banner：优先保证不重叠、不溢出；动效仅淡入切换。
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Gift, Rocket } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { InviteFriendsModal } from "@/components/modals/invite-friends-modal";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 5000;
const SLIDE_COUNT = 2;
const INVITE_BANNER_MOTION_SRC = "/banner/invite-motion.gif";
const FOOTER_H = 32;

const GRADIENT_PACK = "banner-gradient-pack";
const GRADIENT_INVITE = "banner-gradient-invite";

const CREAM_TEXT = "text-[#6B4545]";
const CREAM_TEXT_SOFT = "text-[#8A5E56]";
const CTA_CORAL = "text-[#D4776A]";

function splitInviteTitle(title: string) {
  const idx = title.indexOf("解锁");
  if (idx >= 0) {
    return {
      line1: title.slice(0, idx + 2),
      line2: title.slice(idx + 2).trim() || "灵感库",
    };
  }
  return { line1: title, line2: "" };
}

function BannerTwoLineTitle({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <h2 className={cn("shrink-0 font-bold tracking-tight", CREAM_TEXT)}>
      <span className="block text-[22px] leading-[1.15]">{line1}</span>
      {line2 ? (
        <span className="mt-0.5 block text-[15px] font-semibold leading-[1.15]">
          {line2}
        </span>
      ) : null}
    </h2>
  );
}

const STACK_AVATARS = ["👩🏻", "👨🏻", "🧑🏻", "👧🏻"];

function AvatarStack() {
  return (
    <div className="flex items-center justify-end">
      {STACK_AVATARS.map((emoji, i) => (
        <span
          key={emoji}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-[#FFF9F5] text-[10px] shadow-sm",
            i > 0 && "-ml-1.5"
          )}
          style={{ zIndex: STACK_AVATARS.length - i }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

/** 右侧插画列（网格内，不盖文案） */
function InviteArtColumn() {
  const [gifOk, setGifOk] = useState(true);

  if (gifOk) {
    return (
      <div className="flex h-full min-w-0 flex-col items-end justify-end pb-0.5 pr-0.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={INVITE_BANNER_MOTION_SRC}
          alt=""
          className="max-h-[58px] w-full max-w-[72px] object-contain object-bottom-right"
          onError={() => setGifOk(false)}
        />
      </div>
    );
  }

  return (
    <div className="grid h-full min-w-0 grid-rows-[auto_1fr_auto] items-end justify-items-end gap-0.5 pr-0.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/55 ring-1 ring-white/70">
        <Rocket size={13} className="text-[#E88872]" strokeWidth={2.4} />
      </div>
      <div className="min-h-0" aria-hidden />
      <div className="rounded-xl bg-white/40 px-1.5 py-1 ring-1 ring-white/50">
        <AvatarStack />
      </div>
    </div>
  );
}

function SlidePublishPack({ onCta }: { onCta: () => void }) {
  const { tr } = useApp();
  const chips = [
    { href: "/topic-box", label: tr("banner1ChipTopic"), emoji: "🎲" },
    { href: "/publish-pack", label: tr("banner1ChipPack"), emoji: "⚡" },
    { href: "/hot-topics", label: tr("featHotTopics"), emoji: "🔥" },
  ];

  return (
    <div className={cn("h-full w-full overflow-hidden", GRADIENT_PACK)}>
      <div className="flex h-full min-h-0 flex-col gap-2 px-3.5 py-2.5">
        <BannerTwoLineTitle
          line1={tr("banner1Title")}
          line2={tr("banner1Subtitle")}
        />

        <button
          type="button"
          className={cn(
            "shrink-0 flex w-full items-center justify-center gap-1 rounded-full bg-white py-2 text-[11px] font-bold shadow-sm ring-1 ring-white/80",
            CTA_CORAL
          )}
          onClick={onCta}
        >
          <Gift size={13} className="text-[#F0A080]" />
          {tr("banner1Cta")}
        </button>

        <div
          className="mt-auto grid shrink-0 grid-cols-3 gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {chips.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center justify-center gap-0.5 rounded-lg bg-white/35 px-1 py-1 ring-1 ring-white/50 active:scale-95"
              title={c.label}
            >
              <span className="text-[11px] leading-none">{c.emoji}</span>
              <span className={cn("truncate text-[8px] font-semibold", CREAM_TEXT)}>
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideInvite({ onCta }: { onCta: () => void }) {
  const { tr } = useApp();
  const { line1, line2 } = splitInviteTitle(tr("banner2Title"));

  return (
    <div
      className={cn("h-full w-full cursor-pointer overflow-hidden", GRADIENT_INVITE)}
      onClick={onCta}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onCta()}
    >
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_76px] gap-1 px-3.5 py-2.5">
        <div className="flex min-w-0 flex-col gap-1.5 overflow-hidden">
          <span
            className={cn(
              "inline-flex w-fit max-w-full shrink-0 items-center gap-1 truncate rounded-full bg-white/50 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/60",
              CREAM_TEXT_SOFT
            )}
          >
            <Gift size={10} className="shrink-0 text-[#E88872]" />
            <span className="truncate">{tr("banner2Tag")}</span>
          </span>

          <BannerTwoLineTitle line1={line1} line2={line2} />

          <p className={cn("shrink-0 text-[10px] leading-[1.35]", CREAM_TEXT_SOFT)}>
            {tr("banner2Desc")}
          </p>

          <button
            type="button"
            className={cn(
              "mt-auto w-fit shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold shadow-sm ring-1 ring-white/80 active:scale-95",
              CTA_CORAL
            )}
            onClick={(e) => {
              e.stopPropagation();
              onCta();
            }}
          >
            {tr("banner2Cta")} ›
          </button>
        </div>

        <InviteArtColumn />
      </div>
    </div>
  );
}

function BannerCarouselFooter({
  index,
  onPrev,
  onNext,
  onGo,
  prevLabel,
  nextLabel,
}: {
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onGo: (i: number) => void;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div
      className="relative z-30 flex shrink-0 items-center justify-center border-t border-white/25 bg-[#FFF5F0]/90 px-2"
      style={{ height: FOOTER_H }}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1} / ${SLIDE_COUNT}`}
            className={cn(
              "rounded-full",
              i === index ? "h-1.5 w-4 bg-[#D4776A]" : "h-1.5 w-1.5 bg-[#D4776A]/40"
            )}
            onClick={() => onGo(i)}
          />
        ))}
      </div>

      <div className="absolute right-2 flex items-center gap-0.5">
        <button
          type="button"
          aria-label={prevLabel}
          className="grid h-5 w-5 place-items-center rounded-full bg-white/70 text-[#B86B5E] ring-1 ring-[#F0D8CC] active:scale-95"
          onClick={onPrev}
        >
          <ChevronLeft size={12} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          className="grid h-5 w-5 place-items-center rounded-full bg-white/70 text-[#B86B5E] ring-1 ring-[#F0D8CC] active:scale-95"
          onClick={onNext}
        >
          <ChevronRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function HomeBannerCarousel() {
  const router = useRouter();
  const { tr, showToast, user, setLoginOpen } = useApp();
  const [index, setIndex] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDE_COUNT);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const onTopicCta = useCallback(() => {
    showToast(tr("banner1Toast"));
    router.push("/topic-box");
  }, [router, showToast, tr]);

  const onInviteCta = useCallback(() => {
    if (!user) {
      setLoginOpen(true);
      showToast(tr("pleaseLogin"));
      return;
    }
    setInviteOpen(true);
  }, [user, setLoginOpen, showToast, tr]);

  return (
    <>
      <section
        className="home-banner-carousel flex h-[190px] w-full max-w-full flex-col overflow-hidden rounded-[28px] shadow-[0_8px_24px_rgba(232,168,148,0.18)] ring-1 ring-[#FFE8DC]/80"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label={tr("bannerCarouselLabel")}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {index === 0 ? (
                <SlidePublishPack onCta={onTopicCta} />
              ) : (
                <SlideInvite onCta={onInviteCta} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <BannerCarouselFooter
          index={index}
          onPrev={prev}
          onNext={next}
          onGo={go}
          prevLabel={tr("bannerPrev")}
          nextLabel={tr("bannerNext")}
        />
      </section>

      <InviteFriendsModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
