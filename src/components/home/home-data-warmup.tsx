"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { fetchHomeTop3FromApi } from "@/lib/home/fetch-home-top3";
import { loadHomeTop3 } from "@/lib/home/home-top3-cache";
import { apiGetHotTopics } from "@/lib/client/server-api";
import { getHotTopicsListCache, setHotTopicsListCache } from "@/lib/hot-topics/hot-topics-list-cache";

const WARM_PATHS = new Set(["/", "/hot-topics"]);

/** 仅在首页/热点页预热数据，避免其它 Tab 抢带宽 */
export function HomeDataWarmup() {
  const pathname = usePathname();
  const shouldWarm = WARM_PATHS.has(pathname);

  useEffect(() => {
    if (!shouldWarm) return;

    void loadHomeTop3(fetchHomeTop3FromApi);

    if (getHotTopicsListCache()?.items.length) return;
    void apiGetHotTopics({ platform: "all", category: "全部", batch: 0 }).then((r) => {
      if (!r.items?.length || !r.meta) return;
      setHotTopicsListCache(r.items, {
        date: r.meta.date ?? "",
        total: r.meta.total ?? r.items.length,
        updatedAt: r.meta.updatedAt ?? "08:00",
        stale: r.meta.stale,
        message: r.meta.note,
      });
    });
  }, [shouldWarm]);

  return null;
}
