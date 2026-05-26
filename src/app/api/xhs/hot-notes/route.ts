import { NextResponse } from "next/server";
import { aggregateXhsHotNotes } from "@/lib/xhs/aggregate-xhs-hot-notes";
import { getXhsHotNotesCacheMeta } from "@/lib/xhs/xhs-server-cache";
import { getXhsHotNotesDataRevision, todayDateKey } from "@/lib/server/db/xhs-hot-notes-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";

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
    const { notes, cached, cachedAt, source } = await aggregateXhsHotNotes({ force: true });
    const revision = dataRevision ?? cachedAt ?? null;

    return NextResponse.json({
      success: notes.length > 0,
      data: notes,
      cached,
      source,
      cachedAt: cachedAt ?? revision ?? undefined,
      dataRevision: revision ?? undefined,
      total: notes.length,
      message: notes.length ? undefined : "未配置 TIKHUB_API_KEY，且库内无今日热点数据",
    });
  }

  try {
    const { notes, cached, cachedAt, source } = await aggregateXhsHotNotes({ force });
    const meta = getXhsHotNotesCacheMeta();
    const dbRev = await getXhsHotNotesDataRevision();
    const dataRevision =
      dbRev.dataRevision ?? cachedAt ?? meta?.dataRevision ?? undefined;

    return NextResponse.json({
      success: notes.length > 0,
      data: notes,
      cached,
      source,
      cachedAt: cachedAt ?? dataRevision,
      dataRevision,
      total: notes.length,
      message: notes.length ? undefined : "未获取到小红书热门图文，请检查 TIKHUB_API_KEY 或稍后重试",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取小红书热门图文失败";
    return NextResponse.json(
      { success: false, data: [], message },
      { status: 500 }
    );
  }
}
