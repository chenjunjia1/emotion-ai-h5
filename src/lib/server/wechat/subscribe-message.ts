import { getMiniProgramAccessToken } from "@/lib/server/wechat/access-token";
import { getHotTopicsSubscribeTemplateId } from "@/lib/server/wechat/config";

export type SubscribeSendResult = {
  sent: number;
  failed: number;
  skipped: boolean;
  reason?: string;
};

/**
 * 发送小程序订阅消息（热点更新）
 * 模板字段需在公众平台配置为 thing1 / thing2 等，见 docs/H5_AND_MINIPROGRAM.md
 */
export async function sendHotTopicsSubscribeBatch(opts: {
  openids: string[];
  title: string;
  summary: string;
  dateKey: string;
}): Promise<SubscribeSendResult> {
  const templateId = getHotTopicsSubscribeTemplateId();
  if (!templateId) {
    return { sent: 0, failed: 0, skipped: true, reason: "no_template_id" };
  }
  const token = await getMiniProgramAccessToken();
  if (!token) {
    return { sent: 0, failed: 0, skipped: true, reason: "no_access_token" };
  }

  let sent = 0;
  let failed = 0;
  const page = "pages/index/index";

  for (const openid of opts.openids) {
    const body = {
      touser: openid,
      template_id: templateId,
      page,
      miniprogram_state:
        process.env.NODE_ENV === "production" ? "formal" : "trial",
      lang: "zh_CN",
      data: {
        thing1: { value: opts.title.slice(0, 20) },
        thing2: { value: opts.summary.slice(0, 20) },
        date3: { value: opts.dateKey },
      },
    };

    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (data.errcode === 0) sent += 1;
    else {
      failed += 1;
      if (failed <= 3) {
        console.warn("[wechat] subscribe send fail", openid.slice(0, 6), data);
      }
    }
  }

  return { sent, failed, skipped: false };
}
