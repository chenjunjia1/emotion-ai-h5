"use client";

import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { SUCCESS_CASES, buildPublishPackHref } from "@/lib/content/home-feed-mock";
import { cn } from "@/lib/utils";

export function HomeSuccessCases() {
  const { tr } = useApp();
  const router = useRouter();

  return (
    <section className="home-section-enter pb-2">
      <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <div>
          <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeCasesTitle")}</h2>
          <p className="mt-0.5 text-[11px] text-[#8A94A6]">参考真实结构，一键生成同款方向</p>
        </div>
        <span className="rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[9px] font-black text-[#FF4F8B] ring-1 ring-[#FFD0E8]">
          {tr("homeCasesTag")}
        </span>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
        {SUCCESS_CASES.map((c, i) => (
          <article
            key={c.id}
            className="case-card-enter w-[168px] shrink-0 overflow-hidden rounded-[22px] bg-white shadow-[0_4px_20px_rgba(255,79,139,0.08)] ring-1 ring-[#FFE8F0]"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className={cn("relative h-[72px] bg-gradient-to-br p-3", c.grad)}>
              <TrendingUp size={18} className="text-white/90" />
              <span className="absolute bottom-2 right-2 rounded-md bg-black/20 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                {c.style}
              </span>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-black text-[#FF4F8B]">{c.accountType}</p>
              <h3 className="mt-1 line-clamp-2 min-h-[2.25rem] text-[11px] font-black leading-snug text-[#1F2937]">
                {c.title}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] text-[#8A94A6]">
                <p>
                  {tr("homeCaseViews")}{" "}
                  <b className="text-[#FF4F8B]">{c.views}</b>
                </p>
                <p>
                  {tr("homeCaseLikes")}{" "}
                  <b className="text-[#FF9A4D]">{c.likes}</b>
                </p>
              </div>
              <p className="mt-1.5 line-clamp-1 text-[9px] text-[#8A94A6]">
                适合 {c.targetUsers}
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    buildPublishPackHref({
                      topic: c.topic,
                      accountType: c.accountType,
                      style: c.style,
                      from: "home_case",
                    })
                  )
                }
                className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2 text-[10px] font-black text-white shadow-sm active:scale-[0.98]"
              >
                <Sparkles size={12} />
                {tr("homeCaseGenSame")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
