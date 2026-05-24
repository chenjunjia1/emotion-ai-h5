"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isPlaceholderHotCover,
  picsumCoverFallback,
  resolveHotTopicCover,
} from "@/lib/content/hot-topic-covers";
import type { HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";

type HotTopicCoverProps = {
  item: Pick<
    HotTopicDisplay,
    "coverImage" | "coverGradient" | "title" | "track" | "category" | "id"
  >;
  className?: string;
  iconSize?: number;
};

export function HotTopicCover({ item, className, iconSize = 16 }: HotTopicCoverProps) {
  const primary = useMemo(() => {
    if (item.coverImage?.startsWith("http") && !isPlaceholderHotCover(item.coverImage)) {
      return item.coverImage;
    }
    return resolveHotTopicCover(item);
  }, [item]);

  const [src, setSrc] = useState(primary);
  const [failed, setFailed] = useState(false);

  if (!failed && src) {
    return (
      <img
        src={src}
        alt={item.title}
        className={cn("h-full w-full object-cover", className)}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (src !== picsumCoverFallback(item.id || item.title)) {
            setSrc(picsumCoverFallback(item.id || item.title));
            return;
          }
          setFailed(true);
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        item.coverGradient,
        className
      )}
    >
      <Sparkles size={iconSize} className="text-white" />
    </div>
  );
}
