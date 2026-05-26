import { NextResponse } from "next/server";
import { generateDailyInspirationTitlesWithDeepSeek } from "@/lib/publish-pack/generate-daily-inspiration-deepseek";
import { runHotTopicsUpdatePipeline } from "@/lib/hot-topics/update-pipeline";
import {
  getDailyInspirationTitlesFromDb,
  saveDailyInspirationTitles,
} from "@/lib/server/db/product-v1";
import { countActiveHotTopics } from "@/lib/server/db/hot-topics-db";
import { countXhsHotNotesInDb } from "@/lib/server/db/xhs-hot-notes-db";
import { aggregateXhsHotNotes } from "@/lib/xhs/aggregate-xhs-hot-notes";
import { publishHotTopicsDailyPush } from "@/lib/server/push/hot-topics-daily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const header = req.headers.get("x-cron-secret");
  return header === secret;
}

/** Vercel Cron / 定时任务：每日生成爆品库 + 每日灵感标题 */
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  if (url.searchParams.get("probe") === "1") {
    return NextResponse.json({
      ok: true,
      probe: true,
      message: "Cron 鉴权通过；移除 ?probe=1 执行真实刷新",
    });
  }

  const dateKey = url.searchParams.get("date")?.trim() || todayDate();
  const force = url.searchParams.get("force") === "1";

  let hotSkipped = false;
  let inspSkipped = false;
  let xhsSkipped = false;

  if (!force) {
    const existingHot = await countActiveHotTopics();
    hotSkipped = existingHot >= 24;
    const existingInsp = await getDailyInspirationTitlesFromDb(dateKey);
    inspSkipped = Boolean(existingInsp && existingInsp.length >= 30);
    const existingXhs = await countXhsHotNotesInDb(dateKey);
    xhsSkipped = existingXhs >= 10;
    if (hotSkipped && inspSkipped && xhsSkipped) {
      const push = await publishHotTopicsDailyPush(dateKey, existingHot);
      return NextResponse.json({
        ok: true,
        skipped: true,
        date: dateKey,
        hotTopics: existingHot,
        inspirationTitles: existingInsp!.length,
        xhsHotNotes: existingXhs,
        push,
        message: "今日数据已齐全，传 ?force=1 强制覆盖",
      });
    }
  }

  const result: Record<string, unknown> = { ok: true, date: dateKey };

  if (!hotSkipped || force) {
    const hot = await runHotTopicsUpdatePipeline(dateKey);
    if (!hot.ok && hot.source !== "cached") {
      return NextResponse.json(
        { error: "hot_topics_save_failed", detail: hot.error, ...hot },
        { status: 500 }
      );
    }
    result.hotTopics = hot;
  } else {
    result.hotTopics = { skipped: true };
  }

  if (!inspSkipped || force) {
    const { titles, source } = await generateDailyInspirationTitlesWithDeepSeek(dateKey, 30);
    const saveInsp = await saveDailyInspirationTitles(dateKey, titles);
    if (!saveInsp.ok) {
      return NextResponse.json(
        { error: "inspiration_save_failed", detail: saveInsp.error, count: titles.length, source },
        { status: 500 }
      );
    }
    result.inspirationTitles = { count: titles.length, source, sample: titles.slice(0, 3) };
  } else {
    result.inspirationTitles = { skipped: true };
  }

  if (!xhsSkipped || force) {
    if (!process.env.TIKHUB_API_KEY?.trim()) {
      result.xhsHotNotes = { skipped: true, reason: "no_tikhub_key" };
    } else {
      const xhs = await aggregateXhsHotNotes({ force: true, dateKey });
      result.xhsHotNotes = {
        count: xhs.notes.length,
        source: xhs.source,
        cached: xhs.cached,
        sample: xhs.notes.slice(0, 2).map((n) => n.title),
      };
    }
  } else {
    result.xhsHotNotes = { skipped: true };
  }

  const activeCount = await countActiveHotTopics(dateKey);
  result.push = await publishHotTopicsDailyPush(dateKey, activeCount);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  return GET(req);
}
