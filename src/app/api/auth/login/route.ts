import { after } from "next/server";
import { NextResponse } from "next/server";
import { MOCK_SMS_CODE } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import {
  getSessionSecret,
  isServerBackendEnabled,
} from "@/lib/server/config";
import { isDevSmsBypassAllowed } from "@/lib/server/dev-auth";
import {
  findUserByMobile,
  getLatestValidSmsCode,
  upsertUserOnLogin,
} from "@/lib/server/db/v1";
import {
  ensureUserInviteCode,
  processInviteOnRegister,
} from "@/lib/server/db/invite";
import { getClientIp } from "@/lib/security/validate";
import { isValidMobile } from "@/lib/server/auth-request";
import { sessionCookieOptions, signSession } from "@/lib/server/session";

export async function POST(req: Request) {
  const guard = guardApi(req, { scope: "auth-login", ipLimit: 30, ipWindowMs: 60_000 });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "session_not_configured" }, { status: 503 });
  }

  let mobile = "";
  let code = "";
  let inviteCode = "";
  try {
    const body = await req.json();
    mobile = String(body.mobile || "").trim();
    code = String(body.code || "").trim();
    inviteCode = String(body.inviteCode || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!isValidMobile(mobile) || !/^\d{4,6}$/.test(code)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }

  const devBypass = isDevSmsBypassAllowed() && code === MOCK_SMS_CODE;
  if (!devBypass) {
    const record = await getLatestValidSmsCode(mobile);
    if (!record || new Date(record.expiredAt) < new Date()) {
      return NextResponse.json({ error: "code_expired" }, { status: 401 });
    }
    if (record.code !== code) {
      return NextResponse.json({ error: "code_invalid" }, { status: 401 });
    }
  }

  const existingBefore = await findUserByMobile(mobile);
  const isNewUser = !existingBefore;
  let user = await upsertUserOnLogin(mobile, existingBefore);
  const myCode = await ensureUserInviteCode(user.id, mobile);
  user = { ...user, inviteCode: myCode };

  const token = signSession(
    { userId: user.id, mobile: user.mobile, role: user.role },
    secret
  );

  const res = NextResponse.json({ ok: true, user, isNewUser });
  res.cookies.set(sessionCookieOptions(token));

  if (inviteCode) {
    const ip = getClientIp(req);
    after(async () => {
      try {
        await processInviteOnRegister({
          inviteeUserId: user.id,
          inviteeMobile: mobile,
          inviteCode,
          ip,
        });
      } catch (e) {
        console.error("[auth/login] invite deferred failed", e);
      }
    });
  }

  return res;
}
