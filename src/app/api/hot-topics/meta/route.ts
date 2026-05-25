import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { hotTopicLibraryMeta } from "@/lib/hot-topics/library-display";
import {
  countActiveHotTopics,
  countFeaturedHotTopics,
  getLatestBatchDate,
} from "@/lib/server/db/hot-topics-db";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

/** 今日热点库元信息：批次日期、条数、是否今日已更新 */
export async function GET(req: Request) {
  const guard = guardApi(req, { scope: "hot-topics-meta", ipLimit: 120, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  const batchDate = (await getLatestBatchDate()) ?? todayDate();
  const libraryCount = await countActiveHotTopics(batchDate);
  const todayFeatured = await countFeaturedHotTopics(batchDate);
  const library = hotTopicLibraryMeta(libraryCount);
  const isToday = batchDate === todayDate();

  return NextResponse.json({
    batchDate,
    isToday,
    total: libraryCount,
    todayFeatured,
    ...library,
    updatedAt: `${batchDate} 08:00`,
    schedule: "每日 08:00（北京时间）自动刷新",
    sources: ["TianAPI", "DailyHotApi", "DeepSeek AI 改写"],
    message: isToday
      ? "今日可拍选题已更新"
      : "展示最近一次成功更新，等待今日 8 点刷新",
  });
}
