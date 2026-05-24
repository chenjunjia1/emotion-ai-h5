"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Flame } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { apiGetHotTopicsTop } from "@/lib/client/server-api";
import { enrichHotTopics, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { HotTopicCover } from "@/components/hot-topics/hot-topic-cover";
import { cn } from "@/lib/utils";

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D]"
      : rank === 2
        ? "bg-gradient-to-br from-[#FF7AAE] to-[#FFB86C]"
        : "bg-gradient-to-br from-[#FFC46B] to-[#FF9A6B]";
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm",
        colors
      )}
    >
      {rank}
    </span>
  );
}

export function HomeHotTopicsTop3() {
  const { tr, user } = useApp();
  const { hotTopics } = useProduct();
  const [items, setItems] = useState<HotTopicDisplay[]>([]);
  const [staleHint, setStaleHint] = useState<string | null>(null);

  useEffect(() => {
    if (hotTopics.length) setItems(enrichHotTopics(hotTopics).slice(0, 3));
  }, [hotTopics]);

  const load = useCallback(async () => {
    try {
      const r = await apiGetHotTopicsTop();
      if (r.items?.length) {
        setItems(enrichHotTopics(r.items).slice(0, 3));
        setStaleHint(r.meta?.stale ? r.meta.message ?? null : null);
      }
    } catch {
      /* keep empty */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const top3 = useMemo(() => items.slice(0, 3), [items]);

  if (top3.length === 0) return null;

  return (
    <section className="home-hot-spotlight -mx-1 overflow-hidden rounded-[26px] border border-[#FFD0E8]/80 bg-gradient-to-br from-[#FFF4F7] via-white to-[#FFF3E8] p-3.5 shadow-[0_8px_32px_rgba(255,79,139,0.12)]">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white">
            <Flame size={15} />
          </span>
          <div>
            <h2 className="text-[15px] font-black text-[#1F2937]">{tr("homeHotTop3Title")}</h2>
            <p className="text-[10px] font-bold text-[#FF4F8B]">{tr("homeHotSpotlightSub")}</p>
          </div>
        </div>
        <Link
          href="/hot-topics"
          className="flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#FF4F8B] shadow-sm ring-1 ring-[#FFE0EC]"
        >
          {tr("homeMore")}
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="space-y-2">
        {top3.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 rounded-[18px] bg-white/95 p-2.5 ring-1 ring-[#FFE8F0] active:scale-[0.99]"
          >
            <RankBadge rank={i + 1} />
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#FFE0EC]">
              <HotTopicCover item={item} className="rounded-xl" iconSize={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[12px] font-black text-[#1F2937]">{item.title}</p>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8A94A6]">{item.desc}</p>
              <p className="mt-0.5 text-[10px] font-bold text-[#FF4F8B]">
                {item.heatValue} · {tr("homeHotViral")} {item.viralScore}%
              </p>
            </div>
            <Link
              href={`/publish-pack?topic_id=${encodeURIComponent(item.id)}&topic=${encodeURIComponent(item.title)}`}
              className="shrink-0 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm"
            >
              {tr("homeHotGen")}
            </Link>
          </div>
        ))}
      </div>

      {staleHint ? (
        <p className="mt-2 text-center text-[10px] font-bold text-[#8A94A6]">{staleHint}</p>
      ) : null}
      {user?.plan === "free" && (
        <Link
          href="/profile?pricing=1"
          className="mt-2 block text-center text-[10px] font-bold text-[#8A94A6]"
        >
          {tr("homeHotFreeLimit")}
        </Link>
      )}
    </section>
  );
}

