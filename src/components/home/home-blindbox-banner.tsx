"use client";

import { useRouter } from "next/navigation";
import { Gift, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

/**
 * 首页主 Banner · 奶油盲盒风（单页、不轮播，避免控件遮挡）
 */
export function HomeBlindboxBanner() {
  const router = useRouter();
  const { tr, showToast } = useApp();

  const onCta = () => {
    showToast(tr("bannerBlindboxToast"));
    router.push("/publish-pack");
  };

  return (
    <section
      className={cn(
        "relative h-[190px] w-full max-w-full overflow-hidden rounded-[30px]",
        "bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
        "shadow-[0_12px_32px_rgba(255,107,107,0.22)]"
      )}
    >
      {/* 柔光 */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-28 rounded-full bg-[#FFC46B]/30 blur-2xl" />

      {/* 小星星 */}
      <Sparkles
        size={12}
        className="banner-twinkle pointer-events-none absolute right-[88px] top-4 text-white/70"
      />
      <Sparkles
        size={10}
        className="banner-twinkle pointer-events-none absolute right-[100px] top-10 text-white/50"
        style={{ animationDelay: "0.6s" }}
      />

      <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_88px] gap-2 px-4 py-4">
        <div className="flex min-w-0 flex-col justify-between">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
            ✨ {tr("bannerBlindboxTag")}
          </span>

          <div className="min-w-0 py-1">
            <h2 className="text-[22px] font-black leading-[1.15] text-white">
              {tr("bannerBlindboxTitle")}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-[1.4] text-white/90">
              {tr("bannerBlindboxDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={onCta}
            className="w-fit shrink-0 rounded-full bg-white px-5 py-2 text-xs font-black text-[#FF5C8A] shadow-md active:scale-[0.98]"
          >
            {tr("bannerBlindboxCta")}
          </button>
        </div>

        {/* 盲盒 / 礼盒 */}
        <div className="flex items-center justify-center">
          <div className="banner-gift-float relative flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-white/20 ring-2 ring-white/40 backdrop-blur-sm">
            <Gift size={36} className="text-white drop-shadow-sm" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFC46B] text-[9px] font-black text-white shadow">
              ?
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
