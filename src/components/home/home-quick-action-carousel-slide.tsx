"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Sparkles, Wand2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import type { I18nKey } from "@/lib/i18n";
import { fetchHomeTop3FromApi } from "@/lib/home/fetch-home-top3";
import { getCachedHomeTop3, loadHomeTop3 } from "@/lib/home/home-top3-cache";
import { buildPublishPackQuickHref } from "@/lib/publish-pack/publish-pack-links";
import { cn } from "@/lib/utils";

function timeGreetingKey(): I18nKey {
  const hour = new Date().getHours();
  if (hour < 12) return "homeGreetMorning";
  if (hour < 18) return "homeGreetAfternoon";
  return "homeGreetEvening";
}

/** 轮播第二屏：今天发什么 + 热点预填 + 快速出文案 */
export function HomeQuickActionCarouselSlide() {
  const router = useRouter();
  const { tr } = useApp();
  const [href, setHref] = useState("/publish-pack?mode=quick");
  const [topicHint, setTopicHint] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedHomeTop3();
    if (cached?.[0]) {
      setHref(buildPublishPackQuickHref(cached[0].topic));
      setTopicHint(cached[0].title);
      return;
    }
    void loadHomeTop3(fetchHomeTop3FromApi).then((picks) => {
      const top = picks?.[0];
      if (top) {
        setHref(buildPublishPackQuickHref(top.topic));
        setTopicHint(top.title);
      }
    });
  }, []);

  return (
    <div className="flex h-full flex-col px-3.5 pb-3 pt-2.5">
      <div className="relative flex min-h-0 flex-1 items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[10px] font-bold text-white/85">
            <Sparkles size={11} className="banner-twinkle shrink-0" />
            {tr(timeGreetingKey())}
          </p>
          <h2 className="mt-0.5 text-[18px] font-black leading-[1.12] text-white">
            {tr("homeQuickActionTitle")}
          </h2>
          <p className="mt-1 text-[10px] leading-snug text-white/90">
            {tr("homeQuickActionCarouselDesc")}
          </p>
          {topicHint ? (
            <p
              className="mt-1.5 line-clamp-2 rounded-full bg-white/22 px-2 py-0.5 text-[9px] font-bold leading-snug text-white ring-1 ring-white/20"
              title={topicHint}
            >
              {tr("homeQuickActionHotPrefix")}
              {topicHint}
            </p>
          ) : null}
        </div>

        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "banner-cta-breathe flex shrink-0 flex-col items-center justify-center gap-1 rounded-[16px] bg-white px-3 py-2.5",
            "text-[#FF4F8B] shadow-[0_4px_16px_rgba(0,0,0,0.14)] active:scale-[0.97]"
          )}
        >
          <Wand2 size={20} strokeWidth={2.4} />
          <span className="max-w-[52px] text-center text-[9px] font-black leading-tight">
            {tr("homeQuickActionFreeCta")}
          </span>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => router.push("/hot-topics")}
        className="mt-1 flex w-fit items-center gap-0.5 text-[10px] font-bold text-white/90 active:opacity-80"
      >
        {tr("homeQuickHotTopics")}
        <ChevronRight size={12} />
      </button>
    </div>
  );
}
