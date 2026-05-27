"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  headline: string;
  subline?: string;
  returnTo?: string;
  createHref?: string;
};

/** 创作页顶部：标明选题来自灵感库，可换一条或回创作中心 */
export function InspirationSourceBar({
  headline,
  subline = "已带入选题，可直接生成你的版本",
  returnTo = "/inspiration",
  createHref = "/create?from=inspiration",
}: Props) {
  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-gradient-to-r from-[#FFF5F8] to-[#FFFBF5] px-3 py-2.5 ring-1 ring-[#FFE8F0]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7AAE] to-[#FF9A4D] text-white shadow-[0_4px_12px_rgba(255,79,139,0.3)]">
        <Sparkles size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-[#FF4F8B]">来自灵感库</p>
        <p className="truncate text-[12px] font-black text-[#1F2937]">{headline}</p>
        {subline ? (
          <p className="truncate text-[9px] text-[#9CA3AF]">{subline}</p>
        ) : null}
      </div>
      <Link
        href={returnTo}
        className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#6B7280] ring-1 ring-[#FFE8F0] active:scale-95"
      >
        换一条
      </Link>
      <Link
        href={createHref}
        className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#FF4F8B] px-2.5 py-1 text-[10px] font-bold text-white active:scale-95"
      >
        创作
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}
