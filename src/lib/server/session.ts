import { createHmac, timingSafeEqual } from "crypto";
import type { User } from "@/lib/types/v1";

export const SESSION_COOKIE = "sv_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export interface SessionPayload {
  userId: string;
  mobile: string;
  role: "user" | "admin";
  exp: number;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString(
    "utf8"
  );
}

export function signSession(payload: Omit<SessionPayload, "exp">, secret: string): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(full));
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifySession(token: string, secret: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(fromB64url(body)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.userId || !payload.mobile) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    mobile: String(row.mobile),
    role: row.role === "admin" ? "admin" : "user",
    plan: (row.plan as User["plan"]) || "free",
    dailyQuota: Number(row.daily_quota ?? 3),
    usedCount: Number(row.used_count ?? 0),
    bonusQuota: Number(row.bonus_quota ?? 0),
    videoCoin: Number(row.video_coin ?? 0),
    frozenVideoCoin: Number(row.frozen_video_coin ?? 0),
    membershipExpireAt: row.membership_expire_at
      ? String(row.membership_expire_at)
      : undefined,
    language: row.language === "en" ? "en" : "zh",
  };
}
