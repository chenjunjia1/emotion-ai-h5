import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth-request";
import { getImageProviderStatus } from "@/services/imageService";
import { getArkConfig } from "@/services/arkImageService";
import { getXinghuiConfig } from "@/services/xinghuiImageService";
import { isCosConfigured } from "@/services/storageService";

/** 本地开发：查看配图通道配置（生产禁用；非生产需管理员登录） */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const providers = getImageProviderStatus();
  const ark = getArkConfig();
  const xh = getXinghuiConfig();

  let hint = "";
  if (providers.provider === "mock") {
    hint = "XINGHUI_MOCK=1：演示配图。接星绘企业 API 填 XINGHUI_*；接火山需 ARK_IMAGE_ENABLED=1";
  } else if (providers.provider === "xinghui") {
    hint = "使用讯飞星绘 TTI（当前未接火山）";
  } else if (providers.provider === "ark") {
    hint = "已开启火山方舟（ARK_IMAGE_ENABLED=1）";
  } else {
    hint = "请配置 XINGHUI_* 或设置 XINGHUI_MOCK=1";
  }

  return NextResponse.json({
    providers,
    ark: { configured: ark.configured, endpoint: ark.endpoint, size: ark.size },
    xinghui: xh,
    storage: { cosPresigned: isCosConfigured() },
    hint,
  });
}
