"use client";



import Link from "next/link";

import { Sparkles } from "lucide-react";

import { InspirationNoteCover } from "@/components/expression/inspiration-note-cover";

import { buildMomentsCardCopy, buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";

import { formatMomentsVibeLabel } from "@/lib/xhs/xhs-moments-fit";
import { formatXhsVibeLabel } from "@/lib/xhs/xhs-vibe-labels";

import {
  buildInspirationTargetHref,
  saveInspirationPick,
} from "@/lib/inspiration/inspiration-create-bridge";

import type { InspirationPlatformFilter } from "@/lib/xhs/xhs-feed-filters";

import type { XhsHotNote } from "@/lib/xhs/types";

import { cn } from "@/lib/utils";



function GenerateCta({ compact, label }: { compact?: boolean; label?: string }) {

  return (

    <span

      className={cn(

        "flex w-full items-center justify-center gap-0.5 rounded-full bg-black/55 font-bold text-white ring-1 ring-white/15",

        compact ? "mt-1 py-0.5 text-[8px]" : "mt-1.5 py-1 text-[9px]"

      )}

    >

      <Sparkles size={compact ? 7 : 9} />

      {label ?? "生成我的版本"}

    </span>

  );

}



type Props = {

  note: XhsHotNote;

  index?: number;

  variant?: "grid" | "rail";

  /** 首页横滑大卡（仅 rail 用） */

  hero?: boolean;

  /** 灵感页双列紧凑格（统一尺寸，无首条大卡） */

  compact?: boolean;

  showTodayBadge?: boolean;

  platform?: InspirationPlatformFilter;

};



export function InspirationNoteCard({

  note,

  index = 0,

  variant = "grid",

  hero = false,

  compact = false,

  showTodayBadge = false,

  platform = "all",

}: Props) {

  const forMoments = platform === "moments";

  const copy = forMoments ? buildMomentsCardCopy(note) : buildXhsCardCopy(note);

  const href = buildInspirationTargetHref(note, platform);

  const vibe = forMoments ? formatMomentsVibeLabel(note) : formatXhsVibeLabel(note);

  const isRail = variant === "rail";

  const isFeatured = !isRail && hero && !compact;

  const priority = index < 6;

  const ctaLabel = compact

    ? forMoments

      ? "写朋友圈"

      : "去生成"

    : forMoments

      ? "写朋友圈文案"

      : "生成小红书笔记";



  return (

    <Link

      href={href}

      prefetch={index < 4}

      onClick={() => saveInspirationPick(note, platform)}

      className={cn(

        "home-insp-card group relative overflow-hidden active:scale-[0.97]",

        isRail

          ? "block h-[140px] w-[104px] shrink-0 snap-start rounded-[16px] shadow-[0_6px_18px_rgba(255,100,140,0.18)] ring-1 ring-white/50"

          : cn(

              "block shadow-[0_4px_14px_rgba(255,100,140,0.12)] ring-1 ring-white/60 active:scale-[0.98]",

              compact ? "rounded-[14px]" : "rounded-[16px] ring-2 ring-white/50",

              isFeatured && "col-span-2"

            )

      )}

    >

      <div

        className={cn(

          "relative w-full overflow-hidden bg-[#FFF0F5]",

          isRail

            ? "h-full w-full"

            : isFeatured

              ? "aspect-[2/1]"

              : compact

                ? "aspect-[4/5]"

                : "aspect-[3/4]"

        )}

      >

        <InspirationNoteCover note={note} priority={priority} variant="rail" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {showTodayBadge ? (

          <span

            className={cn(

              "absolute right-1.5 top-1.5 rounded-md bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] font-black text-white shadow",

              compact ? "px-1.5 py-px text-[7px]" : "px-2 py-0.5 text-[8px]"

            )}

          >

            ✦ 今日

          </span>

        ) : isFeatured ? (

          <span className="absolute right-2 top-2 rounded-lg bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2 py-0.5 text-[8px] font-black text-white shadow">

            ✦ 精选

          </span>

        ) : null}

        <span

          className={cn(

            "absolute left-1.5 top-1.5 max-w-[calc(100%-2.5rem)] truncate rounded-full bg-black/50 font-bold text-white backdrop-blur-md",

            compact ? "px-1.5 py-px text-[8px]" : "px-2 py-0.5 text-[9px]"

          )}

        >

          {forMoments ? "朋友圈" : vibe}

        </span>

        <div

          className={cn(

            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent",

            compact ? "px-1.5 pb-1.5 pt-4" : "px-2 pb-2 pt-6"

          )}

        >

          <p

            className={cn(

              "font-black leading-tight text-white drop-shadow-md",

              isRail

                ? "line-clamp-2 text-[10px]"

                : isFeatured

                  ? "line-clamp-1 text-[13px]"

                  : compact

                    ? "line-clamp-2 text-[10px]"

                    : "line-clamp-2 text-[11px]"

            )}

          >

            {copy.headline}

          </p>

          {!isRail && copy.subline && (!compact || forMoments) ? (
            <p className="mt-0.5 line-clamp-1 text-[9px] font-medium text-white/75">
              {copy.subline}
            </p>
          ) : null}

          <GenerateCta compact={isRail || compact} label={isRail ? undefined : ctaLabel} />

        </div>

      </div>

    </Link>

  );

}

