"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShortVideoCoverPreset } from "@/lib/content/short-video-covers";

const loadedCoverUrls = new Set<string>();

const FILTER_OVERLAY: Record<ShortVideoCoverPreset["filter"], string> = {
  warm: "bg-gradient-to-br from-[#FFB8A0]/25 via-transparent to-[#FF9A4D]/15",
  moody: "bg-gradient-to-t from-black/35 via-transparent to-transparent",
  sunset: "bg-gradient-to-br from-[#FF9A4D]/28 via-transparent to-[#FF4F8B]/18",
  pet: "bg-gradient-to-t from-[#FF9A4D]/30 via-transparent to-transparent",
  food: "bg-gradient-to-br from-[#FF6B35]/22 via-transparent to-transparent",
  life: "bg-gradient-to-t from-[#FF4F8B]/22 via-transparent to-transparent",
};

type ShortVideoCoverProps = {
  preset: ShortVideoCoverPreset;
  className?: string;
  priority?: boolean;
  badge?: string;
  /** 铺满容器（TOP3 小卡片） */
  fill?: boolean;
  /** 首页横滑卡片：主标题叠在封面中央（如「情绪共鸣文案」） */
  overlayTitle?: string;
};

/** 小红书 / 抖音风封面：实景 + 轻滤镜 + 可选大字标题 */
export function ShortVideoCover({
  preset,
  className,
  priority = false,
  badge,
  overlayTitle,
  fill = false,
}: ShortVideoCoverProps) {
  const allSources = useMemo(() => {
    const list = [preset.image, ...preset.fallbacks].filter(
      (u): u is string => typeof u === "string" && u.length > 0
    );
    if (preset.localFallback && !list.includes(preset.localFallback)) {
      list.push(preset.localFallback);
    }
    return list;
  }, [preset.image, preset.fallbacks, preset.localFallback]);

  const [srcIndex, setSrcIndex] = useState(0);
  const src = allSources[srcIndex] ?? preset.localFallback ?? preset.image;
  const isBundledPhoto = src.includes("/images/covers/") && /\.(jpe?g|webp)$/i.test(src);
  const isLocalSvg = src.endsWith(".svg");
  const isLocal = src.startsWith("/") && (isLocalSvg || isBundledPhoto);
  const [loaded, setLoaded] = useState(() => loadedCoverUrls.has(src));
  const showBottomLines = !overlayTitle && preset.titleLines.length > 0;

  useEffect(() => {
    setSrcIndex(0);
    const first = allSources[0];
    if (first) setLoaded(loadedCoverUrls.has(first));
  }, [allSources]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        fill ? "h-full min-h-0" : "aspect-[3/4]",
        isLocalSvg && !isBundledPhoto
          ? "bg-gradient-to-br from-[#FFD6EC] via-[#FFF5F8] to-[#FFE0C8]"
          : "bg-[#2a1520]",
        className
      )}
    >
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#FFD6EC]/40 to-[#FF9A4D]/30" />
      ) : null}

      <img
        key={src}
        src={src}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          loaded
            ? "opacity-100 saturate-[1.08] contrast-[1.03] brightness-[1.02]"
            : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        onLoad={() => {
          loadedCoverUrls.add(src);
          setLoaded(true);
        }}
        onError={() => {
          if (srcIndex < allSources.length - 1) {
            setSrcIndex((i) => i + 1);
            setLoaded(false);
            return;
          }
          setLoaded(true);
        }}
      />

      {!isLocalSvg ? (
        <>
          <div
            className={cn("pointer-events-none absolute inset-0", FILTER_OVERLAY[preset.filter])}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5"
            aria-hidden
          />
        </>
      ) : null}

      {badge ? (
        <span className="absolute left-2 top-2 z-10 max-w-[88%] truncate rounded-md bg-black/35 px-1.5 py-0.5 text-[8px] font-bold text-white/95 backdrop-blur-sm">
          {badge}
        </span>
      ) : null}

      {overlayTitle ? (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 pb-3 pt-8">
          <p className="text-center text-[11px] font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
            {overlayTitle}
          </p>
        </div>
      ) : null}

      {showBottomLines ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 pt-6">
          {preset.titleLines.map((line, i) => (
            <p
              key={`${line}-${i}`}
              className={cn(
                "font-black leading-[1.12] tracking-tight text-white",
                "drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]",
                i === 0 ? "text-[12px]" : "mt-0.5 text-[10px] text-white/95"
              )}
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
