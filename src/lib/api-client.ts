import type {
  GenerateFormData,
  GenerateResult,
  HistoryRecord,
} from "./types";
import { getSessionId } from "./session";

function sessionHeaders(): HeadersInit {
  return { "x-session-id": getSessionId() };
}

export interface GenerateApiResponse {
  result: GenerateResult;
  warning?: string;
}

export async function apiGenerate(
  form: GenerateFormData
): Promise<GenerateApiResponse> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...sessionHeaders(),
    },
    body: JSON.stringify(form),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "生成失败，请稍后重试");
  }
  return {
    result: data.result as GenerateResult,
    warning: data.warning as string | undefined,
  };
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

export async function apiFetchHistory(): Promise<HistoryRecord[]> {
  const res = await fetch("/api/history", {
    headers: sessionHeaders(),
  });
  const data = await res.json();
  if (!res.ok) return [];
  return data.records ?? [];
}
