"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Flame, Users } from "lucide-react";
import { ContentSceneCover } from "@/components/ui/content-scene-cover";
import { aestheticForCategory } from "@/lib/content/cover-visuals";
import { useApp } from "@/contexts/app-context";
import {
  TRENDING_GENERATIONS,
  SUCCESS_CASES,
  bumpLiveUsers,
  buildPublishPackHref,
  formatLiveUsers,
} from "@/lib/content/home-feed-mock";

export function HomeInspirationRail() {
  const { tr } = useApp();

  const cards = useMemo(() => {
    const trending = TRENDING_GENERATIONS.slice(0, 4).map((item) => {
      const aesthetic = aestheticForCategory(item.accountType.replace("\u53f7", ""), item.topic);
      return {
        id: item.id,
        title: item.label,
        topic: item.topic,
        accountType: item.accountType,
        coverImage: item.coverImage,
        coverGradient: item.grad || aesthetic.grad,
        sub: `${formatLiveUsers(bumpLiveUsers(item.baseUsers))} ${tr("homeTrendingUsing")}`,
        href: buildPublishPackHref({
          topic: item.topic,
          accountType: item.accountType,
          style: item.style,
          platform: item.platform,
          from: "home_trending",
        }),
        badge: item.contentType,
        kind: "live" as const,
        cta: tr("homeInspirationGo"),
      };
    });

    const cases = SUCCESS_CASES.slice(0, 2).map((c) => {
      const aesthetic = aestheticForCategory(c.accountType.replace("\u53f7", ""), c.topic);
      return {
        id: c.id,
        title: c.title,
        topic: c.topic,
        accountType: c.accountType,
        coverImage: c.coverImage,
        coverGradient: c.grad || aesthetic.grad,
        sub: `${c.views} ${tr("homeCaseViews")} \u00b7 ${c.likes} ${tr("homeCaseLikes")}`,
        href: buildPublishPackHref({
          topic: c.topic,
          accountType: c.accountType,
          style: c.style,
          from: "home_case",
        }),
        badge: tr("homeCasesTag"),
        kind: "case" as const,
        cta: tr("homeCaseGenSame"),
      };
    });

    return [...trending, ...cases];
  }, [tr]);

  return (
    <section className="home-section-enter overflow-hidden rounded-[22px] border border-[#FFD0E8]/70 bg-white p-3 shadow-[0_6px_24px_rgba(255,79,139,0.07)]">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white">
              <Flame size={12} />
            </span>
            <h2 className="text-[14px] font-black text-[#1F2937]">{tr("homeInspirationTitle")}</h2>
          </div>
          <p className="mt-0.5 pl-7 text-[10px] text-[#8A94A6]">{tr("homeInspirationSub")}</p>
        </div>
        <Link
          href="/hot-topics"
          className="flex shrink-0 items-center gap-0.5 text-[10px] font-black text-[#FF4F8B]"
        >
          {tr("homeInspirationMore")}
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-0.5 pl-0.5 scrollbar-none">
        {cards.map((card, i) => (
          <Link
            key={card.id}
            href={card.href}
            className="trend-card-enter w-[132px] shrink-0 overflow-hidden rounded-[18px] bg-[#FFFBFC] ring-1 ring-[#FFE8F0] active:scale-[0.97]"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="relative h-[68px] overflow-hidden">
              <ContentSceneCover
                item={{
                  id: card.id,
                  title: card.title,
                  topic: card.topic,
                  accountType: card.accountType,
                  coverImage: card.coverImage,
                  coverGradient: card.coverGradient,
                }}
                className="h-full"
                priority={i < 3}
              />
              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                {card.badge}
              </span>
              {card.kind === "live" ? (
                <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-black/40 px-1 py-0.5 text-[8px] font-bold text-white">
                  <Users size={8} />
                  {tr("homeInspirationHot")}
                </span>
              ) : (
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-[#FF4F8B]/85 px-1 py-0.5 text-[8px] font-bold text-white">
                  {tr("homeCasesTag")}
                </span>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="line-clamp-2 min-h-[2rem] text-[11px] font-black leading-snug text-[#1F2937]">
                {card.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-[9px] font-bold text-[#FF9A4D]">{card.sub}</p>
              <p className="mt-1.5 flex items-center justify-end gap-0.5 text-[9px] font-black text-[#FF4F8B]">
                {card.cta}
                <ChevronRight size={10} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
