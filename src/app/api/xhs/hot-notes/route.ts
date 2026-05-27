import { NextResponse } from "next/server";
import { aggregateXhsHotNotes } from "@/lib/xhs/aggregate-xhs-hot-notes";
import { getCachedInspirationPool } from "@/lib/xhs/inspiration-pool-cache";
import type { XhsHotNote } from "@/lib/xhs/types";
import { getXhsHotNotesCacheMeta } from "@/lib/xhs/xhs-server-cache";
import { getXhsHotNotesDataRevision, todayDateKey } from "@/lib/server/db/xhs-hot-notes-db";

function applyPoolLimit(list: XhsHotNote[], limit: number): XhsHotNote[] {
  return limit > 0 ? list.slice(0, limit) : list;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const refreshTikhub =
    searchParams.get("refresh") === "1" ||
    searchParams.get("refreshTikhub") === "1" ||
    force;
  const inspirationPool = searchParams.get("pool") === "inspiration";
  const limitRaw = parseInt(searchParams.get("limit") ?? "0", 10);
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 300) : 0;

  if (searchParams.get("meta") === "1") {
    const dateKey = searchParams.get("date") ?? todayDateKey();
    const { dataRevision } = await getXhsHotNotesDataRevision(dateKey);
    return NextResponse.json({
      dateKey,
      dataRevision,
    });
  }

  if (!process.env.TIKHUB_API_KEY?.trim()) {
    const dateKey = todayDateKey();
    const { dataRevision } = await getXhsHotNotesDataRevision(dateKey);
    const { notes: raw, cached, cachedAt, source } = await aggregateXhsHotNotes({
      force: true,
      refreshTikhub,
    });
    const revision = dataRevision ?? cachedAt ?? null;
    const pool = inspirationPool
      ? getCachedInspirationPool(raw, revision)
      : raw;
    const notes = applyPoolLimit(pool, limit);

    return NextResponse.json(
      {
        success: notes.length > 0,
        data: notes,
        cached,
        source,
        cachedAt: cachedAt ?? revision ?? undefined,
        dataRevision: revision ?? undefined,
        total: pool.length,
        message: notes.length ? undefined : "未配置 TIKHUB_API_KEY，且库内无今日热点数据",
      },
      {
        headers: inspirationPool
          ? { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" }
          : undefined,
      }
    );
  }

  try {
    const { notes: raw, cached, cachedAt, source } = await aggregateXhsHotNotes({
      force,
      refreshTikhub,
    });
    const meta = getXhsHotNotesCacheMeta();
    const dbRev = await getXhsHotNotesDataRevision();
    const dataRevision =
      dbRev.dataRevision ?? cachedAt ?? meta?.dataRevision ?? undefined;
    const pool = inspirationPool
      ? getCachedInspirationPool(raw, dataRevision ?? null)
      : raw;
    const notes = applyPoolLimit(pool, limit);

    return NextResponse.json(
      {
        success: notes.length > 0,
        data: notes,
        cached,
        source,
        cachedAt: cachedAt ?? dataRevision,
        dataRevision,
        total: pool.length,
        message: notes.length ? undefined : "未获取到小红书热门图文，请检查 TIKHUB_API_KEY 或稍后重试",
      },
      {
        headers: inspirationPool
          ? { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" }
          : undefined,
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取小红书热门图文失败";
    return NextResponse.json(
      { success: false, data: [], message },
      { status: 500 }
    );
  }
}
