"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDailyNotifyMessage,
  todayDateKey,
  type DailyNotifyMessage,
} from "@/lib/notifications/daily-messages";
import {
  getNotifyReadDate,
  isDailyNotifyUnread,
  markDailyNotifyRead,
  subscribeNotifyRead,
} from "@/lib/notifications/notify-read-store";

export function useAppNotifications(pendingOrderCount = 0) {
  const [readTick, setReadTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const today = todayDateKey();
  const dailyMessage: DailyNotifyMessage = useMemo(
    () => getDailyNotifyMessage(new Date()),
    [today, readTick]
  );

  useEffect(() => {
    setMounted(true);
    return subscribeNotifyRead(() => setReadTick((n) => n + 1));
  }, []);

  const dailyUnread = mounted ? isDailyNotifyUnread(today) : false;
  const showPendingBadge = pendingOrderCount > 0;
  const showDailyDot = dailyUnread && !showPendingBadge;

  const markRead = useCallback(() => {
    markDailyNotifyRead(today, dailyMessage.id);
    setReadTick((n) => n + 1);
  }, [today, dailyMessage.id]);

  return {
    dailyMessage,
    dailyUnread,
    showDailyDot,
    showPendingBadge,
    pendingCount: pendingOrderCount,
    markRead,
    readDate: getNotifyReadDate(),
  };
}
