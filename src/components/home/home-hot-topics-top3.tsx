"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Flame } from "lucide-react";
import { HotTopicPexelsCover } from "@/components/hot-topics/hot-topic-pexels-cover";
import { useHotTopicPexelsCovers } from "@/components/hot-topics/use-hot-topic-pexels-covers";
import { ShortVideoCover } from "@/components/ui/short-video-cover";
import { xhsCoverDisplayUrl } from "@/lib/xhs/xhs-cover-url";
import { useApp } from "@/contexts/app-context";
import type { HomeCuratedPick } from "@/lib/content/home-curated-picks";
import {
  buildHomeTop3Href,
  fallbackHomeTop3Picks,
  fetchHomeTop3FromApi,
  top3PickIds,
} from "@/lib/home/fetch-home-top3";
import {
  getCachedHomeTop3,
  loadHomeTop3,
  shouldPlayTop3EnterAnim,
} from "@/lib/home/home-top3-cache";
import { cn } from "@/lib/utils";
import type { TopicCoverImage } from "@/lib/getTopicCoverImage";

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "bg-[#FF4F8B]"
      : rank === 2
        ? "bg-[#FF8A4D]"
        : "bg-[#60A5FA]";
  return (
    <span
      className={cn(
        "absolute left-2 top-2 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[10px] font-black text-white shadow-md",
        colors
      )}
    >
      {rank}
    </span>
  );
}

function Top3Skeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#F3F4F6]"
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#FFE8F0] to-[#FFF5F8]" />
        </div>
      ))}
    </>
  );
}

type CoverStage = "remote" | "pexels" | "preset";

function Top3Cover({
  pick,
  pexelsUrl,
  priority,
}: {
  pick: HomeCuratedPick;
  pexelsUrl: TopicCoverImage | null | undefined;
  priority?: boolean;
}) {
  const remoteSrc = xhsCoverDisplayUrl(pick.coverImageUrl);
  const [stage, setStage] = useState<CoverStage>(() =>
    remoteSrc ? "remote" : pexelsUrl?.imageUrl ? "pexels" : "preset"
  );

  useEffect(() => {
    setStage(remoteSrc ? "remote" : pexelsUrl?.imageUrl ? "pexels" : "preset");
  }, [pick.id, remoteSrc, pexelsUrl?.imageUrl]);

  if (stage === "remote" && remoteSrc) {
    const isLocal = remoteSrc.startsWith("/") && !remoteSrc.startsWith("/api/xhs/");
    return (
      <img
        src={remoteSrc}
        alt=""
        className="h-full w-full object-cover transition duration-300 group-active:scale-[1.03]"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        referrerPolicy={isLocal ? undefined : "no-referrer"}
        onError={() => setStage(pexelsUrl?.imageUrl ? "pexels" : "preset")}
      />
    );
  }

  if (stage === "pexels" && pexelsUrl?.imageUrl) {
    return (
      <HotTopicPexelsCover
        cover={pexelsUrl}
        title={pick.title}
        fill
        showCredit={false}
        priority={priority}
        className="transition duration-300 group-active:scale-[1.03]"
        onFailed={() => setStage("preset")}
      />
    );
  }

  return (
    <ShortVideoCover
      preset={pick.coverPreset}
      fill
      priority={priority}
      className="transition duration-300 group-active:scale-[1.03]"
    />
  );
}

/** 首页 TOP3 — 今日爆款前 3，小红书笔记封面 + 叠字 */
export function HomeHotTopicsTop3() {
  const { tr } = useApp();
  const [picks, setPicks] = useState<HomeCuratedPick[]>([]);
  const [ready, setReady] = useState(false);
  const [playEnterAnim, setPlayEnterAnim] = useState(false);
  const pickIdsRef = useRef("");

  const pexelsItems = useMemo(
    () =>
      picks.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.accountType.replace(/号$/u, ""),
      })),
    [picks]
  );
  const { covers: pexelsCovers } = useHotTopicPexelsCovers(pexelsItems);

  useEffect(() => {
    let cancelled = false;

    const applyPicks = (resolved: HomeCuratedPick[]) => {
      if (cancelled) return;
      const ids = top3PickIds(resolved);
      if (ids !== pickIdsRef.current) {
        pickIdsRef.current = ids;
        setPicks(resolved);
      }
      setReady(true);
      if (shouldPlayTop3EnterAnim()) setPlayEnterAnim(true);
    };

    const cached = getCachedHomeTop3();
    if (cached && cached.length >= 3) {
      applyPicks(cached);
      void loadHomeTop3(fetchHomeTop3FromApi).then((next) => {
        if (cancelled) return;
        const resolved = next && next.length >= 3 ? next : cached;
        applyPicks(resolved);
      });
      return () => {
        cancelled = true;
      };
    }

    void loadHomeTop3(fetchHomeTop3FromApi).then((next) => {
      const resolved = next && next.length >= 3 ? next : fallbackHomeTop3Picks();
      applyPicks(resolved);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className={cn(
        "content-auto overflow-hidden rounded-[22px] border border-[#FFD0E8]/70 bg-white p-3 shadow-[0_6px_24px_rgba(255,79,139,0.07)]",
        playEnterAnim && ready && "home-section-enter"
      )}
    >
      <div className="mb-3 flex items-end justify-between gap-2 px-0.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white">
              <Flame size={13} strokeWidth={2.5} />
            </span>
            <h2 className="text-[16px] font-black tracking-tight text-[#1F2937]">
              {tr("homeHotTop3Title")}
            </h2>
          </div>
          <p className="mt-0.5 pl-7 text-[10px] text-[#9CA3AF]">{tr("homeInspirationTop3Hint")}</p>
        </div>
        <Link
          href="/hot-topics"
          prefetch
          className="mb-0.5 flex shrink-0 items-center gap-0.5 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[10px] font-black text-[#FF4F8B] active:scale-95"
        >
          {tr("homeMore")}
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {!ready ? (
          <Top3Skeleton />
        ) : (
          picks.map((pick, i) => (
            <Link
              key={pick.id}
              href={buildHomeTop3Href(pick)}
              prefetch={i === 0}
              className={cn(
                "group relative block overflow-hidden rounded-[16px] shadow-[0_4px_16px_rgba(255,100,140,0.12)] active:scale-[0.98]",
                playEnterAnim && "home-hot-card-enter"
              )}
              style={playEnterAnim ? { animationDelay: `${i * 0.05}s` } : undefined}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F3F4F6]">
                <RankBadge rank={i + 1} />
                {i === 0 ? (
                  <span className="absolute right-2 top-2 z-10 rounded-md bg-[#FF4F8B] px-1.5 py-0.5 text-[8px] font-black text-white shadow-md">
                    {tr("homeTop1HotBadge")}
                  </span>
                ) : null}
                <Top3Cover
                  pick={pick}
                  pexelsUrl={pexelsCovers.get(pick.id)}
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 pt-6">
                  <p className="line-clamp-2 text-[11px] font-black leading-[1.25] text-white drop-shadow-sm">
                    {pick.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="rounded bg-white/20 px-1 py-0.5 text-[8px] font-bold text-white/95 backdrop-blur-sm">
                      {pick.platform}
                    </span>
                    <span className="text-[8px] font-bold text-white/80">
                      {pick.heatValue} 赞
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
