"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Flame, Users } from "lucide-react";
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
    const trending = TRENDING_GENERATIONS.slice(0, 4).map((item) => ({
      id: item.id,
      title: item.label,
      sub: `${formatLiveUsers(bumpLiveUsers(item.baseUsers))} ${tr("homeTrendingUsing")}`,
      href: buildPublishPackHref({
        topic: item.topic,
        accountType: item.accountType,
        style: item.style,
        platform: item.platform,
        from: "home_trending",
      }),
      coverImage: item.coverImage,
      badge: item.contentType,
      kind: "live" as const,
    }));

    const cases = SUCCESS_CASES.slice(0, 2).map((c) => ({
      id: c.id,
      title: c.title,
      sub: `${c.views} \u64ad\u653e \u00b7 ${c.likes} \u8d5e`,
      href: buildPublishPackHref({
        topic: c.topic,
        accountType: c.accountType,
        style: c.style,
        from: "home_case",
      }),
      coverImage: c.coverImage,
      badge: c.accountType,
      kind: "case" as const,
    }));

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
            <h2 className="text-[14px] font-black text-[#1F2937]">{"\u7075\u611f\u5feb\u9009"}</h2>
          </div>
          <p className="mt-0.5 pl-7 text-[10px] text-[#8A94A6]">
            {"\u5b9e\u65f6\u70ed\u95e8 + \u7206\u6b3e\u6848\u4f8b\uff0c\u70b9\u5373\u751f\u6210"}
          </p>
        </div>
        <Link href="/hot-topics" className="shrink-0 text-[10px] font-black text-[#FF4F8B]">
          {"\u66f4\u591a\u70ed\u70b9 \u203a"}
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
              <img
                src={card.coverImage}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                {card.badge}
              </span>
              {card.kind === "live" ? (
                <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-black/40 px-1 py-0.5 text-[8px] font-bold text-white">
                  <Users size={8} />
                  {"\u70ed"}
                </span>
              ) : (
                <span className="absolute bottom-1.5 right-1.5 rounded-md bg-[#FF4F8B]/85 px-1 py-0.5 text-[8px] font-bold text-white">
                  {"\u540c\u6b3e"}
                </span>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="line-clamp-2 min-h-[2rem] text-[11px] font-black leading-snug text-[#1F2937]">
                {card.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-[9px] font-bold text-[#FF9A4D]">{card.sub}</p>
              <p className="mt-1.5 flex items-center justify-end gap-0.5 text-[9px] font-black text-[#FF4F8B]">
                {"\u53bb\u751f\u6210"}
                <ChevronRight size={10} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
