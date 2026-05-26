import {
  getWechatMiniCredentials,
  isWechatMiniConfigured,
} from "@/lib/server/wechat/config";

export type MiniSessionResult = {
  openid: string;
  sessionKey: string;
  unionid?: string;
};

/** 小程序 wx.login code → openid */
export async function jscode2session(
  code: string
): Promise<MiniSessionResult | { error: string }> {
  if (!isWechatMiniConfigured()) {
    return { error: "wechat_mini_not_configured" };
  }
  const { appId, appSecret } = getWechatMiniCredentials();
  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);
  url.searchParams.set("js_code", code);
  url.searchParams.set("grant_type", "authorization_code");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (data.errcode) {
    return {
      error: String(data.errmsg ?? data.errcode ?? "jscode2session_failed"),
    };
  }
  const openid = String(data.openid ?? "");
  const sessionKey = String(data.session_key ?? "");
  if (!openid || !sessionKey) {
    return { error: "invalid_wechat_session" };
  }
  return {
    openid,
    sessionKey,
    unionid: data.unionid ? String(data.unionid) : undefined,
  };
}
