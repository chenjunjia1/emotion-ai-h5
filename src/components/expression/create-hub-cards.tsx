"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CreateHubEntry } from "@/lib/mock/expression-assistant";
import { SeedreamBrandPill } from "@/components/expression/seedream-brand-pill";
import { TreeholeEntryTeaser } from "@/components/expression/treehole-entry-teaser";
import { cn } from "@/lib/utils";

const XHS_RED = "#FF2442";
const DEFAULT_PERK_CHIPS = ["真实感配图", "多图氛围", "可发小红书"];

const TOOL_ICON_TINTS = [
  "from-[#FFF0F5] to-[#FFE4EC]",
  "from-[#FFF8F0] to-[#FFECD9]",
  "from-[#F3F0FF] to-[#E8E4FF]",
  "from-[#F0FAFF] to-[#E0F4FF]",
  "from-[#FFF5F0] to-[#FFE8DC]",
  "from-[#FFF0F8] to-[#FFE0F0]",
] as const;

const TOOL_BADGE_CLASS: Record<
  NonNullable<CreateHubEntry["badgeTone"]> | "default",
  string
> = {
  hot: "bg-[#FF2442] text-white",
  new: "bg-[#FF2442]/10 text-[#FF2442]",
  skill: "bg-[#F0EBFF] text-[#7C5CDB]",
  sell: "bg-[#FFF4E8] text-[#EA580C]",
  default: "bg-[#F5F0F2] text-[#888]",
};

/** 创作 / 首页主推卡 */
export function CreateFeaturedCard({
  entry,
  perkChips = DEFAULT_PERK_CHIPS,
}: {
  entry: CreateHubEntry;
  perkChips?: string[];
}) {
  return (
    <Link
      href={entry.href}
      className="create-featured-hero group block overflow-hidden rounded-2xl border border-[#FFD6E0] bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFFBF7] shadow-[0_6px_24px_rgba(255,36,66,0.08)] active:scale-[0.99]"
    >
      <div className="border-l-[3px] border-[#FF2442] p-3.5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-[#FF2442] px-1.5 py-px text-[10px] font-semibold text-white">
                推荐
              </span>
              <SeedreamBrandPill variant="light" className="scale-90" />
              {entry.badge ? (
                <span className="rounded-md bg-white/80 px-1.5 py-px text-[9px] font-medium text-[#999] ring-1 ring-[#F0E8EC]">
                  {entry.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[17px] font-semibold leading-snug text-[#222]">
              {entry.title}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#777]">{entry.desc}</p>
            {entry.tagline ? (
              <p className="mt-1 text-[11px] text-[#AAA]">{entry.tagline}</p>
            ) : null}
            <div className="mt-2.5 flex flex-wrap gap-1">
              {perkChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md bg-[#FF2442]/6 px-2 py-0.5 text-[10px] font-medium text-[#C9184A] ring-1 ring-[#FF2442]/12"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE8F0] to-[#FFD6E4] text-[28px] shadow-inner">
            {entry.emoji}
          </span>
        </div>
        <span
          className="create-featured-cta mt-3 flex w-full items-center justify-center gap-1 rounded-full py-2.5 text-[13px] font-medium text-white transition active:opacity-90"
          style={{ backgroundColor: XHS_RED }}
        >
          开始创作
          <ArrowRight size={15} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

/** 常用工具 · 双列卡片 */
export function CreateToolTile({
  entry,
  highlighted,
  tintIndex = 0,
}: {
  entry: CreateHubEntry;
  highlighted?: boolean;
  tintIndex?: number;
}) {
  const iconTint = TOOL_ICON_TINTS[tintIndex % TOOL_ICON_TINTS.length]!;

  return (
    <Link
      href={entry.href}
      className={cn(
        "create-tool-tile flex gap-2.5 rounded-2xl border p-3 active:scale-[0.99]",
        highlighted
          ? "border-[#FF2442]/35 bg-gradient-to-b from-[#FFF8FA] to-[#FFF0F4] shadow-[0_4px_16px_rgba(255,36,66,0.1)]"
          : "border-[#F3E4EA] bg-gradient-to-b from-[#FFFCFD] to-[#FFF8FA] shadow-[0_2px_10px_rgba(255,79,139,0.05)]"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[22px] shadow-sm",
          iconTint
        )}
      >
        {entry.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-1">
          <p className="text-[14px] font-medium leading-tight text-[#333]">{entry.title}</p>
          {entry.badge ? (
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-px text-[9px] font-semibold",
                TOOL_BADGE_CLASS[entry.badgeTone ?? "default"]
              )}
            >
              {entry.badge}
            </span>
          ) : (
            <ArrowRight size={14} className="mt-0.5 shrink-0 text-[#E8D4DC]" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#888]">{entry.desc}</p>
        {entry.tags?.length ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] font-medium text-[#CC9AAA]">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function CreateTreeholeLink({
  entry,
  highlighted,
}: {
  entry: CreateHubEntry;
  highlighted?: boolean;
}) {
  return <TreeholeEntryTeaser entry={entry} highlighted={highlighted} />;
}
