import { todayDateKey } from "@/lib/notifications/daily-messages";

const READ_DATE_KEY = "emotion_notify_read_date";
const LAST_MSG_ID_KEY = "emotion_notify_last_msg_id";

export function getNotifyReadDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(READ_DATE_KEY);
  } catch {
    return null;
  }
}

export function isDailyNotifyUnread(today = todayDateKey()): boolean {
  return getNotifyReadDate() !== today;
}

export function markDailyNotifyRead(today = todayDateKey(), messageId?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READ_DATE_KEY, today);
    if (messageId) localStorage.setItem(LAST_MSG_ID_KEY, messageId);
    window.dispatchEvent(new CustomEvent("emotion-notify-read"));
  } catch {
    /* ignore */
  }
}

export function subscribeNotifyRead(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("emotion-notify-read", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("emotion-notify-read", handler);
    window.removeEventListener("storage", handler);
  };
}
