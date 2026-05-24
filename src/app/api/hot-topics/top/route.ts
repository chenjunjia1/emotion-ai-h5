import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { fetchHotTopicsTopForApi } from "@/lib/hot-topics/hot-topics-service";

export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "hot-topics-top", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const { items, meta } = await fetchHotTopicsTopForApi(3);
  return NextResponse.json(
    { items, meta },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
