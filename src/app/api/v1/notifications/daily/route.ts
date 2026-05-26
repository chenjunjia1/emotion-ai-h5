import { NextResponse } from "next/server";
import { getDailyNotifyMessage } from "@/lib/notifications/daily-messages";
import { guardApi } from "@/lib/security/api-guard";
import { getLatestPushBroadcast } from "@/lib/server/db/push-broadcasts";
import { isServerBackendEnabled } from "@/lib/server/config";

/** 站内每日通知：优先服务端热点广播，否则客户端轮换文案 */
export async function GET(req: Request) {
  const guard = guardApi(req, {
    scope: "notifications-daily",
    ipLimit: 120,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const dateKey =
    url.searchParams.get("date")?.trim() ||
    new Date().toISOString().slice(0, 10);

  if (isServerBackendEnabled()) {
    const broadcast = await getLatestPushBroadcast("hot_topics_daily", dateKey);
    if (broadcast) {
      return NextResponse.json({
        source: "server",
        id: `broadcast-${broadcast.dateKey}`,
        emoji: broadcast.emoji,
        tag: "热点更新",
        title: broadcast.title,
        body: broadcast.body,
        href: broadcast.href,
        cta: "看今日热点",
        dateKey: broadcast.dateKey,
        payload: broadcast.payload,
      });
    }
  }

  const fallback = getDailyNotifyMessage(new Date(`${dateKey}T12:00:00`));
  return NextResponse.json({
    source: "client_pool",
    ...fallback,
    dateKey,
  });
}
