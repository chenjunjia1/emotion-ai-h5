"use client";

import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { ShortVideoCover } from "@/components/ui/short-video-cover";
import { useApp } from "@/contexts/app-context";
import { HOME_SHOWCASE_CASES, buildPublishPackHref } from "@/lib/content/home-feed-mock";

export function HomeCasesSection() {
  const { tr } = useApp();

  return (
    <section className="home-section-card home-section-enter p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={16} className="text-[#FF9A4D]" />
          <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeCasesTitle")}</h2>
        </div>
        <Link
          href="/hot-topics"
          className="flex items-center gap-0.5 text-[11px] font-black text-[#FF4F8B] active:scale-95"
        >
          {tr("homeMore")}
          <ChevronRight size={13} />
        </Link>
      </div>

      <div className="-mx-0.5 flex gap-3 overflow-x-auto pb-1 pl-0.5 scrollbar-none">
        {HOME_SHOWCASE_CASES.map((c, i) => {
          const quote =
            c.coverPreset.titleLines.length > 0
              ? c.coverPreset.titleLines.join("")
              : c.title;
          const coverPreset = { ...c.coverPreset, titleLines: [] as string[] };
          return (
            <Link
              key={c.id}
              href={buildPublishPackHref({
                topic: c.topic,
                accountType: c.accountType,
                style: c.style,
                from: "home_case",
              })}
              className="trend-card-enter w-[156px] shrink-0 overflow-hidden rounded-[18px] bg-white shadow-[0_4px_16px_rgba(255,79,139,0.12)] ring-1 ring-[#FFE8F0] active:scale-[0.98]"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="relative aspect-[4/5] w-full">
                <ShortVideoCover
                  preset={coverPreset}
                  className="!aspect-auto h-full rounded-none"
                  priority={i < 2}
                  fill
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-2.5 pb-3 pt-10">
                  <p className="text-center text-[11px] font-black leading-[1.25] text-white drop-shadow-md">
                    {quote}
                  </p>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[10px] font-black text-[#FF4F8B]">{c.accountType}</p>
                <p className="mt-0.5 text-[9px] font-medium text-[#6B7280]">
                  {tr("homeCaseViews")} {c.views}
                </p>
                <span className="mt-2 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2 text-[10px] font-black text-white shadow-sm">
                  {tr("homeCaseGenSame")}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
