import { NextResponse } from "next/server";
import { isPilotLoginMobile, isPilotSmsBypass } from "@/lib/auth/login-allowlist";
import { MOCK_SMS_CODE } from "@/lib/constants/v1";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser, isValidMobile } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { isDevSmsBypassAllowed } from "@/lib/server/dev-auth";
import { getLatestValidSmsCode } from "@/lib/server/db/v1";
import { bindMiniUserMobile } from "@/lib/server/db/wechat-users";

/** 小程序用户绑定真实手机号（与 H5 账号合并） */
export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "wechat-bind-mobile",
    ipLimit: 30,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let mobile = "";
  let code = "";
  try {
    const body = await req.json();
    mobile = String(body.mobile ?? "").trim();
    code = String(body.code ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!isValidMobile(mobile) || !/^\d{4,6}$/.test(code)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }

  if (!isPilotLoginMobile(mobile)) {
    return NextResponse.json({ error: "login_mobile_not_allowed" }, { status: 403 });
  }

  const devBypass = isDevSmsBypassAllowed() && code === MOCK_SMS_CODE;
  const pilotBypass = isPilotSmsBypass(mobile, code);
  if (!devBypass && !pilotBypass) {
    const record = await getLatestValidSmsCode(mobile);
    if (!record || new Date(record.expiredAt) < new Date()) {
      return NextResponse.json({ error: "code_expired" }, { status: 401 });
    }
    if (record.code !== code) {
      return NextResponse.json({ error: "code_invalid" }, { status: 401 });
    }
  }

  try {
    const updated = await bindMiniUserMobile(user.id, mobile);
    if (!updated) {
      return NextResponse.json({ error: "bind_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bind_failed";
    if (msg === "mobile_already_bound") {
      return NextResponse.json({ error: "mobile_already_bound" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
