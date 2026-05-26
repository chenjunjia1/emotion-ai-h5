import { cookies } from "next/headers";
import { isPilotLoginMobile } from "@/lib/auth/login-allowlist";
import { getSessionSecret, isServerBackendEnabled } from "@/lib/server/config";
import { findUserById } from "@/lib/server/db/v1";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/server/session";
import type { User } from "@/lib/types/v1";

export async function getSessionFromRequest(): Promise<SessionPayload | null> {
  if (!isServerBackendEnabled()) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const jar = await cookies();
  let token = jar.get(SESSION_COOKIE)?.value;

  if (!token) {
    const { headers } = await import("next/headers");
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      token = auth.slice(7).trim();
    }
  }

  if (!token) return null;
  return verifySession(token, secret);
}

export async function requireUser(): Promise<User | null> {
  const session = await getSessionFromRequest();
  if (!session) return null;
  return findUserById(session.userId);
}

export async function requireAdmin(): Promise<User | null> {
  const user = await requireUser();
  if (!user || user.role !== "admin" || !isPilotLoginMobile(user.mobile)) return null;
  return user;
}

export function isValidMobile(mobile: string): boolean {
  return /^1\d{10}$/.test(mobile);
}
