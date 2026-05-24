import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { fetchHotTopicDetailForApi } from "@/lib/hot-topics/hot-topics-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const guard = guardApi(req, { scope: "hot-topics-detail", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const data = await fetchHotTopicDetailForApi(decoded);

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
