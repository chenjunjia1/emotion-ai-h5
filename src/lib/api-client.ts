import { getSessionId } from "./session";

function sessionHeaders(): HeadersInit {
  return { "x-session-id": getSessionId() };
}

export async function apiTrackEvent(
  event: string,
  payload?: Record<string, string | number>
): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...sessionHeaders(),
      },
      body: JSON.stringify({ event, payload }),
    });
  } catch {
    // 埋点失败不阻断主流程
  }
}
