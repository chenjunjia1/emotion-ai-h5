import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import {
  getUserMiniOpenid,
  saveSubscribeLog,
} from "@/lib/server/db/wechat-users";
import { getHotTopicsSubscribeTemplateId } from "@/lib/server/wechat/config";

/** 记录用户已授权订阅消息（小程序 wx.requestSubscribeMessage 成功后调用） */
export async function POST(req: Request) {
  const guard = guardApi(req, {
    scope: "wechat-subscribe",
    ipLimit: 60,
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

  let templateId = "";
  try {
    const body = await req.json();
    templateId = String(body.templateId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const defaultTpl = getHotTopicsSubscribeTemplateId();
  const tpl = templateId || defaultTpl;
  if (!tpl) {
    return NextResponse.json({ error: "template_not_configured" }, { status: 503 });
  }

  const openid = await getUserMiniOpenid(user.id);
  if (!openid) {
    return NextResponse.json({ error: "no_mini_openid" }, { status: 400 });
  }

  await saveSubscribeLog({ userId: user.id, openid, templateId: tpl });
  return NextResponse.json({ ok: true, templateId: tpl });
}
