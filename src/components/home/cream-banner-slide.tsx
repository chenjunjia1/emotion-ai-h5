"use client";

import { useState } from "react";
import { Clapperboard, Crown, Dices, Gift, Sparkles, Users, Video, Zap } from "lucide-react";
import { BannerDailyTicker } from "@/components/home/banner-daily-ticker";
import { cn } from "@/lib/utils";

export type BannerVisualVariant = "creator" | "blindbox" | "invite" | "gacha" | "member";

const BLINDBOX_TOPICS = [
  { emoji: "💼", label: "职场" },
  { emoji: "🐱", label: "宠物" },
  { emoji: "💗", label: "情感" },
] as const;

function splitTwoLineTitle(title: string, splitAt = "解锁") {
  const idx = title.indexOf(splitAt);
  if (idx >= 0) {
    return {
      line1: title.slice(0, idx + splitAt.length),
      line2: title.slice(idx + splitAt.length).trim(),
    };
  }
  return { line1: title, line2: "" };
}

function BannerSticker({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "invite-sticker-pop absolute z-20 rounded-xl bg-white px-2 py-1 text-[10px] font-black text-[#FF5C8A] shadow-md ring-1 ring-white/80",
        className
      )}
    >
      {text}
    </span>
  );
}

function BlindboxRichHero({ motionSrc }: { motionSrc?: string | null }) {
  return (
    <div className="relative mx-auto h-[108px] w-[104px]">
      <span className="banner-pulse-ring pointer-events-none absolute left-1/2 top-[42%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
      <span className="banner-orb-drift-c pointer-events-none absolute -right-1 top-1 h-12 w-12 rounded-full bg-[#FFE8A8]/40 blur-md" />

      {BLINDBOX_TOPICS.map((t, i) => (
        <span
          key={t.label}
          className="invite-chibi-hop absolute z-20 flex items-center gap-0.5 rounded-xl bg-white/95 px-1.5 py-1 shadow-md ring-1 ring-white"
          style={{
            animationDelay: `${i * 0.25}s`,
            top: i === 0 ? "4%" : i === 1 ? "38%" : "12%",
            left: i === 0 ? "0" : i === 1 ? "-4%" : "auto",
            right: i === 2 ? "0" : "auto",
            transform: `rotate(${i === 0 ? -8 : i === 1 ? 6 : 10}deg)`,
          }}
        >
          <span className="text-xs">{t.emoji}</span>
          <span className="text-[7px] font-bold text-[#FF5C8A]">{t.label}</span>
        </span>
      ))}

      <BannerSticker text="SSR?" className="left-0 top-1 -rotate-8" />
      <BannerSticker text="惊喜" className="-right-1 bottom-8 rotate-6" />

      <div className="play-box-shake absolute left-1/2 top-[20%] z-10 flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-[20px] bg-gradient-to-br from-white/55 to-white/20 ring-2 ring-white/60 shadow-[0_8px_24px_rgba(255,255,255,0.25)] backdrop-blur-sm">
        {motionSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={motionSrc} alt="" className="h-[50px] w-[50px] object-contain" />
        ) : (
          <Gift size={30} className="text-white drop-shadow" strokeWidth={1.5} />
        )}
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC46B] text-[8px] font-black text-white">
          ?
        </span>
      </div>

      <span className="banner-twinkle absolute bottom-2 left-1/2 -translate-x-1/2 text-lg">
        ✨
      </span>
      <span
        className="banner-animate-float absolute right-0 top-6 text-sm"
        style={{ animationDelay: "0.4s" }}
      >
        🎉
      </span>
    </div>
  );
}

function BannerHero({
  variant,
  motionSrc,
}: {
  variant: BannerVisualVariant;
  motionSrc?: string | null;
}) {
  if (variant === "blindbox") {
    return <BlindboxRichHero motionSrc={motionSrc} />;
  }
  const isInvite = variant === "invite";
  const center = motionSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={motionSrc}
      alt=""
      className={cn(
        "object-contain",
        isInvite ? "h-[38px] w-[38px]" : "h-[52px] w-[52px]"
      )}
    />
  ) : variant === "creator" ? (
    <div className="relative">
      <Video size={28} className="text-white" strokeWidth={1.6} />
      <Clapperboard
        size={14}
        className="absolute -bottom-1 -right-2 text-[#FFE8A8]"
        strokeWidth={2}
      />
    </div>
  ) : variant === "gacha" ? (
    <Dices size={32} className="text-white" strokeWidth={1.6} />
  ) : variant === "member" ? (
    <Crown size={32} className="text-[#FFE8A8]" strokeWidth={2} />
  ) : (
    <Users size={26} className="text-white" strokeWidth={1.6} />
  );

  const heroSize = isInvite ? "h-[46px] w-[46px]" : "h-[54px] w-[54px]";
  const heroTop = isInvite ? "top-[20px]" : "top-[14px]";

  return (
    <div
      className={cn(
        "relative mx-auto w-[84px]",
        isInvite ? "h-[100px]" : "h-[96px]"
      )}
    >
      <span
        className={cn(
          "banner-pulse-ring pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30",
          isInvite ? "top-[38%] h-[60px] w-[60px]" : "top-1/2 h-[68px] w-[68px]"
        )}
      />

      {variant === "creator" && (
        <BannerSticker text="能发" className="-right-0.5 top-1 rotate-6" />
      )}
      {isInvite && (
        <BannerSticker text="+10" className="left-0 top-0 z-20 -rotate-6" />
      )}
      {variant === "gacha" && (
        <BannerSticker text="GO" className="-right-0.5 top-10 rotate-3" />
      )}
      {variant === "member" && (
        <BannerSticker text="¥39" className="-left-0.5 top-1 -rotate-6" />
      )}

      <div
        className={cn(
          "banner-gift-bounce absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-[16px] bg-white/25 ring-2 ring-white/45 backdrop-blur-sm",
          heroTop,
          heroSize,
          (variant === "gacha" || variant === "member") && "banner-gacha-spin"
        )}
      >
        {variant === "member" ? (
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE8A8] to-[#FFC46B] shadow-md ring-2 ring-white/60">
            {center}
          </div>
        ) : (
          center
        )}
      </div>

      {isInvite && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between">
          <span
            className="invite-chibi-hop flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs shadow-md ring-1 ring-white/80"
            style={{ animationDelay: "0s" }}
          >
            🧋
          </span>
          <span
            className="invite-chibi-hop flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs shadow-md ring-1 ring-white/80"
            style={{ animationDelay: "0.35s" }}
          >
            ✨
          </span>
        </div>
      )}

      <Sparkles
        size={12}
        className={cn(
          "banner-twinkle pointer-events-none absolute text-[#FFE8A8]",
          isInvite ? "right-0 top-1" : "right-1 top-2"
        )}
      />
      {variant === "creator" && (
        <span className="banner-animate-float absolute left-1 top-3 text-sm">
          🎬
        </span>
      )}
      {variant === "gacha" && (
        <span className="banner-animate-float absolute left-2 bottom-3 text-sm">
          🎰
        </span>
      )}
      {variant === "member" && (
        <span className="banner-animate-float absolute left-1 top-3 text-sm">
          👑
        </span>
      )}
    </div>
  );
}

