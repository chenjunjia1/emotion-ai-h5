"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { SUCCESS_CASES } from "@/lib/content/home-feed-mock";
import { cn } from "@/lib/utils";

export function HomeSuccessCases() {
  const { tr } = useApp();

  return (
    <section className="home-section-enter pb-2">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeCasesTitle")}</h2>
        <span className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-black text-[#FF4F8B]">
          {tr("homeCasesTag")}
        </span>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {SUCCESS_CASES.map((c, i) => (
          <Link
            key={c.id}
            href="/publish-pack"
            className="case-card-enter cream-card w-[140px] shrink-0 overflow-hidden rounded-[20px] active:scale-[0.97]"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={cn("h-16 bg-gradient-to-br p-3", c.grad)}>
              <TrendingUp size={18} className="text-white/90" />
            </div>
            <div className="p-3">
              <p className="text-[12px] font-black text-[#1F2937]">{c.type}</p>
              <p className="mt-1 text-[10px] text-[#8A94A6]">
                {tr("homeCaseViews")} <b className="text-[#FF4F8B]">{c.views}</b>
              </p>
              <p className="text-[10px] text-[#8A94A6]">
                {tr("homeCaseFans")} <b className="text-[#FF9A4D]">{c.fans}</b>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
