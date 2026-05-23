const SESSION_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

export function sanitizeSessionId(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, 64);
  if (!SESSION_ID_RE.test(trimmed)) return null;
  return trimmed;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 45);
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 45);
  return "unknown";
}

export function clampJsonPayload(
  payload: unknown,
  maxBytes = 8192
): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  const str = JSON.stringify(payload);
  if (str.length <= maxBytes) return payload as Record<string, unknown>;
  return { _truncated: true, preview: str.slice(0, maxBytes) };
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes = 32_768
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return { ok: false, error: "请求体过大" };
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    return { ok: false, error: "请求体过大" };
  }
  if (!text.trim()) {
    return { ok: false, error: "请求体为空" };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, error: "JSON 格式无效" };
  }
}

export function safeErrorMessage(err: unknown, fallback: string): string {
  if (process.env.NODE_ENV === "development") {
    return err instanceof Error ? err.message : fallback;
  }
  return fallback;
}
