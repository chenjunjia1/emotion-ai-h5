"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { picsumCoverFallback, resolveHotTopicCover } from "@/lib/content/hot-topic-covers";
import { resolveLocalHotCover } from "@/lib/content/cover-visuals";

type SceneCoverItem = {
  coverImage?: string;
  title?: string;
  topic?: string;
  track?: string;
  category?: string;
  accountType?: string;
  coverGradient?: string;
  id?: string;
};

function resolveRemoteCover(item: SceneCoverItem): string {
  if (item.coverImage?.startsWith("http")) return item.coverImage;
  const title = item.title ?? item.topic ?? "";
  const category =
    item.category ?? item.track ?? item.accountType?.replace(/号$/, "") ?? "";
  return resolveHotTopicCover({
    id: item.id ?? `${title}-${category}`,
    title,
    category,
    track: item.track ?? category,
    coverImage: item.coverImage,
  });
}

/** 内容场景封面 — 真实照片优先，本地场景 SVG 兜底 */
export function ContentSceneCover({
  item,
  className,
  priority = false,
}: {
  item: SceneCoverItem;
  className?: string;
  priority?: boolean;
}) {
  const remotePrimary = useMemo(() => resolveRemoteCover(item), [item]);
  const localSrc = useMemo(() => resolveLocalHotCover(item), [item]);
  const fallbackRemote = useMemo(
    () => picsumCoverFallback(item.id ?? item.title ?? item.topic ?? "scene"),
    [item.id, item.title, item.topic]
  );

  const [src, setSrc] = useState(remotePrimary);
  const [loaded, setLoaded] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#1a1020]",
        item.coverGradient
          ? `bg-gradient-to-br ${item.coverGradient}`
          : "bg-gradient-to-br from-[#FFB8D0] to-[#FF9A6B]",
        className
      )}
    >
      {!loaded && !useLocal ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/15 via-transparent to-black/20" />
      ) : null}

      {useLocal ? (
        <img
          src={localSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          draggable={false}
        />
      ) : (
        <img
          key={src}
          src={src}
          alt={item.title ?? ""}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (src === remotePrimary) {
              setSrc(fallbackRemote);
              setLoaded(false);
              return;
            }
            setUseLocal(true);
            setLoaded(true);
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
    </div>
  );
}
