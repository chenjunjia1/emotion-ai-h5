"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, ChevronRight, Gift, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";

/**
 * 轮播第 2 屏：盲盒爆款文案 + AI 情绪助手（双入口，项目粉橙主色）
 */
export function HomeAttractCarouselSlide() {
  const router = useRouter();
  const { tr, showToast } = useApp();

  return (
    <div className="flex h-full flex-col justify-between px-3.5 pb-9 pt-3">
      <div className="flex items-center gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/28 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
          <Sparkles size={10} />
          今日灵感
        </span>
        <span className="rounded-full bg-[#FFC46B]/95 px-1.5 py-0.5 text-[8px] font-black text-white">
          新玩法
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 py-2">
        <Link
          href="/topic-box"
          onClick={() => showToast(tr("bannerBlindboxToast"))}
          className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-white/20 p-2.5 ring-1 ring-white/40 backdrop-blur-sm active:scale-[0.98]"
        >
          <span className="banner-gift-bounce flex h-10 w-10 items-center justify-center rounded-2xl bg-white/30 ring-1 ring-white/50">
            <Gift size={22} className="text-white drop-shadow" strokeWidth={1.6} />
          </span>
          <div>
            <p className="text-[13px] font-black leading-tight text-white">
              {tr("bannerBlindboxTitle")}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-white/88">
              {tr("bannerBlindboxDesc")}
            </p>
          </div>
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-black text-white">
            开盲盒
            <ChevronRight size={11} />
          </span>
          <span className="pointer-events-none absolute -right-2 -top-2 text-lg opacity-70">
            🎁
          </span>
        </Link>

        <button
          type="button"
          onClick={() => {
            showToast("聊聊创作与情绪，点发送再生成建议");
            router.push("/emotion-chat");
          }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-white/20 p-2.5 text-left ring-1 ring-white/40 backdrop-blur-sm active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-white/55 to-white/25 ring-1 ring-white/50">
            <Bot size={22} className="text-white drop-shadow" strokeWidth={1.6} />
          </span>
          <div>
            <p className="text-[13px] font-black leading-tight text-white">AI 情绪助手</p>
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-white/88">
              选题 · 标题 · 起号复盘，像朋友一样聊创作
            </p>
          </div>
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-black text-white">
            去聊天
            <ChevronRight size={11} />
          </span>
          <span className="pointer-events-none absolute -right-1 bottom-6 text-sm opacity-80">
            💬
          </span>
        </button>
      </div>

      <p className="text-center text-[8px] font-semibold text-white/75">
        盲盒抽爆款方向 · 助手帮你改标题与脚本
      </p>
    </div>
  );
}
