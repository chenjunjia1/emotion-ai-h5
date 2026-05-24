"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";

type HotTopicCoverProps = {
  item: Pick<HotTopicDisplay, "coverImage" | "coverGradient" | "title">;
  className?: string;
  iconSize?: number;
};

export function HotTopicCover({ item, className, iconSize = 16 }: HotTopicCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = item.coverImage && !failed;

  if (showImage) {
    return (
      <img
        src={item.coverImage}
        alt={item.title}
        className={cn("h-full w-full object-cover", className)}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br", item.coverGradient, className)}>
      <Sparkles size={iconSize} className="text-white" />
    </div>
  );
}
