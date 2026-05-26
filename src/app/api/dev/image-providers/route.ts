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

  if (providers.provider === "ark") {

    hint = "已配置火山方舟 Seedream，高级图文包将走在线推理接入点";

  } else if (xh.mock) {

    hint = "XINGHUI_MOCK=1：演示封面图。配置 ARK_API_KEY + ARK_IMAGE_ENDPOINT 可切换火山方舟";

  } else if (xh.configured) {

    hint = "使用讯飞星绘 TTI";

  } else {

    hint = "请配置 ARK_API_KEY + ARK_IMAGE_ENDPOINT，或星绘 XINGHUI_*";

  }



  return NextResponse.json({

    providers,

    ark: { configured: ark.configured, endpoint: ark.endpoint, size: ark.size },

    xinghui: xh,

    storage: { cosPresigned: isCosConfigured() },

    hint,

  });

}

