import { NextResponse } from "next/server";
import { isServerBackendEnabled } from "@/lib/server/config";
import { countSmsToday, saveSmsLog } from "@/lib/server/db/v1";
import { sendLoginSms } from "@/lib/server/sms";
import { isValidMobile } from "@/lib/server/auth-request";

export async function POST(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  let mobile = "";
  try {
    const body = await req.json();
    mobile = String(body.mobile || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!isValidMobile(mobile)) {
    return NextResponse.json({ error: "invalid_mobile" }, { status: 400 });
  }

  const today = await countSmsToday(mobile);
  if (today >= 5) {
    return NextResponse.json({ error: "sms_daily_limit" }, { status: 429 });
  }

  try {
    const { code, dev } = await sendLoginSms(mobile);
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    await saveSmsLog({ mobile, code, ip, status: "sent", expiredAt });

    return NextResponse.json({
      ok: true,
      dev,
      message: dev ? "dev_mode_check_server_logs" : "sent",
    });
  } catch {
    return NextResponse.json({ error: "sms_send_failed" }, { status: 500 });
  }
}
