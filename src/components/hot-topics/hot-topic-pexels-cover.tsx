"use client";

import { useState } from "react";
import type { TopicCoverImage } from "@/lib/getTopicCoverImage";
import { cn } from "@/lib/utils";

export function HotTopicPexelsCover({
  cover,
  title,
  className,
  priority = false,
  size = 96,
  fill = false,
  showCredit = true,
}: {
  cover: TopicCoverImage | null;
  title: string;
  className?: string;
  priority?: boolean;
  size?: 96 | 104;
  /** 铺满容器（首页 TOP3 竖卡） */
  fill?: boolean;
  /** 是否显示摄影师署名（TOP3 叠字时可关） */
  showCredit?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const src = cover?.imageUrl;
  const dim = size === 104 ? "h-[104px] w-[104px]" : "h-[96px] w-[96px]";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[#2a1520]",
        fill ? "h-full w-full min-h-0 rounded-none" : cn(dim, "rounded-[18px]"),
        className
      )}
    >
      {!cover || (!loaded && !error) ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#FFD6EC]/50 to-[#FF9A4D]/30" />
      ) : null}

      {src ? (
        <img
          key={src}
          src={src}
          alt={cover?.alt ?? title}
          width={fill ? undefined : size}
          height={fill ? undefined : size}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
        />
      ) : null}

      {error ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD6EC] to-[#FFE0C8]" />
      ) : null}

      {showCredit && cover?.source === "pexels" && cover.photographer ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-1 pb-0.5 pt-3 text-[6px] leading-tight text-white/90">
          <a
            href={cover.photographerUrl ?? "https://www.pexels.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto underline-offset-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {cover.photographer}
          </a>
          {" · Pexels"}
        </p>
      ) : null}
    </div>
  );
}
