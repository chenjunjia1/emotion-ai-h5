import { NextResponse } from "next/server";
import { fallbackHomeTop3Picks } from "@/lib/home/fetch-home-top3";
import { resolveHomeTop3FromNotes } from "@/lib/home/resolve-home-top3";
import { aggregateXhsHotNotes } from "@/lib/xhs/aggregate-xhs-hot-notes";
import { getXhsHotNotesDataRevision } from "@/lib/server/db/xhs-hot-notes-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 首页 TOP3 轻量接口：只返回 3 条卡片，避免下发整池灵感数据 */
export async function GET() {
  try {
    const { notes: raw } = await aggregateXhsHotNotes({ force: false });
    const dbRev = await getXhsHotNotesDataRevision();
    const picks =
      resolveHomeTop3FromNotes(raw, dbRev.dataRevision) ?? fallbackHomeTop3Picks();

    return NextResponse.json(
      {
        success: picks.length >= 3,
        data: picks,
        cachedAt: dbRev.dataRevision ?? undefined,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "top3_failed";
    return NextResponse.json(
      {
        success: false,
        data: fallbackHomeTop3Picks(),
        message,
      },
      { status: 200, headers: { "Cache-Control": "private, max-age=30" } }
    );
  }
}
