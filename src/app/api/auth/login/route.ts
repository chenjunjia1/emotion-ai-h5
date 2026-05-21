import { NextResponse } from "next/server";
import {
  getSessionSecret,
  isServerBackendEnabled,
} from "@/lib/server/config";
import { getLatestValidSmsCode, upsertUserOnLogin } from "@/lib/server/db/v1";
import { isValidMobile } from "@/lib/server/auth-request";
import { sessionCookieOptions, signSession } from "@/lib/server/session";

export async function POST(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "session_not_configured" }, { status: 503 });
  }

  let mobile = "";
  let code = "";
  try {
    const body = await req.json();
    mobile = String(body.mobile || "").trim();
    code = String(body.code || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!isValidMobile(mobile) || !/^\d{4,6}$/.test(code)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }

  const record = await getLatestValidSmsCode(mobile);
  if (!record || new Date(record.expiredAt) < new Date()) {
    return NextResponse.json({ error: "code_expired" }, { status: 401 });
  }
  if (record.code !== code) {
    return NextResponse.json({ error: "code_invalid" }, { status: 401 });
  }

  const user = await upsertUserOnLogin(mobile);
  const token = signSession(
    { userId: user.id, mobile: user.mobile, role: user.role },
    secret
  );

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
