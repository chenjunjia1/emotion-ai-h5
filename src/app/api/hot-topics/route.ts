import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { fetchHotTopicsForApi } from "@/lib/hot-topics/hot-topics-service";
import { HOT_TOPIC_API_MAX_LIMIT, HOT_TOPIC_PAGE_SIZE } from "@/lib/hot-topics/types";

export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "hot-topics-list", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const limit = Math.min(
    HOT_TOPIC_API_MAX_LIMIT,
    Math.max(1, Number(url.searchParams.get("limit") ?? HOT_TOPIC_PAGE_SIZE) || HOT_TOPIC_PAGE_SIZE)
  );
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

  const { items, meta } = await fetchHotTopicsForApi({ platform, category, limit, page });

  return NextResponse.json(
    { items, meta, page, limit },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
