"use client";

import { useEffect, useState } from "react";
import {
  getDailyNotifyMessage,
  todayDateKey,
  type DailyNotifyMessage,
} from "@/lib/notifications/daily-messages";
import { isClientServerMode } from "@/lib/client/server-api";

/** 拉取服务端热点广播（Cron 写入），失败则用本地轮换池 */
export function useServerDailyNotify(): DailyNotifyMessage & {
  fromServerBroadcast?: boolean;
} {
  const today = todayDateKey();
  const [message, setMessage] = useState<
    DailyNotifyMessage & { fromServerBroadcast?: boolean }
  >(() => getDailyNotifyMessage(new Date()));

  useEffect(() => {
    if (!isClientServerMode()) return;
    let cancelled = false;
    void fetch(`/api/v1/notifications/daily?date=${today}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.title) return;
        const fromServer = data.source === "server";
        setMessage({
          id: String(data.id ?? `broadcast-${today}`),
          emoji: String(data.emoji ?? "🔥"),
          tag: String(data.tag ?? (fromServer ? "热点已更新" : "每日贴")),
          title: String(data.title),
          body: String(data.body),
          href: data.href ? String(data.href) : "/hot-topics",
          cta: String(data.cta ?? "看今日热点"),
          fromServerBroadcast: fromServer,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [today]);

  return message;
}
