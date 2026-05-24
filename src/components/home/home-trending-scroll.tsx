"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { TRENDING_GENERATIONS } from "@/lib/content/home-feed-mock";

export function HomeTrendingScroll() {
  const { tr } = useApp();

  return (
    <section className="home-section-enter">
      <div className="mb-3 px-0.5">
        <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeTrendingTitle")}</h2>
        <p className="mt-0.5 text-[11px] text-[#8A94A6]">{tr("homeTrendingSub")}</p>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {TRENDING_GENERATIONS.map((item, i) => (
          <Link
            key={item.id}
            href={`/publish-pack?topic=${encodeURIComponent(item.topic)}`}
            className="trend-card-enter cream-card flex w-[132px] shrink-0 flex-col rounded-[20px] p-3 active:scale-[0.97]"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="text-2xl">{item.emoji}</span>
            <h3 className="mt-2 line-clamp-2 text-[12px] font-black leading-snug text-[#1F2937]">
              {item.label}
            </h3>
            <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#FF4F8B]">
              <Users size={11} />
              {item.users} {tr("homeTrendingUsing")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
