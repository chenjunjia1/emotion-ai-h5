import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { fetchHotTopicsForApi, fetchHotTopicsTopForApi, HOT_TOPICS_DISPLAY_NOTE } from "@/lib/hot-topics/hot-topics-service";

/** 兼容旧版 /api/v1/hot-topics，内部走 hot_topics 表 */
export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "hot-topics", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const topOnly = url.searchParams.get("top") === "3";

  if (topOnly) {
    const { items, meta } = await fetchHotTopicsTopForApi(3);
    return NextResponse.json({ items, meta, batch: 0 });
  }

  const { items, meta } = await fetchHotTopicsForApi({ limit: 20 });
  return NextResponse.json(
    {
      items,
      meta: {
        date: meta.batchDate,
        total: meta.total,
        libraryTotal: meta.libraryTotal,
        libraryLabel: meta.libraryLabel,
        todayActive: meta.todayActive,
        updatedAt: meta.updatedAt,
        sources: ["TianAPI", "DailyHotApi", "AI"],
        note: meta.message ?? HOT_TOPICS_DISPLAY_NOTE,
        stale: meta.stale,
      },
      batch: 0,
    },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