function BannerMotionPreload({
  src,
  onReady,
  onFail,
}: {
  src: string;
  onReady: () => void;
  onFail: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="hidden" onLoad={onReady} onError={onFail} />
  );
}

export function CreamBannerSlide({
  tag,
  tagEmoji = "✨",
  highlight,
  line1,
  line2,
  desc,
  cta,
  onCta,
  onShellClick,
  motionSrc: motionPath,
  visual,
  perkChips,
  descLines = 2,
  withDailyTicker = false,
}: {
  tag: string;
  tagEmoji?: string;
  highlight?: string;
  line1: string;
  line2?: string;
  desc: string;
  cta: string;
  onCta: () => void;
  onShellClick?: () => void;
  motionSrc: string;
  visual: BannerVisualVariant;
  perkChips?: string[];
  /** 副标题最多行数，默认 2；发片 Banner 可设 3 减少省略 */
  descLines?: 2 | 3;
  /** 图一顶部：每日更新 + 灵感人数条 */
  withDailyTicker?: boolean;
}) {
  const [gifSrc, setGifSrc] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative h-full w-full",
        onShellClick && "cursor-pointer"
      )}
      onClick={onShellClick}
      role={onShellClick ? "button" : undefined}
      tabIndex={onShellClick ? 0 : undefined}
      onKeyDown={
        onShellClick
          ? (e) => {
              if (e.key === "Enter") onShellClick();
            }
          : undefined
      }
    >
      {motionPath ? (
        <BannerMotionPreload
          src={motionPath}
          onReady={() => setGifSrc(motionPath)}
          onFail={() => setGifSrc(null)}
        />
      ) : null}

      <div className="flex h-full flex-col px-3.5 pb-3 pt-2.5">
        {withDailyTicker ? (
          <div className="mb-2.5 shrink-0">
            <BannerDailyTicker />
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_84px] gap-2">
        <div className="flex min-w-0 flex-col justify-between">
          <div
            className={cn(
              "flex flex-wrap items-center gap-1",
              withDailyTicker && "mt-0.5"
            )}
          >
            <span className="banner-shimmer-tag inline-flex max-w-full items-center gap-1 truncate rounded-full bg-white/28 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {tagEmoji} {tag}
            </span>
            {highlight ? (
              <span className="rounded-full bg-[#FFC46B]/95 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
                {highlight}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 py-0.5">
            <h2 className="text-[19px] font-black leading-[1.12] text-white">
              {line1}
              {line2 ? (
                <>
                  <br />
                  <span className="text-[14px] font-bold leading-[1.2] text-white/95">
                    {line2}
                  </span>
                </>
              ) : null}
            </h2>
            {desc.trim() ? (
              <p className="mt-1 text-[10px] leading-[1.35] text-white/90">{desc}</p>
            ) : null}
            {perkChips?.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {perkChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-lg bg-white/22 px-1.5 py-0.5 text-[8px] font-bold text-white ring-1 ring-white/25"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCta();
            }}
            className="banner-cta-breathe flex w-fit items-center gap-1 rounded-full bg-white px-4 py-1.5 text-[11px] font-black text-[#FF5C8A] shadow-md active:scale-[0.98]"
          >
            {visual === "invite" || visual === "creator" || visual === "member" ? (
              <Zap size={13} className="fill-[#FF5C8A]" />
            ) : null}
            {cta}
          </button>
        </div>

        <div className="flex items-center justify-center pr-0.5">
          <BannerHero variant={visual} motionSrc={gifSrc} />
        </div>
        </div>
      </div>
    </div>
  );
}

/** 从 i18n 标题拆两行（邀请 Banner） */
export function bannerTitleLines(title: string) {
  return splitTwoLineTitle(title, "解锁");
}

/** 会员 Banner 标题拆两行 */
export function bannerMemberTitleLines(title: string) {
  const parts = title.split("·").map((s) => s.trim());
  return { line1: parts[0] || title, line2: parts[1] || "" };
}
