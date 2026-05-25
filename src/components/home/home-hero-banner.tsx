"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { CreamPlatformIcon, HOME_BANNER_PLATFORMS } from "@/components/v1/platform-cream-icon";
import { bannerLibraryLabel } from "@/lib/home/banner-hot-display";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";

/** 首页主 Banner — 矮版：平台 + 卖点一行 + 库规模角标 */
export function HomeHeroBanner() {
  const router = useRouter();
  const { tr } = useApp();
  const [creatorCount, setCreatorCount] = useState(30211);
  const [libraryTotal, setLibraryTotal] = useState<number | null>(null);
  const libraryLabel = bannerLibraryLabel(libraryTotal);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/hot-topics/meta", { cache: "no-store" });
        if (!res.ok) return;
        const meta = (await res.json()) as { total?: number; libraryTotal?: number };
        const n = meta.libraryTotal ?? meta.total;
        if (!cancelled && typeof n === "number" && n > 0) setLibraryTotal(n);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const refresh = () => setCreatorCount(getTodayInspirationCount());
    refresh();
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeoutId = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextInspirationTick());
    };
    schedule();
    const fallbackId = setInterval(refresh, 60_000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(fallbackId);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FFC98A] shadow-[0_8px_24px_rgba(255,92,138,0.28)]">
      <div className="relative px-3.5 pb-3 pt-3">
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-xl" />

        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" aria-label="支持平台">
            {HOME_BANNER_PLATFORMS.map(({ key, name }) => (
              <CreamPlatformIcon key={key} platform={name} size="banner" pixelSize={26} />
            ))}
          </div>
          <Link
            href="/hot-topics"
            className="flex shrink-0 items-center gap-1 rounded-xl bg-white/95 px-2 py-1 shadow-md active:scale-[0.97]"
          >
            <Zap size={10} className="text-[#FF4F8B]" fill="currentColor" />
            <div className="text-right leading-tight">
              <p className="text-[8px] font-bold text-[#FF6B8A]">{tr("homeBannerHotSub")}</p>
              <p className="text-[13px] font-black text-[#FF2D6F]">
                {tr("homeBannerHotBadge").replace("{count}", libraryLabel)}
              </p>
            </div>
          </Link>
        </div>

        <p className="relative mt-2.5 text-[14px] font-black leading-[1.35] text-white">
          {tr("homeBannerHook")}
          <span className="font-bold text-white/90"> {tr("homeBannerHookLine2")}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/publish-pack")}
        className="flex w-full items-center justify-center gap-1 bg-white py-2.5 text-[13px] font-black text-[#FF2D6F] active:bg-[#FFF8FB]"
      >
        {tr("bannerCreatorCta")}
        <ChevronRight size={15} strokeWidth={2.5} />
      </button>

      <p className="bg-white/10 py-1.5 text-center text-[8px] text-white/75">
        {tr("homeDailyStripCreators").replace("{count}", formatInspirationCount(creatorCount))}
      </p>
    </section>
  );
}
