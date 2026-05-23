import { NextResponse } from "next/server";
import { getClientIp, sanitizeSessionId } from "./validate";
import { rateLimit } from "./rate-limit";

export function rateLimitResponse(
  retryAfterSec: number
): NextResponse {
  return NextResponse.json(
    { error: "请求过于频繁，请稍后再试" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

export function guardApi(
  request: Request,
  opts: {
    scope: string;
    ipLimit: number;
    ipWindowMs: number;
    sessionLimit?: number;
    sessionWindowMs?: number;
  }
): { ip: string; sessionId: string | null } | NextResponse {
  const ip = getClientIp(request);
  const ipKey = `${opts.scope}:ip:${ip}`;
  const ipCheck = rateLimit(ipKey, opts.ipLimit, opts.ipWindowMs);
  if (!ipCheck.allowed) {
    return rateLimitResponse(ipCheck.retryAfterSec);
  }

  const rawSession =
    request.headers.get("x-session-id") ||
    request.headers.get("X-Session-Id");
  const sessionId = sanitizeSessionId(rawSession);

  if (opts.sessionLimit && sessionId) {
    const sKey = `${opts.scope}:sid:${sessionId}`;
    const sCheck = rateLimit(sKey, opts.sessionLimit, opts.sessionWindowMs ?? opts.ipWindowMs);
    if (!sCheck.allowed) {
      return rateLimitResponse(sCheck.retryAfterSec);
    }
  }

  return { ip, sessionId };
}
