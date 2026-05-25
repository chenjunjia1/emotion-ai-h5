"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { PlatformBrandIcon } from "@/components/v1/platform-brand-icon";
import { PublishPackWandIcon } from "@/components/v1/publish-pack-wand-icon";
import { BANNER_PLATFORMS } from "@/lib/publish-pack/moments-options";

/** 轮播第 2 屏 — 发布包 Banner */
export function HomePublishPackCarouselSlide() {
  return (
    <Link
      href="/publish-pack"
      className="group flex h-full flex-col justify-between px-4 pb-9 pt-3.5 active:opacity-95"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[10px] font-bold text-white/90">
            <Sparkles size={12} />
            核心功能
          </p>
          <h2 className="mt-0.5 text-[17px] font-black leading-tight text-white">
            1 分钟生成发布包
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/85">
            标题 · 脚本 · 封面 · 首评 · 朋友圈文案，选平台一键生成
          </p>
          <div className="mt-2 flex items-center gap-1">
            {BANNER_PLATFORMS.map((id) => (
              <PlatformBrandIcon key={id} platform={id} size={28} />
            ))}
          </div>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#FFF0F5] shadow-lg ring-1 ring-white/80 transition group-active:scale-95">
          <PublishPackWandIcon size={24} className="text-[#FF5C8A]" />
        </span>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
        <span className="text-[10px] font-bold text-white/95">
          含 B站脚本 · 抖音 · 小红书 · 视频号 · 快手 · 朋友圈
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-black text-white">
          立即生成
          <ChevronRight size={13} />
        </span>
      </div>
    </Link>
  );
}
