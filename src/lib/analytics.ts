import { apiTrackEvent } from "./api-client";
import type { UserEventType } from "./types";

export function trackEvent(
  event: UserEventType,
  payload?: Record<string, string | number>
) {
  if (process.env.NODE_ENV === "development") {
    console.log("[analytics]", event, payload ?? {});
  }
  void apiTrackEvent(event, payload);
}
