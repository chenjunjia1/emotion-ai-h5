import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { getSessionSecret, isServerBackendEnabled } from "@/lib/server/config";
import { upsertUserOnMiniLogin } from "@/lib/server/db/wechat-users";
import { ensureUserInviteCode } from "@/lib/server/db/invite";
import { jscode2session } from "@/lib/server/wechat/mini-auth";
import { isWechatMiniConfigured } from "@/lib/server/wechat/config";
import { sessionCookieOptions, signSession } from "@/lib/server/session";

/**
 * 小程序登录：wx.login code → openid → 会话 token
 * 返回 token 供小程序 Authorization: Bearer；同时 Set-Cookie 兼容 web-view
 */
export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "wechat-mini-login",
    ipLimit: 60,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }
  if (!isWechatMiniConfigured()) {
    return NextResponse.json({ error: "wechat_mini_not_configured" }, { status: 503 });
  }

  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: "session_not_configured" }, { status: 503 });
  }

  let code = "";
  try {
    const body = await req.json();
    code = String(body.code ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  const session = await jscode2session(code);
  if ("error" in session) {
    return NextResponse.json({ error: session.error }, { status: 401 });
  }

  let user = await upsertUserOnMiniLogin({
    openid: session.openid,
    unionid: session.unionid,
  });
  const myCode = await ensureUserInviteCode(user.id, user.mobile);
  user = { ...user, inviteCode: myCode };

  const token = signSession(
    { userId: user.id, mobile: user.mobile, role: user.role },
    secret
  );

  const res = NextResponse.json({
    ok: true,
    user,
    token,
    openid: session.openid,
    needBindMobile: user.mobile.startsWith("mp_"),
  });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
