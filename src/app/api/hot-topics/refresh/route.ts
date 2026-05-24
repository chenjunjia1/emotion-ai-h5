import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { runHotTopicsUpdatePipeline } from "@/lib/hot-topics/update-pipeline";
import { getLatestBatchDate } from "@/lib/server/db/hot-topics-db";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

/** 用户点击「换一批热点」：限流触发刷新（非管理员密钥） */
export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "hot-topics-refresh", ipLimit: 6, ipWindowMs: 3600_000 });
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const batchDate = todayDate();
  const latest = await getLatestBatchDate();

  if (!force && latest === batchDate) {
    return NextResponse.json({
      ok: true,
      refreshed: false,
      batchDate: latest,
      message: "今日热点已是最新，明天 8 点自动更新",
    });
  }

  const result = await runHotTopicsUpdatePipeline(batchDate);
  if (!result.ok) {
    return NextResponse.json({ error: "refresh_failed", ...result }, { status: 500 });
  }

  return NextResponse.json({
    refreshed: true,
    ...result,
  });
}
