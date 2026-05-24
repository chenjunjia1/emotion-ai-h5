import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { isServerBackendEnabled } from "@/lib/server/config";
import { getOrCreateDailyInspirationTitles } from "@/lib/server/db/product-v1";
import {
  getDailyInspirationTitles,
  getInspirationMeta,
} from "@/lib/publish-pack/resolve-daily-inspiration";

export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "inspiration-titles", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const batch = Math.max(0, Number(url.searchParams.get("batch") ?? "0") || 0);
  const dateKey = new Date().toISOString().slice(0, 10);

  let titles: string[];
  try {
    titles = isServerBackendEnabled()
      ? await getOrCreateDailyInspirationTitles(batch)
      : getDailyInspirationTitles(dateKey, batch, 30);
  } catch (e) {
    console.warn("[inspiration-titles]", e);
    titles = getDailyInspirationTitles(dateKey, batch, 30);
  }

  const meta = getInspirationMeta(dateKey, titles.length);
  meta.total = titles.length;

  return NextResponse.json({ titles, meta, batch });
}
