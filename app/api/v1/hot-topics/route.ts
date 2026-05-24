import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { getOrCreateDailyHotTopics } from "@/lib/server/db/product-v1";
import { getDailyHotTopics, getHotTopicsMeta } from "@/lib/hot-topics/resolve-daily";
import { isServerBackendEnabled } from "@/lib/server/config";

export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "hot-topics", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const batch = Math.max(0, Number(url.searchParams.get("batch") ?? "0") || 0);
  const dateKey = new Date().toISOString().slice(0, 10);

  if (!isServerBackendEnabled()) {
    const items = getDailyHotTopics(dateKey, batch);
    return NextResponse.json(
      { items, meta: getHotTopicsMeta(dateKey), batch },
      { headers: { "Cache-Control": "private, max-age=300" } }
    );
  }

  const base = await getOrCreateDailyHotTopics();
  const items =
    batch === 0 ? base : getDailyHotTopics(dateKey, batch);
  const meta = getHotTopicsMeta(dateKey);
  meta.total = items.length;

  return NextResponse.json(
    { items, meta, batch },
    { headers: { "Cache-Control": "private, max-age=300" } }
  );
}
