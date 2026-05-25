import { NextResponse } from "next/server";
import { aggregateXhsHotNotes } from "@/lib/xhs/aggregate-xhs-hot-notes";
import { getXhsHotNotesCacheMeta } from "@/lib/xhs/xhs-server-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";

  if (!process.env.TIKHUB_API_KEY?.trim()) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        message: "未配置 TIKHUB_API_KEY",
      },
      { status: 503 }
    );
  }

  try {
    const { notes, cached } = await aggregateXhsHotNotes({ force });
    const meta = getXhsHotNotesCacheMeta();

    return NextResponse.json({
      success: notes.length > 0,
      data: notes,
      cached,
      cachedAt: meta?.cachedAt,
      total: notes.length,
      message: notes.length ? undefined : "未获取到小红书图文，请检查 TIKHUB_API_KEY 或稍后重试",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取小红书热门图文失败";
    return NextResponse.json(
      { success: false, data: [], message },
      { status: 500 }
    );
  }
}
