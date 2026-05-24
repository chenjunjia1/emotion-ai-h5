import { NextResponse } from "next/server";
import { runHotTopicsUpdatePipeline } from "@/lib/hot-topics/update-pipeline";

function isAuthorized(req: Request): boolean {
  const secret =
    process.env.ADMIN_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

/** 手动刷新：DailyHotApi → AI 加工 → hot_topics 入库 */
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dateKey = url.searchParams.get("date")?.trim() || new Date().toISOString().slice(0, 10);

  const result = await runHotTopicsUpdatePipeline(dateKey);
  if (!result.ok) {
    return NextResponse.json({ error: "update_failed", ...result }, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  return POST(req);
}
