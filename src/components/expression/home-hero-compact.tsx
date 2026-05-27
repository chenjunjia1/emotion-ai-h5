"use client";

import { useEffect, useState } from "react";
import { Clapperboard, Sparkles, Wand2 } from "lucide-react";
import { HomePromptMarquee } from "@/components/expression/home-prompt-marquee";
import { BannerDailyTicker } from "@/components/home/banner-daily-ticker";
import {
  HOME_LIVE_TICKERS,
  HOME_ROTATING_PLACEHOLDERS,
} from "@/lib/mock/expression-assistant";
import { EXPRESSION_PRICING_HINT } from "@/lib/expression/pricing";
import { cn } from "@/lib/utils";

type Props = {
  input: string;
  onInputChange: (v: string) => void;
  generating: boolean;
  onGenerate: (prompt?: string) => void;
};

export function HomeHeroCompact({ input, onInputChange, generating, onGenerate }: Props) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      if (tick % 2 === 0) {
        setPlaceholderIdx((i) => (i + 1) % HOME_ROTATING_PLACEHOLDERS.length);
      } else {
        setTickerIdx((i) => (i + 1) % HOME_LIVE_TICKERS.length);
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const placeholder =
    input.trim().length > 0 ? undefined : HOME_ROTATING_PLACEHOLDERS[placeholderIdx];

  return (
    <section className="home-hero-v3-enter overflow-hidden rounded-[24px] shadow-[0_12px_40px_rgba(255,100,130,0.28)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FF5C7A] via-[#FF6B8A] to-[#FFAB5C]">
        <div
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-20 w-24 rounded-full bg-[#FFC46B]/25 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 px-3.5 pb-3 pt-3">
          <BannerDailyTicker />

          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                  <Sparkles size={10} className="fill-white/30" />
                  主打功能
                </span>
                <span className="rounded-full bg-[#FFC46B] px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                  今天就能发
                </span>
              </div>
              <h2 className="mt-2 text-[19px] font-black leading-[1.2] tracking-tight text-white">
                一句话，AI 帮你出稿
              </h2>
              <p
                key={tickerIdx}
                className="home-ticker-fade mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-white/90"
              >
                <span className="home-live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#34D399]" />
                <span className="line-clamp-1">{HOME_LIVE_TICKERS[tickerIdx]}</span>
              </p>
            </div>
            <div className="home-hero-deco flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/22 text-white ring-1 ring-white/35 backdrop-blur-sm">
              <Clapperboard size={26} strokeWidth={1.6} />
            </div>
          </div>

          <div
            className={cn(
              "mt-3 flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.1)] ring-1 ring-white/90 transition-shadow",
              focused && "ring-2 ring-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
            )}
          >
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent px-1 text-[13px] leading-snug text-[#1F2937] outline-none placeholder:text-[#B0B8C4]"
              onKeyDown={(e) => {
                if (e.key === "Enter") onGenerate();
              }}
            />
            <button
              type="button"
              disabled={generating}
              onClick={() => onGenerate()}
              className="home-cta-shimmer flex h-9 shrink-0 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-3.5 text-[12px] font-black text-white shadow-md disabled:opacity-60 active:scale-[0.97]"
            >
              <Wand2 size={14} className={generating ? "animate-spin" : undefined} />
              {generating ? "生成中" : "一键生成"}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[9px] font-medium text-white/80">
            {EXPRESSION_PRICING_HINT.quick}
          </p>

          <div className="mt-2.5 border-t border-white/15 pt-2.5">
            <HomePromptMarquee variant="on-gradient" onSelect={(text) => onGenerate(text)} />
          </div>
        </div>
      </div>
    </section>
  );
}
